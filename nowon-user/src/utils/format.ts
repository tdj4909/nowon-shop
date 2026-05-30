/**
 * axios 인터셉터가 error.message에 백엔드 메시지를 정규화해두므로,
 * Error 인스턴스이면 그 메시지를, 아니면 전달된 fallback을 반환한다.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback
}

/** 숫자를 천 단위 구분 가격 문자열로 변환 (예: 12000 → "12,000원") */
export function formatPrice(value: number): string {
  return `${value.toLocaleString()}원`
}
