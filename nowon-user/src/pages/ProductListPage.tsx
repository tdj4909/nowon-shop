import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProducts, getCategories } from '../api/products'
import type { Product } from '../api/products'

const PAGE_SIZE = 8

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

function ProductImage({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  const [imgError, setImgError] = useState(false)

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        onError={() => setImgError(true)}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
      />
    )
  }

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
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  // 랜딩 페이지 카테고리 클릭 시 URL 파라미터로 초기값 설정
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? '')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data))
  }, [])

  const fetchProducts = useCallback(() => {
    setLoading(true)
    getProducts({
      keyword: search || undefined,
      category: selectedCategory || undefined,
      page,
      size: PAGE_SIZE,
    })
      .then((res) => {
        setProducts(res.data.content)
        setTotalPages(res.data.totalPages)
        setTotalElements(res.data.totalElements)
      })
      .catch(() => setError('상품을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false))
  }, [search, selectedCategory, page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(0)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setPage(0)
    // URL 파라미터 동기화
    if (cat) setSearchParams({ category: cat })
    else setSearchParams({})
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">전체 상품</h1>
        <span className="text-sm text-gray-400">총 {totalElements}개</span>
      </div>

      <div className="relative mb-4">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="상품명 검색..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
        />
        {searchInput && (
          <button
            onClick={() => { setSearchInput(''); setSearch(''); setPage(0) }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === '' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
          <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
          <p className="text-gray-400">검색 결과가 없습니다.</p>
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
                <ProductImage imageUrl={product.imageUrl} name={product.name} />
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === i ? 'bg-indigo-600 text-white' : 'border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </main>
  )
}
