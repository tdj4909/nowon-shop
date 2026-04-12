import React, { useState } from "react";
import { useNavigate } from "react-router";

export default function ProductCreate() {
  const navigate = useNavigate();
  
  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState({
    name: "",
    category: "전자기기",
    price: "",
    stock: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("등록될 데이터:", formData);
    alert("상품이 등록되었습니다. (콘솔 확인)");
    navigate("/products"); // 등록 후 목록으로 이동
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">새 상품 등록</h2>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 상품명 */}
          <div>
            <label className="mb-2.5 block font-medium text-gray-700 dark:text-gray-300">상품명</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="상품 이름을 입력하세요"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* 카테고리 */}
            <div>
              <label className="mb-2.5 block font-medium text-gray-700 dark:text-gray-300">카테고리</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700"
              >
                <option value="전자기기">전자기기</option>
                <option value="패션">패션</option>
                <option value="식품">식품</option>
                <option value="도서">도서</option>
              </select>
            </div>

            {/* 가격 */}
            <div>
              <label className="mb-2.5 block font-medium text-gray-700 dark:text-gray-300">가격 (원)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700"
                required
              />
            </div>
          </div>

          {/* 재고 */}
          <div>
            <label className="mb-2.5 block font-medium text-gray-700 dark:text-gray-300">초기 재고량</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700"
              required
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="mb-2.5 block font-medium text-gray-700 dark:text-gray-300">상품 설명</label>
            <textarea
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="상품 상세 설명을 입력하세요"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700"
            ></textarea>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="rounded-lg border border-gray-300 px-8 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700"
            >
              상품 등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}