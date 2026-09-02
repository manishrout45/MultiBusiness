import { useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { MarketplaceNavbar, MobileBottomNav } from '@/components/navbar';
import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@/features/auth';
import { CartProvider } from '@/features/cart';
import { PlatformThemeProvider } from '@/hooks/usePlatformTheme';
import { FestiveOverlay } from '@/components/theme/FestiveOverlay';
import AdminLayout from '@/app/admin/layout';
import AdminDashboardPage from '@/app/admin/dashboard/page';
import HomePage from '@/app/page';
import LoginPage from '@/app/login/page';
import RegisterPage from '@/app/register/page';
import SearchPage from '@/app/search/page';
import CategoriesPage from '@/app/categories/page';
import CategoryDetailPage from '@/app/categories/CategoryDetailPage';
import ProductsPage from '@/app/products/page';
import ProductDetailPage from '@/app/products/ProductDetailPage';
import BusinessesPage from '@/app/businesses/page';
import BusinessPage from '@/app/business/BusinessPage';
import BusinessReviewsPage from '@/app/business/BusinessReviewsPage';
import SuccessStoriesPage from '@/app/success-stories/page';
import CartPage from '@/app/cart/page';
import CheckoutPage from '@/app/checkout/page';
import PaymentPage from '@/app/payment/page';
import WishlistPage from '@/app/wishlist/page';
import OrdersPage from '@/app/orders/page';
import OrderDetailPage from '@/app/orders/OrderDetailPage';
import VendorLayout from '@/app/vendor/layout';
import VendorRegisterPage from '@/app/vendor/register/page';
import VendorDashboardPage from '@/app/vendor/dashboard/page';
import VendorProductsPage from '@/app/vendor/products/page';
import VendorOrdersPage from '@/app/vendor/orders/page';
import VendorCategoriesPage from '@/app/vendor/categories/page';
import VendorProfilePage from '@/app/vendor/profile/page';
import VendorSubscriptionPage from '@/app/vendor/subscription/page';
import NotFoundPage from '@/app/not-found';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppShell() {
  return (
    <AuthProvider>
      <ToastProvider>
        <PlatformThemeProvider>
          <CartProvider>
            <ScrollToTop />
            <FestiveOverlay />
            <MarketplaceNavbar />
            <main className="pb-16 md:pb-0">
              <Outlet />
            </main>
            <Footer />
            <MobileBottomNav />
          </CartProvider>
        </PlatformThemeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

function LegacyBusinessRedirect() {
  const { pathname } = useLocation();
  const slug = pathname.split('/').filter(Boolean)[1];
  return <Navigate to={slug ? `/business/${slug}` : '/businesses'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:slug" element={<CategoryDetailPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/businesses" element={<BusinessesPage />} />
          <Route path="/businesses/:slug" element={<LegacyBusinessRedirect />} />
          <Route path="/business/:slug" element={<BusinessPage />} />
          <Route path="/business/:slug/reviews" element={<BusinessReviewsPage />} />
          <Route path="/success-stories" element={<SuccessStoriesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />

          <Route path="/vendor" element={<VendorLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="register" element={<VendorRegisterPage />} />
            <Route path="dashboard" element={<VendorDashboardPage />} />
            <Route path="products" element={<VendorProductsPage />} />
            <Route path="orders" element={<VendorOrdersPage />} />
            <Route path="categories" element={<VendorCategoriesPage />} />
            <Route path="profile" element={<VendorProfilePage />} />
            <Route path="subscription" element={<VendorSubscriptionPage />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
