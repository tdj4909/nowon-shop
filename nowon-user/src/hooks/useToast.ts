import { useCallback, useEffect, useRef, useState } from 'react'

export type ToastType = 'success' | 'error'

export interface ToastState {
  message: string
  type: ToastType
}

/**
 * 토스트 메시지 상태와 자동 사라짐 타이머를 관리하는 훅.
 * 여러 페이지에 중복돼 있던 toast state + showToast + setTimeout 로직을 통합한다.
 *
 * @param duration 토스트 표시 시간(ms). 기본 2500ms.
 */
export function useToast(duration = 2500) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback(
    (message: string, type: ToastType) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setToast({ message, type })
      timerRef.current = setTimeout(() => setToast(null), duration)
    },
    [duration]
  )

  // 언마운트 시 타이머 정리 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { toast, showToast }
}
