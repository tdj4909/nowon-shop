import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";

interface Summary {
  totalMembers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
}

interface RecentOrder {
  orderId: number;
  memberName: string;
  totalPrice: number;
  statusDescription: string;
  createdDate: string;
}

export default function Home() {
  const [summary, setSummary] = useState<Summary>({
    totalMembers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [membersRes, productsRes, ordersRes] = await Promise.all([
          axiosInstance.get("/api/admin/members"),
          axiosInstance.get("/api/admin/products"),
          axiosInstance.get("/api/admin/orders"),
        ]);

        const orders = ordersRes.data;
        setSummary({
          totalMembers: membersRes.data.length,
          totalProducts: productsRes.data.length,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: RecentOrder & { status: string }) => o.status === "PENDING").length,
        });

        // 최근 5개 주문
        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error("대시보드 데이터 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const statCards = [
    { label: "전체 회원", value: summary.totalMembers, unit: "명", color: "bg-blue-50 text-blue-600" },
    { label: "전체 상품", value: summary.totalProducts, unit: "개", color: "bg-green-50 text-green-600" },
    { label: "전체 주문", value: summary.totalOrders, unit: "건", color: "bg-purple-50 text-purple-600" },
    { label: "결제 대기", value: summary.pendingOrders, unit: "건", color: "bg-orange-50 text-orange-600" },
  ];

  if (loading) return <div className="p-10 text-center">데이터를 불러오는 중입니다...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">대시보드</h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white">
              {card.value.toLocaleString()}
              <span className="ml-1 text-base font-medium text-gray-400">{card.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 최근 주문 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">최근 주문</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-gray-400">주문 내역이 없습니다.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 dark:border-gray-700">
                <th className="pb-3 font-medium">주문번호</th>
                <th className="pb-3 font-medium">고객명</th>
                <th className="pb-3 font-medium">금액</th>
                <th className="pb-3 font-medium">상태</th>
                <th className="pb-3 font-medium">주문일</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.orderId} className="border-b border-gray-50 dark:border-gray-800">
                  <td className="py-3 text-gray-700 dark:text-gray-300">#{order.orderId}</td>
                  <td className="py-3 text-gray-700 dark:text-gray-300">{order.memberName}</td>
                  <td className="py-3 text-gray-700 dark:text-gray-300">{order.totalPrice.toLocaleString()}원</td>
                  <td className="py-3 text-gray-500 dark:text-gray-400">{order.statusDescription}</td>
                  <td className="py-3 text-gray-500 dark:text-gray-400">{order.createdDate?.slice(0, 10) ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
