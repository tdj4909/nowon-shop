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

  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
        setExistingImageUrl(p.imageUrl ?? null);
      })
      .catch(() => alert("상품 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setExistingImageUrl(null); // 새 이미지 선택 시 기존 이미지 대체
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      // 새 이미지 파일이 있으면 먼저 업로드
      let imageUrl: string | null = existingImageUrl;
      if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append("file", imageFile);
        const uploadRes = await axiosInstance.post("/api/admin/images/upload", formDataImage, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.data; // ApiResponse<String>
      }

      await axiosInstance.put(`/api/admin/products/${productId}`, {
        ...formData,
        imageUrl,
      });
      alert("상품이 수정되었습니다.");
      navigate("/products");
    } catch (err: any) {
      alert(err.response?.data?.message ?? "수정 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  // 현재 표시할 이미지: 새로 선택한 파일 미리보기 > 기존 URL > 없음
  const displayImage = imagePreview ?? existingImageUrl;

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

        {/* 이미지 업로드 */}
        <div>
          <label className="block mb-1 font-medium">상품 이미지</label>
          {displayImage ? (
            <div className="relative w-48 h-48">
              <img src={displayImage} alt="상품 이미지" className="w-full h-full object-cover rounded border" />
              <button
                type="button"
                onClick={handleImageRemove}
                className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
              >
                삭제
              </button>
              <label className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 cursor-pointer">
                변경
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
              <span className="text-gray-400 text-sm">클릭하여 이미지 선택</span>
              <span className="text-gray-300 text-xs mt-1">JPG, PNG, WEBP</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="flex-1 bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "저장 중..." : "수정 완료"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded font-bold hover:bg-gray-300"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
