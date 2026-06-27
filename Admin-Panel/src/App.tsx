import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { ProtectedRoute } from "@/auth/ProtectedRoute"
import { AdminLayout } from "@/layouts/AdminLayout"
import { LoginPage } from "@/pages/LoginPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { ProductsPage } from "@/pages/products/ProductsPage"
import { ProductFormPage } from "@/pages/products/ProductFormPage"
import { CategoriesPage } from "@/pages/categories/CategoriesPage"
import { BrandsPage } from "@/pages/brands/BrandsPage"
import { OrdersPage } from "@/pages/orders/OrdersPage"
import { OrderDetailPage } from "@/pages/orders/OrderDetailPage"
import { CouponsPage } from "@/pages/coupons/CouponsPage"
import { BundlesPage } from "@/pages/bundles/BundlesPage"
import { DiscountTiersPage } from "@/pages/discount-tiers/DiscountTiersPage"
import { AnnouncementsPage } from "@/pages/announcements/AnnouncementsPage"
import { UsersPage } from "@/pages/users/UsersPage"
import { ReviewsPage } from "@/pages/reviews/ReviewsPage"
import { SiteContentPage } from "@/pages/site-content/SiteContentPage"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:slug/edit" element={<ProductFormPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="bundles" element={<BundlesPage />} />
            <Route path="discount-tiers" element={<DiscountTiersPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="site-content" element={<SiteContentPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
