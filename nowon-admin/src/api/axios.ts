import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

// 요청 인터셉터: 모든 API 요청 직전에 실행됨
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // 헤더에 Bearer 토큰 추가
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;