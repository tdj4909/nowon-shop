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
 * 응답 인터셉터: ApiResponse 래퍼를 자동으로 풀어서
 * 페이지에서는 res.data로 실제 데이터에 바로 접근할 수 있게 한다.
 *
 * 에러의 경우 error.message에 백엔드 메시지가 들어있어 catch에서 바로 사용 가능.
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
      // success: false (이론상 GlobalExceptionHandler가 4xx/5xx로 내려주므로 거의 발생 안 함)
      return Promise.reject(new Error(envelope.message ?? '요청 처리에 실패했습니다.'))
    }

    return response
  },
  (error) => {
    // 백엔드에서 내려온 message를 error.message로 정규화
    const backendMessage = error.response?.data?.message
    if (backendMessage) {
      error.message = backendMessage
    }
    return Promise.reject(error)
  }
)

export default api
