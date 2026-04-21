import React, { useState } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "../api/axios";

export default function ProductCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: 0,
    stock: 0,
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/api/admin/products", formData);
      alert("상품이 등록되었습니다.");
      navigate("/products"); // 등록 후 목록으로 이동
    } catch (error) {
      console.error("등록 실패:", error);
      alert("상품 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6">신규 상품 등록</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">상품명</label>
          <input type="text" name="name" onChange={handleChange} className="w-full border p-2 rounded" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">가격</label>
            <input type="number" name="price" onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">재고</label>
            <input type="number" name="stock" onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">카테고리</label>
          <select name="category" onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">선택하세요</option>
            <option value="TOP">상의</option>
            <option value="PANTS">하의</option>
            <option value="OUTER">아우터</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">상품 설명</label>
          <textarea name="description" onChange={handleChange} className="w-full border p-2 rounded h-32"></textarea>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">
          상품 등록하기
        </button>
      </form>
    </div>
  );
}