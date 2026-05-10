import { useEffect, useState } from 'react'
import { getMyOrders } from '../api/orders'
import type { Order } from '../api/orders'

const STATUS_LABEL: Record<string, string> = {
  ORDER: '주문완료',
  CANCEL: '취소됨',
  DELIVERING: '배송중',
  COMPLETE: '배송완료',
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyOrders()
      .then((res) => setOrders(res.data))
      .catch(() => setError('주문 내역을 불러오는 데 실패했습니다.'))
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
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">내 주문 내역</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-center mt-20">주문 내역이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.orderId} className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">{order.createdDate?.slice(0, 10)}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  order.status === 'CANCEL'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>
              <ul className="space-y-1 mb-3">
                {order.orderItems.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex justify-between">
                    <span>{item.productName} × {item.quantity}</span>
                    <span>{(item.orderPrice * item.quantity).toLocaleString()}원</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-semibold text-gray-900">
                <span>합계</span>
                <span>{order.totalPrice.toLocaleString()}원</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
