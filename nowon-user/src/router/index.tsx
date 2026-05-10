import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import ProductListPage from '../pages/ProductListPage'
import ProductDetailPage from '../pages/ProductDetailPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import MyOrdersPage from '../pages/MyOrdersPage'
import PrivateRoute from '../components/PrivateRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <ProductListPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'orders',
        element: (
          <PrivateRoute>
            <MyOrdersPage />
          </PrivateRoute>
        ),
      },
    ],
  },
])

export default router
