import api from './axios'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
}

export const login = (data: LoginRequest) =>
  api.post<{ accessToken: string }>('/api/auth/login', data)

export const register = (data: RegisterRequest) =>
  api.post('/api/auth/register', data)
