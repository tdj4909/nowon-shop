import { Link } from "react-router";
import GenericTable, { Column } from "../components/tables/GenericTable";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import Badge from "../components/ui/badge/Badge";

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

const STATUS_BADGE_COLOR: Record<string, "success" | "error" | "warning"> = {
  SELL: "success",
  SOLD_OUT: "error",
  HIDE: "warning",
};

const STATUS_LABEL: Record<string, string> = {
  SELL: "판매중",
  SOLD_OUT: "품절",
  HIDE: "숨김",
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get("/api/admin/products");
      setProducts(res.data);
    } catch (err) {
      console.error("상품 목록 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: number, productName: string) => {
    if (!confirm(`"${productName}" 상품을 삭제하시겠습니까?`)) return;
    try {
      await axiosInstance.delete(`/api/admin/products/${productId}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message ?? "삭제에 실패했습니다.");
    }
  };

  const columns: Column<Product>[] = [
    { header: "ID", key: "id" },
    { header: "상품명", key: "name" },
    { header: "카테고리", key: "category" },
    {
      header: "가격",
      key: "price",
      render: (p) => <span>{p.price.toLocaleString()}원</span>,
    },
    { header: "재고", key: "stock" },
    {
      header: "상태",
      key: "status",
      render: (p) => (
        <Badge color={STATUS_BADGE_COLOR[p.status] ?? "warning"}>
          {STATUS_LABEL[p.status] ?? p.status}
        </Badge>
      ),
    },
    {
      header: "등록일",
      key: "createdDate",
      render: (p) => p.createdDate?.slice(0, 10) ?? "-",
    },
    {
      header: "관리",
      key: "actions",
      render: (p) => (
        <div className="flex gap-2">
          <Link
            to={`/products/${p.id}/edit`}
            className="text-blue-500 hover:underline text-sm"
          >
            수정
          </Link>
          <button
            className="text-red-500 hover:underline text-sm"
            onClick={() => handleDelete(p.id, p.name)}
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="p-10 text-center">데이터를 불러오는 중입니다...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">상품 관리</h1>
        <Link
          to="/products/create"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          + 상품 등록
        </Link>
      </div>
      <GenericTable data={products} columns={columns} />
    </div>
  );
}
