import api from './axios'

export interface OrderItemRequest {
  productId: number
  quantity: number
}

export interface OrderItem {
  productName: string
  quantity: number
  orderPrice: number
  totalPrice: number
}

export interface Order {
  orderId: number
  status: string
  statusDescription: string
  totalPrice: number
  createdDate: string
  orderItems: OrderItem[]
}

// 단일 상품 주문 (ProductDetailPage에서 사용)
export const createOrder = (productId: number, quantity: number) =>
  api.post<number>('/api/orders', { items: [{ productId, quantity }] })

// 다중 상품 주문 (장바구니에서 사용)
export const createOrderMultiple = (items: OrderItemRequest[]) =>
  api.post<number>('/api/orders', { items })

export const getMyOrders = () =>
  api.get<Order[]>('/api/orders')

export const cancelOrder = (orderId: number) =>
  api.patch(`/api/orders/${orderId}/cancel`)
