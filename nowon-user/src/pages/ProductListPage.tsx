import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../api/products'
import type { Product } from '../api/products'

function ProductSkeleton() {
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
      <div className="bg-gray-100 h-48" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  )
}

function ImagePlaceholder() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-48 flex flex-col items-center justify-center gap-2 group-hover:from-indigo-50 group-hover:to-indigo-100 transition-colors duration-300">
      <svg className="w-10 h-10 text-gray-300 group-hover:text-indigo-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10" />
      </svg>
      <span className="text-xs text-gray-300 group-hover:text-indigo-300 transition-colors duration-300">No Image</span>
    </div>
  )
}

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
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="h-8 bg-gray-100 rounded w-32 mb-8 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <svg className="w-12 h-12 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <p className="text-gray-500">{error}</p>
      </div>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <span className="text-sm text-gray-400">{products.length}개 상품</span>
      </div>
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
          <p className="text-gray-400">등록된 상품이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {products.map((product) => (
            <Link
              to={`/products/${product.id}`}
              key={product.id}
              className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-white"
            >
              <div className="relative overflow-hidden">
                <ImagePlaceholder />
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold tracking-wider">SOLD OUT</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                {product.category && (
                  <p className="text-xs text-indigo-500 font-medium mb-1">{product.category}</p>
                )}
                <p className="text-sm font-semibold text-gray-900 truncate leading-snug">{product.name}</p>
                <p className="text-sm font-bold text-gray-800 mt-2">{product.price.toLocaleString()}원</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
