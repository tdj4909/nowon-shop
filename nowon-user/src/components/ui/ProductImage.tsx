import { useState } from 'react'
import { BoxIcon } from './icons'

interface ProductImageProps {
  imageUrl: string | null
  name: string
  /** 이미지/플레이스홀더 컨테이너에 적용할 className (크기·비율 등) */
  className?: string
  /** No Image 플레이스홀더의 박스 아이콘 크기 */
  iconClassName?: string
  /** hover 시 확대(group-hover:scale-105) 효과 적용 여부 */
  zoomOnHover?: boolean
}

/**
 * 상품 이미지 + 로드 실패 시 No Image 플레이스홀더 폴백.
 * 목록/상세/랜딩 페이지에 중복돼 있던 onError 폴백 로직을 통합한다.
 * 부모가 relative 컨테이너와 SOLD OUT 오버레이를 담당하고, 이 컴포넌트는 이미지 영역만 채운다.
 */
export default function ProductImage({
  imageUrl,
  name,
  className = 'w-full h-full',
  iconClassName = 'w-10 h-10',
  zoomOnHover = false,
}: ProductImageProps) {
  const [imgError, setImgError] = useState(false)

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        onError={() => setImgError(true)}
        className={`${className} object-cover ${
          zoomOnHover ? 'group-hover:scale-105 transition-transform duration-300' : ''
        }`}
      />
    )
  }

  return (
    <div
      className={`${className} bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center gap-2 text-gray-300`}
    >
      <BoxIcon className={iconClassName} />
      <span className="text-xs">No Image</span>
    </div>
  )
}
