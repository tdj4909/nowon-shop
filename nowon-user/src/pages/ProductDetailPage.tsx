import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct } from '../api/products'
import type { Product } from '../api/products'
import { createOrder } from '../api/orders'
import { useAuth } from '../store/AuthContext'
import { useCart } from '../store/CartContext'
import { useToast } from '../hooks/useToast'
import { getErrorMessage, formatPrice } from '../utils/format'
import Toast from '../components/ui/Toast'
import ProductImage from '../components/ui/ProductImage'
import StatePlaceholder from '../components/ui/StatePlaceholder'
import { AlertIcon } from '../components/ui/icons'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [error, setError] = useState('')
  const { toast, showToast } = useToast()
  const { isLoggedIn } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    getProduct(Number(id))
      .then((res) => setProduct(res.data))
      .catch(() => setError('상품을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
    })
    showToast('장바구니에 담겼습니다.', 'success')
  }

  const handleOrder = async () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    if (!product) return
    setOrdering(true)
    try {
      const res = await createOrder(product.id, quantity)
      navigate(`/checkout/${res.data}`)
    } catch (err) {
      showToast(getErrorMessage(err, '주문에 실패했습니다. 다시 시도해주세요.'), 'error')
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
    return <StatePlaceholder icon={<AlertIcon className="w-12 h-12 text-red-300" />} message={error || '상품을 찾을 수 없습니다.'} />
  }

  const isSoldOut = product.stock === 0
  const totalPrice = product.price * quantity

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <Toast toast={toast} />
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        목록으로
      </button>

      {/* 상품 이미지 */}
      <div className="relative rounded-2xl overflow-hidden mb-10" style={{ aspectRatio: '4/3' }}>
        <ProductImage imageUrl={product.imageUrl} name={product.name} iconClassName="w-16 h-16" />
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
        <p className="text-2xl font-bold text-indigo-600">{formatPrice(product.price)}</p>
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
          <span className="text-lg font-bold text-gray-900">{formatPrice(totalPrice)}</span>
        </div>

        {/* 버튼 2개: 장바구니 + 바로 주문 */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className="flex-1 py-3.5 border border-indigo-500 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 disabled:opacity-50 transition-colors text-sm"
          >
            장바구니 담기
          </button>
          <button
            onClick={handleOrder}
            disabled={isSoldOut || ordering}
            className="flex-1 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm"
          >
            {isSoldOut ? '품절' : ordering ? '주문 중...' : '바로 주문'}
          </button>
        </div>

        {!isLoggedIn && (
          <p className="text-center text-xs text-gray-400">로그인 후 주문할 수 있습니다.</p>
        )}
      </div>
    </main>
  )
}
