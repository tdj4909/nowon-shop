/**
 * 폼 하단에 표시하는 인라인 에러 박스 (경고 아이콘 + 메시지).
 * message가 비어 있으면 렌더링하지 않는다. 로그인/회원가입 폼에서 공통 사용.
 */
export default function FormError({ message }: { message: string }) {
  if (!message) return null

  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
      <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p className="text-red-600 text-xs">{message}</p>
    </div>
  )
}
