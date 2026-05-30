import type { ToastState } from '../../hooks/useToast'

/**
 * 화면 하단 중앙에 뜨는 토스트.
 * useToast 훅이 반환하는 toast 값을 그대로 받아 렌더링한다. null이면 아무것도 그리지 않는다.
 */
export default function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-medium shadow-lg text-white z-50 transition-all ${
        toast.type === 'success' ? 'bg-gray-900' : 'bg-red-500'
      }`}
    >
      {toast.message}
    </div>
  )
}
