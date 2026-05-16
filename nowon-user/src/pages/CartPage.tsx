import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../store/CartContext'
import { useAuth } from '../store/AuthContext'
import { createOrderMultiple } from '../api/orders'

type ToastState = { message: string; type: 'success' | 'error' } | null

function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-medium shadow-lg text-white z-50 ${
      toast.type === 'success' ? 'bg-gray-900' : 'bg-red-500'
    }`}>
      {toast.message}
    </div>
  )
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalCount } = useCart()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [ordering, setOrdering] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleOrder = async () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    if (items.length === 0) return

    setOrdering(true)
    try {
      // 주문 생성 (PENDING 상태) → 반환된 orderId로 결제 페이지 이동
      const res = await createOrderMultiple(
        items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
      )
      const orderId = res.data
      clearCart()
      navigate(`/checkout/${orderId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      showToast(message || '주문에 실패했습니다. 다시 시도해주세요.', 'error')
    } finally {
      setOrdering(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <Toast toast={toast} />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">장바구니</h1>
        <span className="text-sm text-gray-400">{totalCount}개</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m5-9l2 9" />
          </svg>
          <p className="text-gray-400">장바구니가 비어 있습니다.</p>
          <button
            onClick={() => navigate('/products')}
            className="text-sm text-indigo-600 hover:underline"
          >
            쇼핑 계속하기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-7 h-7 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{item.productName}</p>
                  <p className="text-sm text-indigo-600 font-semibold">{item.price.toLocaleString()}원</p>
                </div>

                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => {
                      if (item.quantity === 1) removeItem(item.productId)
                      else updateQuantity(item.productId, item.quantity - 1)
                    }}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors text-sm"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))}
                    disabled={item.quantity >= item.stock}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors text-sm disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-gray-800 text-sm">
                    {(item.price * item.quantity).toLocaleString()}원
                  </p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-xs text-gray-300 hover:text-red-400 mt-1 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>상품 {totalCount}개</span>
              <span className="font-bold text-gray-900 text-base">{totalPrice.toLocaleString()}원</span>
            </div>
            <button
              onClick={handleOrder}
              disabled={ordering}
              className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm"
            >
              {ordering ? '주문 생성 중...' : `${totalPrice.toLocaleString()}원 결제하기`}
            </button>
            {!isLoggedIn && (
              <p className="text-center text-xs text-gray-400">로그인 후 주문할 수 있습니다.</p>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
