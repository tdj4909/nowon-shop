import React, { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

export default function Signin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 로그인 API 호출
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/auth/login`, formData);

      // 응답받은 토큰 추출
      const { accessToken } = response.data;

      // 로컬 스토리지에 토큰 저장
      localStorage.setItem("accessToken", accessToken);

      alert("로그인에 성공했습니다!");
      navigate("/"); // 메인 페이지로 이동
    } catch (error: any) {
      console.error("로그인 에러:", error);
      alert(error.response?.data?.message || "아이디 또는 비밀번호가 일치하지 않습니다.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <h2 className="mb-6 text-2xl font-bold text-center">로그인</h2>
        <div className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="이메일"
            onChange={handleChange}
            className="w-full rounded border p-3 outline-none focus:border-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            onChange={handleChange}
            className="w-full rounded border p-3 outline-none focus:border-blue-500"
            required
          />
          <button type="submit" className="w-full rounded bg-blue-600 p-3 font-bold text-white hover:bg-blue-700">
            로그인
          </button>
        </div>
      </form>
    </div>
  );
}