import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../api/products'
import type { Product } from '../api/products'

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data))
      .catch(() => setError('상품을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return <p className="text-center text-red-500 mt-20">{error}</p>
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">상품 목록</h1>
      {products.length === 0 ? (
        <p className="text-gray-500 text-center mt-20">등록된 상품이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {products.map((product) => (
            <Link
              to={`/products/${product.id}`}
              key={product.id}
              className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="bg-gray-100 h-44 flex items-center justify-center text-gray-400 text-sm group-hover:bg-indigo-50 transition-colors">
                이미지 없음
              </div>
              <div className="p-3">
                <p className="text-xs text-indigo-500 font-medium mb-0.5">{product.category}</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                <p className="text-sm text-gray-700 mt-1">{product.price.toLocaleString()}원</p>
                {product.stock === 0 && (
                  <span className="inline-block mt-1 text-xs text-red-500">품절</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
