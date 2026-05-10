import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct } from '../api/products'
import type { Product } from '../api/products'
import { createOrder } from '../api/orders'
import { useAuth } from '../store/AuthContext'

type ToastType = 'success' | 'error'

function Toast({ message, type }: { message: string; type: ToastType }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-medium shadow-lg text-white z-50 transition-all ${
      type === 'success' ? 'bg-gray-900' : 'bg-red-500'
    }`}>
      {message}
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    getProduct(Number(id))
      .then((res) => setProduct(res.data))
      .catch(() => setError('상품을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false))
  }, [id])

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  const handleOrder = async () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    if (!product) return
    setOrdering(true)
    try {
      await createOrder(product.id, quantity)
      showToast('주문이 완료되었습니다!', 'success')
      setTimeout(() => navigate('/orders'), 1200)
    } catch {
      showToast('주문에 실패했습니다. 다시 시도해주세요.', 'error')
    } finally {
      setOrdering(false)
    }
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-20 mb-8" />
        <div className="bg-gray-100 rounded-2xl h-72 mb-8" />
        <div className="space-y-3">
          <div className="h-3 bg-gray-100 rounded w-16" />
          <div className="h-7 bg-gray-100 rounded w-2/3" />
          <div className="h-6 bg-gray-100 rounded w-1/4" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <svg className="w-12 h-12 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <p className="text-gray-500">{error || '상품을 찾을 수 없습니다.'}</p>
      </div>
    )
  }

  const isSoldOut = product.stock === 0
  const totalPrice = product.price * quantity

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {toast && <Toast message={toast.message} type={toast.type} />}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        목록으로
      </button>

      {/* 이미지 영역 */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl h-72 flex flex-col items-center justify-center gap-2 mb-10 relative overflow-hidden">
        <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
        <span className="text-sm text-gray-300">No Image</span>
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-lg font-bold tracking-widest">SOLD OUT</span>
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="space-y-2 mb-8">
        {product.category && (
          <p className="text-sm text-indigo-500 font-medium">{product.category}</p>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        <p className="text-2xl font-bold text-indigo-600">{product.price.toLocaleString()}원</p>
        <p className="text-sm text-gray-400">
          재고 <span className={product.stock <= 5 && product.stock > 0 ? 'text-orange-500 font-medium' : 'text-gray-500'}>
            {product.stock}개
          </span>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="ml-2 text-orange-500 text-xs">곧 품절</span>
          )}
        </p>
        {product.description && (
          <p className="text-gray-500 text-sm leading-relaxed pt-3 border-t border-gray-100">
            {product.description}
          </p>
        )}
      </div>

      {/* 주문 영역 */}
      <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">수량</span>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={isSoldOut}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              −
            </button>
            <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              disabled={isSoldOut}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">총 금액</span>
          <span className="text-lg font-bold text-gray-900">{totalPrice.toLocaleString()}원</span>
        </div>
        <button
          onClick={handleOrder}
          disabled={isSoldOut || ordering}
          className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm"
        >
          {isSoldOut ? '품절된 상품입니다' : ordering ? '주문 중...' : '주문하기'}
        </button>
        {!isLoggedIn && (
          <p className="text-center text-xs text-gray-400">로그인 후 주문할 수 있습니다.</p>
        )}
      </div>
    </main>
  )
}
