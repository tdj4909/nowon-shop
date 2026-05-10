import api from './axios'

export interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  description: string
  status: 'SELL' | 'SOLD_OUT' | 'HIDDEN'
}

export const getProducts = () =>
  api.get<Product[]>('/api/products')

export const getProduct = (productId: number) =>
  api.get<Product>(`/api/products/${productId}`)
