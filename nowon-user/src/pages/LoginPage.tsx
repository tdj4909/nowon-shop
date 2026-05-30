import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login as loginApi } from '../api/auth'
import { useAuth } from '../store/AuthContext'
import { getErrorMessage } from '../utils/format'
import FormInput from '../components/ui/FormInput'
import FormError from '../components/ui/FormError'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginApi({ email, password })
      login(res.data.accessToken)
      navigate('/')
    } catch (err) {
      // 백엔드의 @Valid 검증 실패 또는 인증 실패 메시지를 그대로 표시
      setError(getErrorMessage(err, '이메일 또는 비밀번호가 올바르지 않습니다.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-2xl mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
          <p className="text-sm text-gray-400 mt-1">Nowon Shop에 오신 것을 환영합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="example@email.com"
          />
          <FormInput
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />

          <FormError message={error} />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm mt-2"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          계정이 없으신가요?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
