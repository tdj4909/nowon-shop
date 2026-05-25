import { Navigate } from "react-router";
import { getRoleFromToken } from "../../utils/jwt";

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("accessToken");

  // 토큰 없으면 로그인 페이지로
  if (!token) return <Navigate to="/signin" replace />;

  // 토큰은 있지만 ADMIN이 아니면 로그인 페이지로 (토큰 삭제 후)
  const role = getRoleFromToken(token);
  if (role !== "ADMIN") {
    localStorage.removeItem("accessToken");
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
