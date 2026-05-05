import { Navigate } from "react-router";

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("accessToken");
  return token ? <>{children}</> : <Navigate to="/signin" replace />;
}
