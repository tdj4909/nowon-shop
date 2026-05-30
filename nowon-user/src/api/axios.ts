import axios from 'axios'
import type { AxiosResponse } from 'axios'

/**
 * 백엔드 ApiResponse<T> 표준 응답 형태
 *   { success: true,  data: T,    message: string | null }
 *   { success: false, data: null, message: string }
 */
interface ApiEnvelope<T> {
  success: boolean
  data: T
  message: string | null
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터: 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * 응답 인터셉터:
 * 1. ApiResponse 래퍼를 자동으로 풀어서 res.data로 실제 데이터에 바로 접근
 * 2. 401 수신 시 토큰 삭제 후 로그인 페이지로 리다이렉트 (토큰 만료 처리)
 * 3. 에러의 경우 error.message에 백엔드 메시지가 들어있어 catch에서 바로 사용 가능
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const body = response.data

    // ApiResponse 형태인지 확인
    if (body && typeof body === 'object' && 'success' in body) {
      const envelope = body as ApiEnvelope<unknown>
      if (envelope.success) {
        response.data = envelope.data
        return response
      }
      return Promise.reject(new Error(envelope.message ?? '요청 처리에 실패했습니다.'))
    }

    return response
  },
  (error) => {
    // 401: 토큰 만료 또는 미인증 → 자동 로그아웃
    // 단, 로그인/회원가입 요청의 401은 자격증명 오류이므로 리다이렉트하지 않고
    // 페이지에서 직접 에러 메시지를 표시하도록 그대로 전달한다.
    const requestUrl: string = error.config?.url ?? ''
    const isAuthRequest = requestUrl.includes('/api/auth/')

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('accessToken')
      // 이미 로그인 페이지가 아닌 경우에만 이동 (불필요한 리로드 방지)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    // 백엔드에서 내려온 message를 error.message로 정규화
    const backendMessage = error.response?.data?.message
    if (backendMessage) {
      error.message = backendMessage
    }
    return Promise.reject(error)
  }
)

export default api
