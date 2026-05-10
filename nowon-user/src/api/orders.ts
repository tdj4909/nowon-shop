import api from './axios'

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

export const createOrder = (productId: number, quantity: number) =>
  api.post<number>('/api/orders', { productId, quantity })

export const getMyOrders = () =>
  api.get<Order[]>('/api/orders')

export const cancelOrder = (orderId: number) =>
  api.patch(`/api/orders/${orderId}/cancel`)
