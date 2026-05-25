/**
 * 페이지 로딩 상태 표시 — 데이터 fetch 중 사용
 *
 * 여러 페이지에서 같은 패턴이 반복되어 공통 컴포넌트로 추출했다.
 */
interface LoadingProps {
  /** 사용자에게 보여줄 메시지 (기본값: "데이터를 불러오는 중입니다...") */
  message?: string;
}

export default function Loading({ message = "데이터를 불러오는 중입니다..." }: LoadingProps) {
  return <div className="p-10 text-center text-gray-500 dark:text-gray-400">{message}</div>;
}
