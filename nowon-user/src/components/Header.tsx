import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

export default function Header() {
  const { isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight">
          Nowon Shop
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-indigo-600 transition-colors">상품</Link>
          {isLoggedIn ? (
            <>
              <Link to="/orders" className="hover:text-indigo-600 transition-colors">내 주문</Link>
              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-1.5 rounded-full border border-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-600 transition-colors">로그인</Link>
              <Link
                to="/register"
                className="ml-2 px-4 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
