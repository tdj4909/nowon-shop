import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ProductList from "./pages/ProductList";
import ProductCreate from "./pages/ProductCreate";
import ProductEdit from "./pages/ProductEdit";
import OrderList from "./pages/OrderList";
import UserList from "./pages/UserList";
import UserCreate from "./pages/UserCreate";
import PrivateRoute from "./components/common/PrivateRoute";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* 어드민 메인 레이아웃 — 로그인 필요 */}
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/create" element={<ProductCreate />} />
          <Route path="/products/:productId/edit" element={<ProductEdit />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/users/create" element={<UserCreate />} />
        </Route>

        {/* 인증 */}
        <Route path="/signin" element={<SignIn />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
