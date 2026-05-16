import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { useCart } from '../store/CartContext'

export default function Header() {
  const { isLoggedIn, logout } = useAuth()
  const { totalCount } = useCart()
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

          {/* 장바구니 아이콘 */}
          <Link to="/cart" className="relative hover:text-indigo-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m5-9l2 9" />
            </svg>
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </Link>

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
