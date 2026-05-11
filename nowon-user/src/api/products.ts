import api from './axios'

export interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  description: string
  imageUrl: string | null
  status: 'SELL' | 'SOLD_OUT' | 'HIDDEN'
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface ProductSearchParams {
  keyword?: string
  category?: string
  page?: number
  size?: number
}

export const getProducts = (params?: ProductSearchParams) =>
  api.get<PageResponse<Product>>('/api/products', { params })

export const getCategories = () =>
  api.get<string[]>('/api/products/categories')

export const getProduct = (productId: number) =>
  api.get<Product>(`/api/products/${productId}`)
