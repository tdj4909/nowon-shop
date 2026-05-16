import axios from "axios";
import type { AxiosResponse } from "axios";

/**
 * 백엔드 ApiResponse<T> 표준 응답 형태
 *   { success: true,  data: T,    message: string | null }
 *   { success: false, data: null, message: string }
 */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string | null;
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

// 요청 인터셉터: 모든 API 요청 직전에 토큰을 헤더에 자동 추가
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 응답 인터셉터:
 * 1. ApiResponse 래퍼를 자동으로 풀어서 res.data로 실제 데이터에 직접 접근
 * 2. 401 수신 시 토큰 삭제 후 로그인 페이지로 리다이렉트 (토큰 만료 처리)
 * 3. 에러 시 error.message에 백엔드 메시지가 들어오므로 catch에서 바로 사용 가능
 */
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const body = response.data;

    if (body && typeof body === "object" && "success" in body) {
      const envelope = body as ApiEnvelope<unknown>;
      if (envelope.success) {
        response.data = envelope.data;
        return response;
      }
      return Promise.reject(
        new Error(envelope.message ?? "요청 처리에 실패했습니다.")
      );
    }

    return response;
  },
  (error) => {
    // 401: 토큰 만료 또는 미인증 → 자동 로그아웃
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/sign-in";
      return Promise.reject(error);
    }

    // 백엔드에서 내려온 message를 error.message로 정규화
    const backendMessage = error.response?.data?.message;
    if (backendMessage) {
      error.message = backendMessage;
    }
    return Promise.reject(error);
  }
);

export default instance;
