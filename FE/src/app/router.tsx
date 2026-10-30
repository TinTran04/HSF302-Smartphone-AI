import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, Outlet, useLocation, useRouteError, Link } from 'react-router-dom';
import { StoreLayout } from '../layouts/StoreLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AccountLayout } from '../layouts/AccountLayout';
import { ChatLayout } from '../layouts/ChatLayout';
import { RequireAuth } from './guards/RequireAuth';
import { RequireAdmin } from './guards/RequireAdmin';
import { ErrorState, Skeleton } from '../shared/components/Ui';
const Home = lazy(() => import('../pages/storefront/HomePage'));
const Products = lazy(() => import('../pages/storefront/ProductListPage'));
const Detail = lazy(() => import('../pages/storefront/ProductDetailPage'));
const Compare = lazy(() => import('../pages/storefront/ComparePage'));
const Auth = lazy(() => import('../pages/auth/AuthPage'));
const AccountAccess = lazy(() => import('../pages/auth/AccountAccessPage'));
const Cart = lazy(() => import('../pages/customer/CartPage'));
const Checkout = lazy(() => import('../pages/customer/CheckoutPage'));
const Profile = lazy(() => import('../pages/customer/ProfilePage'));
const Orders = lazy(() => import('../pages/customer/OrderListPage'));
const OrderDetail = lazy(() => import('../pages/customer/OrderDetailPage'));
const Topics = lazy(() => import('../pages/ai/TopicSelectionPage'));
const Chat = lazy(() => import('../pages/ai/ChatPage'));
const Dashboard = lazy(() => import('../pages/admin/DashboardPage'));
const AdminProducts = lazy(() => import('../pages/admin/ProductManagementPage'));
const ProductForm = lazy(() => import('../pages/admin/ProductFormPage'));
const AdminOrders = lazy(() => import('../pages/admin/OrderManagementPage'));
const Knowledge = lazy(() => import('../pages/admin/KnowledgeBasePage'));
const AiSettings = lazy(() => import('../pages/admin/AiSettingsPage'));
const AdminOperations = lazy(() => import('../pages/admin/AdminOperationsPage'));
const NotFound = lazy(() => import('../pages/NotFoundPage'));
const Gallery = import.meta.env.DEV ? lazy(() => import('../pages/DesignGalleryPage')) : null;
function Root() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${pathname.startsWith('/admin') ? 'Quản trị' : pathname.startsWith('/ai') ? 'Trợ lý AI' : pathname === '/products' ? 'Điện thoại' : 'Khám phá'} | SmartPhone AI`;
  }, [pathname]);
  return (
    <Suspense
      fallback={
        <div className="container page">
          <Skeleton count={1} />
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );
}
function RouteError() {
  return (
    <div className="container page">
      <ErrorState error={useRouteError()} />
      <Link to="/" className="text-link">
        Về trang chủ
      </Link>
    </div>
  );
}
export const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <RouteError />,
    children: [
      {
        element: <StoreLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'products', element: <Products /> },
          { path: 'products/:id', element: <Detail /> },
          { path: 'compare', element: <Compare /> },
          { path: 'cart', element: <Cart /> },
          { path: 'login', element: <Auth /> },
          { path: 'register', element: <Auth register /> },
          { path: 'forgot-password', element: <AccountAccess /> },
          { path: 'accept-invitation', element: <AccountAccess invitation /> },
          { path: 'admin/invite', element: <AccountAccess invitation /> },
          {
            element: <RequireAuth />,
            children: [
              { path: 'checkout', element: <Checkout /> },
              {
                element: <AccountLayout />,
                children: [
                  { path: 'profile', element: <Profile /> },
                  { path: 'orders', element: <Orders /> },
                  { path: 'orders/:id', element: <OrderDetail /> },
                ],
              },
            ],
          },
          {
            element: <ChatLayout />,
            children: [
              { path: 'ai', element: <Topics /> },
              { path: 'ai/conversations/:id', element: <Chat /> },
            ],
          },
          { path: '*', element: <NotFound /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <RequireAdmin />,
            children: [
              {
                path: 'admin',
                element: <AdminLayout />,
                children: [
                  { index: true, element: <Dashboard /> },
                  { path: 'products', element: <AdminProducts /> },
                  { path: 'products/new', element: <ProductForm /> },
                  { path: 'products/:id/edit', element: <ProductForm /> },
                  { path: 'orders', element: <AdminOrders /> },
                  { path: 'orders/:id', element: <OrderDetail admin /> },
                  { path: 'knowledge', element: <Knowledge /> },
                  { path: 'ai-settings', element: <AiSettings /> },
                  { path: 'brands', element: <AdminOperations section="brands" /> },
                  { path: 'admins', element: <AdminOperations section="admins" /> },
                  { path: 'maintenance', element: <AdminOperations section="maintenance" /> },
                  { path: 'embedding', element: <AdminOperations section="embedding" /> },
                ],
              },
            ],
          },
        ],
      },
      ...(Gallery ? [{ path: 'design', element: <Gallery /> }] : []),
    ],
  },
]);
