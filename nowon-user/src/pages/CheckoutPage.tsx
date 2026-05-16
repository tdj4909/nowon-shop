import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { createPaymentIntent } from '../api/payments'

// Vite env는 모듈 로드 시점에 이미 주입되므로 모듈 레벨 초기화 안전
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string)

// ── 결제 폼 ───────────────────────────────────────────────────────────
function CheckoutForm({ orderId }: { orderId: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()

  const [processing, setProcessing] = useState(false)
  const [elementReady, setElementReady] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setErrorMsg('')

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders?paid=${orderId}`,
      },
    })

    if (error) {
      setErrorMsg(error.message ?? '결제에 실패했습니다.')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-4">
        <PaymentElement onReady={() => setElementReady(true)} />
      </div>

      {errorMsg && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || !elementReady || processing}
        className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm"
      >
        {processing ? '결제 처리 중...' : '결제하기'}
      </button>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        돌아가기
      </button>
    </form>
  )
}

// ── 페이지 진입점 ──────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderId) return
    createPaymentIntent(Number(orderId))
      .then((res) => setClientSecret(res.data))
      .catch(() => setError('결제 정보를 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-32 mb-8" />
        <div className="space-y-3">
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
        </div>
      </main>
    )
  }

  if (error || !clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-gray-500">{error || '결제 정보를 불러올 수 없습니다.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-indigo-600 hover:underline"
        >
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">결제</h1>
        <p className="text-sm text-gray-400 mt-1">주문번호 #{orderId}</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
        <p className="text-xs font-semibold text-amber-700 mb-1">테스트 모드</p>
        <p className="text-xs text-amber-600">
          카드번호 <span className="font-mono font-bold">4242 4242 4242 4242</span><br />
          유효기간 아무 미래 날짜 · CVC 아무 3자리
        </p>
      </div>

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#4f46e5',
              borderRadius: '12px',
              fontFamily: 'system-ui, sans-serif',
            },
          },
        }}
      >
        <CheckoutForm orderId={Number(orderId)} />
      </Elements>
    </main>
  )
}
