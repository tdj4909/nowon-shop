import React, { useState } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "../api/axios";

export default function UserCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // axiosInstance를 사용해서 토큰 자동 첨부 및 ApiResponse 언래핑 적용
      await axiosInstance.post("/api/admin/members", formData);
      alert(`${formData.name} 님이 성공적으로 등록되었습니다.`);
      navigate("/users"); // 등록 후 목록 페이지로 이동
    } catch (err) {
      // 검증 실패(이메일 형식, 비밀번호 길이 등) 또는 이메일 중복 메시지 표시
      const message = err instanceof Error ? err.message : "";
      alert(message || "회원 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">신규 회원 등록</h2>
        <p className="text-sm text-gray-500">새로운 관리자 또는 일반 회원을 시스템에 추가합니다.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 이름 */}
          <div>
            <label className="mb-2.5 block font-medium text-gray-700 dark:text-gray-300">이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름을 입력하세요"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700"
              required
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="mb-2.5 block font-medium text-gray-700 dark:text-gray-300">이메일 주소</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700"
              required
            />
          </div>

          {/* 초기 비밀번호 */}
          <div>
            <label className="mb-2.5 block font-medium text-gray-700 dark:text-gray-300">초기 비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-5 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700"
              required
            />
          </div>

          {/* 권한 설정 */}
          <div>
            <label className="mb-2.5 block font-medium text-gray-700 dark:text-gray-300">회원 권한</label>
            <div className="flex gap-6">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="USER"
                  checked={formData.role === "USER"}
                  onChange={handleChange}
                  className="size-4"
                />
                <span className="text-gray-700 dark:text-gray-300">일반회원</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={formData.role === "ADMIN"}
                  onChange={handleChange}
                  className="size-4"
                />
                <span className="text-gray-700 dark:text-gray-300">관리자</span>
              </label>
            </div>
          </div>

          {/* 버튼 세션 */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="rounded-lg border border-gray-300 px-8 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700"
            >
              회원 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
