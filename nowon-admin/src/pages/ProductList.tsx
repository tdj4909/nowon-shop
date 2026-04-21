import { Link } from "react-router";
import GenericTable, { Column } from "../components/tables/GenericTable";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  description: string;
  createdDate: string;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axiosInstance.get("/api/admin/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  const columns: Column<Product>[] = [
    { header: "ID", key: "id" },
    { header: "상품명", key: "name" },
    { header: "카테고리", key: "category" },
    { 
      header: "가격", 
      key: "price", 
      render: (p) => <span>{p.price.toLocaleString()}원</span> 
    },
    { header: "재고", key: "stock" },
    { header: "상태", key: "status" },
    { header: "설명", key: "description" },
    { header: "생성일", key: "createdDate" },
    {
      header: "관리",
      key: "actions",
      render: () => (
        <button className="text-blue-500">상세보기</button>
      )
    }
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

      <GenericTable data={products} columns={columns} />
    </div>
  );
}