import { useEffect } from "react";
import { Link } from "react-router";
import GridShape from "../../components/common/GridShape";

export default function NotFound() {
  // 브라우저 탭 타이틀 갱신 (페이지가 unmount되면 원래대로 복구)
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "페이지를 찾을 수 없습니다 | Nowon Shop Admin";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      <GridShape />
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <h1 className="mb-8 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
          404
        </h1>

        <img src="/images/error/404.svg" alt="404" className="dark:hidden" />
        <img
          src="/images/error/404-dark.svg"
          alt="404"
          className="hidden dark:block"
        />

        <p className="mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
          요청하신 페이지를 찾을 수 없습니다.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
}
