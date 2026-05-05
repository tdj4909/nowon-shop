import { useEffect, useState } from "react";
import GenericTable, { Column } from "../components/tables/GenericTable";
import Badge from "../components/ui/badge/Badge";
import axiosInstance from "../api/axios";

interface OrderItem {
  productId: number;
  productName: string;
  orderPrice: number;
  quantity: number;
  totalPrice: number;
}

interface Order {
  orderId: number;
  memberId: number;
  memberName: string;
  totalPrice: number;
  status: string;
  statusDescription: string;
  createdDate: string;
  orderItems: OrderItem[];
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "결제 대기" },
  { value: "PAID", label: "결제 완료" },
  { value: "SHIPPED", label: "배송 중" },
  { value: "DELIVERED", label: "배송 완료" },
  { value: "CANCELLED", label: "취소" },
];

const STATUS_BADGE_COLOR: Record<string, "warning" | "success" | "primary" | "error" | "light"> = {
  PENDING: "warning",
  PAID: "light",
  SHIPPED: "primary",
  DELIVERED: "success",
  CANCELLED: "error",
};

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get("/api/admin/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("주문 목록 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 주문 상태 변경
  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await axiosInstance.patch(`/api/admin/orders/${orderId}/status?status=${status}`);
      fetchOrders(); // 목록 갱신
    } catch (err) {
      alert("상태 변경에 실패했습니다.");
    }
  };

  // 주문 취소
  const handleCancel = async (orderId: number) => {
    if (!confirm("주문을 취소하시겠습니까?")) return;
    try {
      await axiosInstance.patch(`/api/admin/orders/${orderId}/cancel`);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message ?? "주문 취소에 실패했습니다.");
    }
  };

  const columns: Column<Order>[] = [
    { header: "주문번호", key: "orderId" },
    { header: "고객명", key: "memberName" },
    {
      header: "주문 상품",
      key: "orderItems",
      render: (item) => (
        <ul className="text-sm">
          {item.orderItems.map((oi, i) => (
            <li key={i}>{oi.productName} x {oi.quantity}</li>
          ))}
        </ul>
      ),
    },
    {
      header: "총 금액",
      key: "totalPrice",
      render: (item) => <span>{item.totalPrice.toLocaleString()}원</span>,
    },
    {
      header: "상태",
      key: "status",
      render: (item) => (
        <Badge color={STATUS_BADGE_COLOR[item.status] ?? "light"}>
          {item.statusDescription}
        </Badge>
      ),
    },
    {
      header: "주문일",
      key: "createdDate",
      render: (item) => item.createdDate?.slice(0, 10) ?? "-",
    },
    {
      header: "관리",
      key: "actions",
      render: (item) => (
        <div className="flex flex-col gap-1">
          <select
            className="border rounded px-1 py-0.5 text-sm"
            value={item.status}
            onChange={(e) => handleStatusChange(item.orderId, e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            className="text-red-500 hover:underline text-sm"
            onClick={() => handleCancel(item.orderId)}
          >
            취소
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="p-10 text-center">데이터를 불러오는 중입니다...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">주문 관리</h1>
      </div>
      <GenericTable data={orders} columns={columns} />
    </div>
  );
}
