import React, { useState } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "../../api/axios";

// JWT payload를 디코딩해서 role을 꺼내는 함수
function getRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export default function Signin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 응답 인터셉터가 ApiResponse를 자동 언래핑하므로 response.data가 곧 LoginResponseDTO
      const response = await axiosInstance.post("/api/auth/login", formData);
      const { accessToken } = response.data;

      const role = getRoleFromToken(accessToken);

      // ADMIN이 아니면 로그인 거부
      if (role !== "ADMIN") {
        setError("관리자 계정으로만 로그인할 수 있습니다.");
        return;
      }

      localStorage.setItem("accessToken", accessToken);
      navigate("/");
    } catch (err) {
      // 백엔드의 @Valid 검증 실패 또는 인증 실패 메시지를 그대로 사용
      const message = err instanceof Error ? err.message : "";
      setError(message || "아이디 또는 비밀번호가 일치하지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <h2 className="mb-6 text-2xl font-bold text-center">관리자 로그인</h2>
        <div className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded border p-3 outline-none focus:border-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded border p-3 outline-none focus:border-blue-500"
            required
          />
          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded border border-red-100">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 p-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </div>
      </form>
    </div>
  );
}
