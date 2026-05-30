import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom'

/**
 * 라우터 레벨 에러 처리 컴포넌트.
 * - 존재하지 않는 경로(404) 및 렌더링 중 발생한 예외를 모두 처리한다.
 * - 라우트의 errorElement로 등록되어 앱 전체가 흰 화면으로 죽는 것을 방지한다.
 */
export default function ErrorPage() {
  const error = useRouteError()

  const is404 = isRouteErrorResponse(error) && error.status === 404
  const title = is404 ? '페이지를 찾을 수 없습니다' : '문제가 발생했습니다'
  const description = is404
    ? '요청하신 페이지가 존재하지 않거나 이동되었습니다.'
    : '예기치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50 text-center">
      <div className="text-7xl font-bold text-indigo-600 mb-2">
        {is404 ? '404' : '500'}
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-sm text-gray-500 mb-8 max-w-xs">{description}</p>
      <div className="flex gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm"
        >
          홈으로
        </Link>
        <Link
          to="/products"
          className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors text-sm"
        >
          상품 보기
        </Link>
      </div>
    </div>
  )
}
