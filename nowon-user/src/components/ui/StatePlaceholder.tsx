import type { ReactNode } from 'react'

interface StatePlaceholderProps {
  /** 상단에 표시할 아이콘 (icons.tsx의 AlertIcon/BoxIcon 등) */
  icon: ReactNode
  /** 안내 메시지 */
  message: string
  /** 메시지 아래에 둘 추가 요소 (버튼/링크 등) */
  children?: ReactNode
  /** 컨테이너 최소 높이 클래스 (기본 min-h-[60vh]) */
  minHeight?: string
}

/**
 * 에러 / 빈 목록 / 결과 없음 등 "아이콘 + 메시지" 중앙 정렬 화면.
 * 여러 페이지에 반복되던 동일 마크업을 통합한다.
 */
export default function StatePlaceholder({
  icon,
  message,
  children,
  minHeight = 'min-h-[60vh]',
}: StatePlaceholderProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${minHeight} gap-3`}>
      {icon}
      <p className="text-gray-400">{message}</p>
      {children}
    </div>
  )
}
