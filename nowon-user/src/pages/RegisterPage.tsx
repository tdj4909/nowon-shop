import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register as registerApi } from '../api/auth'
import { getErrorMessage } from '../utils/format'
import FormInput from '../components/ui/FormInput'
import FormError from '../components/ui/FormError'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerApi({ email, name, password })
      navigate('/login')
    } catch (err) {
      // 검증 실패 메시지(이메일 형식, 비밀번호 길이 등) 또는 이메일 중복 메시지 표시
      setError(getErrorMessage(err, '회원가입에 실패했습니다.'))
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
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="text-sm text-gray-400 mt-1">Nowon Shop 계정을 만들어보세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="이름"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            placeholder="홍길동"
          />
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
            minLength={8}
            autoComplete="new-password"
            placeholder="8자 이상 입력"
          />

          <FormError message={error} />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm mt-2"
          >
            {loading ? '처리 중...' : '가입하기'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
