import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import LandingPage from '../pages/LandingPage'
import ProductListPage from '../pages/ProductListPage'
import ProductDetailPage from '../pages/ProductDetailPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import MyOrdersPage from '../pages/MyOrdersPage'
import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import ErrorPage from '../pages/ErrorPage'
import PrivateRoute from '../components/PrivateRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    // 라우트 매칭 실패(404)와 렌더링 중 예외를 한 곳에서 처리
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'cart', element: <CartPage /> },
      {
        path: 'checkout/:orderId',
        element: (
          <PrivateRoute>
            <CheckoutPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <PrivateRoute>
            <MyOrdersPage />
          </PrivateRoute>
        ),
      },
      // 매칭되지 않는 모든 경로 → 404
      { path: '*', element: <ErrorPage /> },
    ],
  },
])

export default router
