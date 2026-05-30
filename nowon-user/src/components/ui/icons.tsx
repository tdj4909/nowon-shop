/**
 * 앱 전반에서 반복 사용되는 인라인 SVG 아이콘 모음.
 * 동일한 path가 여러 파일에 중복되던 것을 한 곳으로 모았다.
 */

/** 상품 이미지가 없을 때 표시하는 박스(큐브) 아이콘 */
export function BoxIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10"
      />
    </svg>
  )
}

/** 에러/경고 상태에 쓰는 삼각 경고 아이콘 */
export function AlertIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  )
}
