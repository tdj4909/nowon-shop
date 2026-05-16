import api from './axios'

// 백엔드에 PaymentIntent 생성 요청 → clientSecret 반환
export const createPaymentIntent = (orderId: number) =>
  api.post<string>(`/api/payments/intent/${orderId}`)
