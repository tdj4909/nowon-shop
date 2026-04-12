import GenericTable, { Column } from "../components/tables/GenericTable";
import Badge from "../components/ui/badge/Badge";

interface Order {
    id: string; // 보통 주문번호는 문자열인 경우가 많음
    customer: string;
    totalPrice: number;
    status: '배송중' | '배송완료' | '주문취소';
    date: string;
}

export default function OrderList() {
  const orderData: Order[] = [
    { id: "ORD-2026-001", customer: "김철수", totalPrice: 1200000, status: "배송중", date: "2026-04-12" },
    { id: "ORD-2026-002", customer: "이영희", totalPrice: 89000, status: "배송완료", date: "2026-04-11" },
  ];

  const columns: Column<Order>[] = [
    { header: "주문번호", key: "id" },
    { header: "고객명", key: "customer"},
    {
      header: "총 금액",
      key: "totalPrice",
      render: (item: Order) => `${item.totalPrice.toLocaleString()}원`,
    },
    {
      header: "상태",
      key: "status",
      render: (item: Order) => {
        const color = item.status === "배송완료" ? "success" : item.status === "배송중" ? "primary" : "error";
        return <Badge color={color}>{item.status}</Badge>
      },
    },
    { header: "주문일자", key: "date" },
    {
      header: "관리",
      key: "actions",
      render: () => (
        <div className="flex gap-2">
          <button className="text-blue-500 hover:underline">상세</button>
          <button className="text-red-500 hover:underline">취소</button>
        </div>
      ),
    },
  ]

    return (
        <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">주문 관리</h1>
        </div>
        <GenericTable data={orderData} columns={columns} />
        </div>
    );
}