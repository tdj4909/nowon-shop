import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * 라우트 이동 시 페이지 최상단으로 스크롤한다.
 *
 * 새 페이지는 항상 맨 위에서 시작하는 것이 사용자 기대에 맞으므로
 * 부드러운 애니메이션 대신 즉시 이동(instant)을 사용한다.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
