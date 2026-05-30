import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface AuthContextType {
  isLoggedIn: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

/**
 * JWT payload의 exp(만료 시각)를 확인해 유효한 토큰인지 검증한다.
 * 서명 검증은 하지 않으며(서버의 역할), 만료된 토큰을 로그인 상태로
 * 잘못 표시하는 것을 클라이언트에서 선차 방지하기 위한 용도이다.
 */
function isTokenValid(token: string | null): boolean {
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload.exp) return true // exp가 없으면 만료 판단 불가 → 유효로 간주
    return payload.exp * 1000 > Date.now()
  } catch {
    return false // 파싱 실패 = 손상된 토큰
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem('accessToken')
    // 만료된 토큰은 제거하고 비로그인 상태로 시작
    if (token && !isTokenValid(token)) {
      localStorage.removeItem('accessToken')
      return false
    }
    return !!token
  })

  // 다른 탭에서 로그아웃 시 동기화
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'accessToken') setIsLoggedIn(isTokenValid(e.newValue))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const login = (token: string) => {
    localStorage.setItem('accessToken', token)
    setIsLoggedIn(true)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
