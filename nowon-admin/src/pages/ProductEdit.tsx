import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axiosInstance from "../api/axios";

export default function ProductEdit() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: 0,
    stock: 0,
    description: "",
    status: "SELL",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get(`/api/admin/products/${productId}`)
      .then((res) => {
        const p = res.data;
        setFormData({
          name: p.name,
          category: p.category,
          price: p.price,
          stock: p.stock,
          description: p.description,
          status: p.status,
        });
      })
      .catch(() => alert("상품 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/api/admin/products/${productId}`, formData);
      alert("상품이 수정되었습니다.");
      navigate("/products");
    } catch (err: any) {
      alert(err.response?.data?.message ?? "수정 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div className="p-10 text-center">불러오는 중...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6">상품 수정</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">상품명</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">가격</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">재고</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">카테고리</label>
          <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">선택하세요</option>
            <option value="TOP">상의</option>
            <option value="PANTS">하의</option>
            <option value="OUTER">아우터</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">상태</label>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="SELL">판매중</option>
            <option value="SOLD_OUT">품절</option>
            <option value="HIDE">숨김</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">상품 설명</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded h-32" />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">
            수정 완료
          </button>
          <button type="button" onClick={() => navigate("/products")} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded font-bold hover:bg-gray-300">
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
