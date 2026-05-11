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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      // 이미지가 있으면 먼저 업로드
      let imageUrl: string | null = null;
      if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append("file", imageFile);
        const uploadRes = await axiosInstance.post("/api/admin/images/upload", formDataImage, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.data; // ApiResponse<String>
      }

      await axiosInstance.post("/api/admin/products", {
        ...formData,
        imageUrl,
      });
      alert("상품이 등록되었습니다.");
      navigate("/products");
    } catch (error) {
      console.error("등록 실패:", error);
      alert("상품 등록 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
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
          <textarea name="description" onChange={handleChange} className="w-full border p-2 rounded h-32" />
        </div>

        {/* 이미지 업로드 */}
        <div>
          <label className="block mb-1 font-medium">상품 이미지</label>
          {imagePreview ? (
            <div className="relative w-48 h-48">
              <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover rounded border" />
              <button
                type="button"
                onClick={handleImageRemove}
                className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
              <span className="text-gray-400 text-sm">클릭하여 이미지 선택</span>
              <span className="text-gray-300 text-xs mt-1">JPG, PNG, WEBP</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "등록 중..." : "상품 등록하기"}
        </button>
      </form>
    </div>
  );
}
