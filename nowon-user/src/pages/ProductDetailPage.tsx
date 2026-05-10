import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct } from '../api/products'
import type { Product } from '../api/products'
import { createOrder } from '../api/orders'
import { useAuth } from '../store/AuthContext'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [error, setError] = useState('')
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    getProduct(Number(id))
      .then((res) => setProduct(res.data))
      .catch(() => setError('상품을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleOrder = async () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    if (!product) return
    setOrdering(true)
    try {
      await createOrder(product.id, quantity)
      alert('주문이 완료되었습니다!')
      navigate('/orders')
    } catch {
      alert('주문에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setOrdering(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !product) {
    return <p className="text-center text-red-500 mt-20">{error || '상품을 찾을 수 없습니다.'}</p>
  }

  const isSoldOut = product.stock === 0

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-indigo-600 mb-6 flex items-center gap-1"
      >
        ← 목록으로
      </button>
      <div className="bg-gray-100 rounded-xl h-72 flex items-center justify-center text-gray-400 mb-8">
        이미지 없음
      </div>
      <div className="space-y-3">
        <p className="text-sm text-indigo-500 font-medium">{product.category}</p>
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        <p className="text-xl font-semibold text-gray-800">{product.price.toLocaleString()}원</p>
        <p className="text-sm text-gray-500">재고: {product.stock}개</p>
        {product.description && (
          <p className="text-gray-600 text-sm leading-relaxed pt-2">{product.description}</p>
        )}
      </div>
      <div className="mt-8 flex items-center gap-4">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            −
          </button>
          <span className="px-4 py-2 text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            disabled={isSoldOut}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            +
          </button>
        </div>
        <button
          onClick={handleOrder}
          disabled={isSoldOut || ordering}
          className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSoldOut ? '품절' : ordering ? '주문 중...' : '주문하기'}
        </button>
      </div>
    </main>
  )
}
