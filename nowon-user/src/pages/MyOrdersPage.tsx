import { useEffect, useState } from 'react'
import { getMyOrders, cancelOrder } from '../api/orders'
import type { Order } from '../api/orders'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:    { label: '결제대기',  color: 'bg-yellow-100 text-yellow-700' },
  ORDER:      { label: '주문완료',  color: 'bg-indigo-100 text-indigo-700' },
  DELIVERING: { label: '배송중',   color: 'bg-blue-100 text-blue-700' },
  COMPLETE:   { label: '배송완료', color: 'bg-green-100 text-green-700' },
  CANCELLED:  { label: '취소됨',   color: 'bg-red-100 text-red-600' },
  CANCEL:     { label: '취소됨',   color: 'bg-red-100 text-red-600' },
}

const CANCELLABLE = ['PENDING', 'ORDER']

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = () => {
    setLoading(true)
    getMyOrders()
      .then((res) => setOrders(res.data))
      .catch(() => setError('주문 내역을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false))
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  const handleCancel = async (orderId: number) => {
    if (!confirm('주문을 취소하시겠습니까?')) return
    setCancellingId(orderId)
    try {
      await cancelOrder(orderId)
      showToast('주문이 취소되었습니다.', 'success')
      fetchOrders()
    } catch {
      showToast('주문 취소에 실패했습니다.', 'error')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-8 bg-gray-100 rounded w-36 mb-8 animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-5 animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-5 bg-gray-100 rounded w-16" />
              </div>
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
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
    <main className="max-w-3xl mx-auto px-4 py-10">
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-medium shadow-lg text-white z-50 ${
          toast.type === 'success' ? 'bg-gray-900' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">내 주문 내역</h1>
        <span className="text-sm text-gray-400">{orders.length}건</span>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400">주문 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' }
            const canCancel = CANCELLABLE.includes(order.status)
            return (
              <div key={order.orderId} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">주문번호 #{order.orderId}</p>
                    <p className="text-xs text-gray-400">{order.createdDate?.slice(0, 10)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(order.orderId)}
                        disabled={cancellingId === order.orderId}
                        className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-300 px-2.5 py-1 rounded-full transition-colors disabled:opacity-40"
                      >
                        {cancellingId === order.orderId ? '취소 중...' : '취소'}
                      </button>
                    )}
                  </div>
                </div>

                {/* 주문 상품 목록 */}
                <ul className="space-y-2 mb-4">
                  {order.orderItems.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.productName}</p>
                          <p className="text-xs text-gray-400">{item.orderPrice.toLocaleString()}원 × {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-700">
                        {(item.orderPrice * item.quantity).toLocaleString()}원
                      </span>
                    </li>
                  ))}
                </ul>

                {/* 합계 */}
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="text-sm text-gray-500">총 결제금액</span>
                  <span className="text-base font-bold text-indigo-600">{order.totalPrice.toLocaleString()}원</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
