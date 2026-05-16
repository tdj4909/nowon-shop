import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, getCategories } from '../api/products'
import type { Product } from '../api/products'
import { useAuth } from '../store/AuthContext'

function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative overflow-hidden h-44">
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center gap-2 group-hover:from-indigo-50 group-hover:to-indigo-100 transition-colors duration-300">
            <svg className="w-8 h-8 text-gray-300 group-hover:text-indigo-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-semibold tracking-widest">SOLD OUT</span>
          </div>
        )}
      </div>
      <div className="p-4">
        {product.category && (
          <p className="text-xs text-indigo-500 font-medium mb-1">{product.category}</p>
        )}
        <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
        <p className="text-sm font-bold text-gray-800 mt-1.5">{product.price.toLocaleString()}원</p>
      </div>
    </Link>
  )
}

export default function LandingPage() {
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    Promise.all([
      getProducts({ page: 0, size: 4 }),
      getCategories(),
    ]).then(([productsRes, categoriesRes]) => {
      setNewProducts(productsRes.data.content)
      setCategories(categoriesRes.data.slice(0, 6))
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">

      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
          <span className="text-sm font-medium bg-white/15 px-4 py-1.5 rounded-full tracking-wide">
            Nowon Shop에 오신 것을 환영합니다
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            원하는 상품을<br />지금 바로 만나보세요
          </h1>
          <p className="text-indigo-200 text-lg max-w-md">
            다양한 카테고리의 상품을 한눈에, 빠르고 간편하게 주문하세요.
          </p>
          <div className="flex gap-3 mt-2">
            <Link
              to="/products"
              className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors text-sm"
            >
              상품 둘러보기
            </Link>
            {!isLoggedIn && (
              <Link
                to="/register"
                className="px-6 py-3 bg-white/15 text-white font-semibold rounded-xl hover:bg-white/25 transition-colors text-sm border border-white/20"
              >
                회원가입
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 카테고리 섹션 */}
      {categories.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="text-xl font-bold text-gray-900 mb-6">카테고리</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-sm"
              >
                {cat}
              </Link>
            ))}
            <Link
              to="/products"
              className="px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              전체 보기 →
            </Link>
          </div>
        </section>
      )}

      {/* 신규 상품 섹션 */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">신규 상품</h2>
          <Link to="/products" className="text-sm text-indigo-600 hover:underline font-medium">
            전체 보기 →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
                <div className="bg-gray-100 h-44" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : newProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>

      {/* CTA 섹션 */}
      <section className="bg-indigo-50 border-t border-indigo-100">
        <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            {isLoggedIn ? (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-1">주문 내역을 확인해보세요</h2>
                <p className="text-gray-500 text-sm">지금까지 주문한 상품을 확인할 수 있어요.</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-1">지금 시작해보세요</h2>
                <p className="text-gray-500 text-sm">회원가입 후 다양한 상품을 편리하게 주문할 수 있어요.</p>
              </>
            )}
          </div>
          <div className="flex gap-3 flex-shrink-0">
            {isLoggedIn ? (
              <Link
                to="/orders"
                className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm"
              >
                주문 내역 보기
              </Link>
            ) : (
              <Link
                to="/register"
                className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm"
              >
                무료 회원가입
              </Link>
            )}
            <Link
              to="/products"
              className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors text-sm"
            >
              상품 보기
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
