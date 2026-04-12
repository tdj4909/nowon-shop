import { Link } from "react-router";
import GenericTable, { Column } from "../components/tables/GenericTable";
import Badge from "../components/ui/badge/Badge";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export default function ProductList() {
  const tableData: Product[] = [
    { id: 1, name: "아이폰 15", category: "전자기기", price: 1200000, stock: 10 },
    { id: 2, name: "나이키 운동화", category: "패션", price: 89000, stock: 50 },
  ];

  const columns: Column<Product>[] = [
    { header: "ID", key: "id" },
    { header: "상품명", key: "name" },
    { header: "카테고리", key: "category" },
    {
      header: "가격",
      key: "price",
      render: (item: Product) => `${item.price.toLocaleString()}원`,
    },
    { header: "재고", key: "stock" },
    {
      header: "상태",
      key: "actions",
      render: (item: Product) => (
        <Badge color={item.stock > 0 ? "success" : "error"}>
          {item.stock > 0 ? "판매중" : "품절"}
        </Badge>
      ),
    },
    {
      header: "관리",
      key: "actions",
      render: () => (
        <div className="flex gap-2">
          <button className="text-blue-500 hover:underline">수정</button>
          <button className="text-red-500 hover:underline">삭제</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">상품 관리</h1>
        <button className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700">
          <Link
            to="/products/create"
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            <span>+ 상품 등록</span>
          </Link>
        </button>
      </div>

      <GenericTable data={tableData} columns={columns} />
    </div>
  );
}