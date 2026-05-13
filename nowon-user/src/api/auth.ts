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

export interface LoginResponse {
  accessToken: string
  tokenType: string
}

export const login = (data: LoginRequest) =>
  api.post<LoginResponse>('/api/auth/login', data)

export const register = (data: RegisterRequest) =>
  api.post('/api/auth/register', data)
