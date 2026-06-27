import { apiClient } from "./client"
import type {
  Announcement,
  ApiResponse,
  Brand,
  Bundle,
  Category,
  Coupon,
  DashboardStats,
  DiscountTier,
  Order,
  PaginatedResponse,
  Product,
  Review,
  SiteContent,
  User,
} from "@/types/api"

export interface ListParams {
  page?: number
  limit?: number
  q?: string
  status?: string
}

// ── Auth ──────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<
    ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
  >("/auth/login", { email, password })
  return data.data
}

export async function logout(refreshToken: string) {
  await apiClient.post("/auth/logout", { refreshToken })
}

export async function refreshAuth(refreshToken: string) {
  const { data } = await apiClient.post<
    ApiResponse<{ accessToken: string; refreshToken: string }>
  >("/auth/refresh", { refreshToken })
  return data.data
}

// ── Dashboard ─────────────────────────────────────────────────

export async function getDashboardStats() {
  const { data } = await apiClient.get<ApiResponse<DashboardStats>>(
    "/admin/dashboard",
  )
  return data.data
}

// ── Products ──────────────────────────────────────────────────

export async function getProducts(params?: ListParams) {
  const { data } = await apiClient.get<PaginatedResponse<Product>>(
    "/products",
    { params },
  )
  return data
}

export async function getProductBySlug(slug: string) {
  const { data } = await apiClient.get<ApiResponse<Product>>(
    `/products/${slug}`,
  )
  return data.data
}

export async function createProduct(payload: Record<string, unknown>) {
  const { data } = await apiClient.post<ApiResponse<Product>>(
    "/products",
    payload,
  )
  return data.data
}

export async function updateProduct(
  id: number,
  payload: Record<string, unknown>,
) {
  const { data } = await apiClient.patch<ApiResponse<Product>>(
    `/products/${id}`,
    payload,
  )
  return data.data
}

export async function deleteProduct(id: number) {
  await apiClient.delete(`/products/${id}`)
}

export async function addProductImage(
  id: number,
  payload: { url: string; isPrimary?: boolean; position?: number }
) {
  const { data } = await apiClient.post<ApiResponse<any>>(
    `/products/${id}/images`,
    payload
  )
  return data.data
}

export async function deleteProductImage(id: number, imageId: number) {
  await apiClient.delete(`/products/${id}/images/${imageId}`)
}

// ── Categories ────────────────────────────────────────────────

export async function getCategories() {
  const { data } = await apiClient.get<ApiResponse<Category[]>>("/categories")
  return data.data
}

export async function createCategory(payload: Record<string, unknown>) {
  const { data } = await apiClient.post<ApiResponse<Category>>(
    "/categories",
    payload,
  )
  return data.data
}

export async function updateCategory(
  id: number,
  payload: Record<string, unknown>,
) {
  const { data } = await apiClient.patch<ApiResponse<Category>>(
    `/categories/${id}`,
    payload,
  )
  return data.data
}

export async function deleteCategory(id: number) {
  await apiClient.delete(`/categories/${id}`)
}

// ── Brands ────────────────────────────────────────────────────

export async function getBrands() {
  const { data } = await apiClient.get<ApiResponse<Brand[]>>("/brands")
  return data.data
}

export async function createBrand(payload: Record<string, unknown>) {
  const { data } = await apiClient.post<ApiResponse<Brand>>("/brands", payload)
  return data.data
}

export async function updateBrand(id: number, payload: Record<string, unknown>) {
  const { data } = await apiClient.patch<ApiResponse<Brand>>(
    `/brands/${id}`,
    payload,
  )
  return data.data
}

export async function deleteBrand(id: number) {
  await apiClient.delete(`/brands/${id}`)
}

// ── Orders ────────────────────────────────────────────────────

export async function getOrders(params?: ListParams) {
  const { data } = await apiClient.get<PaginatedResponse<Order>>(
    "/orders/admin/list",
    { params },
  )
  return data
}

export async function getOrderById(id: number) {
  const { data } = await apiClient.get<ApiResponse<Order>>(
    `/orders/admin/${id}`,
  )
  return data.data
}

export async function updateOrderStatus(id: number, status: string) {
  const { data } = await apiClient.patch<ApiResponse<{ id: number; status: string }>>(
    `/orders/admin/${id}/status`,
    { status },
  )
  return data.data
}

// ── Coupons ───────────────────────────────────────────────────

export async function getCoupons() {
  const { data } = await apiClient.get<ApiResponse<Coupon[]>>("/coupons")
  return data.data
}

export async function createCoupon(payload: Record<string, unknown>) {
  const { data } = await apiClient.post<ApiResponse<Coupon>>("/coupons", payload)
  return data.data
}

export async function updateCoupon(id: number, payload: Record<string, unknown>) {
  const { data } = await apiClient.patch<ApiResponse<Coupon>>(
    `/coupons/${id}`,
    payload,
  )
  return data.data
}

export async function deleteCoupon(id: number) {
  await apiClient.delete(`/coupons/${id}`)
}

// ── Bundles ───────────────────────────────────────────────────

export async function getBundles() {
  const { data } = await apiClient.get<ApiResponse<Bundle[]>>("/bundles")
  return data.data
}

export async function createBundle(payload: Record<string, unknown>) {
  const { data } = await apiClient.post<ApiResponse<Bundle>>("/bundles", payload)
  return data.data
}

export async function updateBundle(id: number, payload: Record<string, unknown>) {
  const { data } = await apiClient.patch<ApiResponse<Bundle>>(
    `/bundles/${id}`,
    payload,
  )
  return data.data
}

export async function deleteBundle(id: number) {
  await apiClient.delete(`/bundles/${id}`)
}

// ── Discount Tiers ────────────────────────────────────────────

export async function getDiscountTiers() {
  const { data } = await apiClient.get<ApiResponse<DiscountTier[]>>(
    "/discount-tiers/admin",
  )
  return data.data
}

export async function createDiscountTier(payload: Record<string, unknown>) {
  const { data } = await apiClient.post<ApiResponse<DiscountTier>>(
    "/discount-tiers/admin",
    payload,
  )
  return data.data
}

export async function updateDiscountTier(
  id: number,
  payload: Record<string, unknown>,
) {
  const { data } = await apiClient.patch<ApiResponse<DiscountTier>>(
    `/discount-tiers/admin/${id}`,
    payload,
  )
  return data.data
}

export async function deleteDiscountTier(id: number) {
  await apiClient.delete(`/discount-tiers/admin/${id}`)
}

// ── Announcements ─────────────────────────────────────────────

export async function getAnnouncements() {
  const { data } = await apiClient.get<ApiResponse<Announcement[]>>(
    "/announcements",
  )
  return data.data
}

export async function createAnnouncement(payload: Record<string, unknown>) {
  const { data } = await apiClient.post<ApiResponse<Announcement>>(
    "/announcements",
    payload,
  )
  return data.data
}

export async function updateAnnouncement(
  id: number,
  payload: Record<string, unknown>,
) {
  const { data } = await apiClient.patch<ApiResponse<Announcement>>(
    `/announcements/${id}`,
    payload,
  )
  return data.data
}

export async function deleteAnnouncement(id: number) {
  await apiClient.delete(`/announcements/${id}`)
}

// ── Users ─────────────────────────────────────────────────────

export async function getUsers(params?: ListParams) {
  const { data } = await apiClient.get<PaginatedResponse<User>>("/users", {
    params,
  })
  return data
}

export async function updateUser(id: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.patch<ApiResponse<User>>(
    `/users/${id}`,
    payload,
  )
  return data.data
}

export async function deleteUser(id: string) {
  await apiClient.delete(`/users/${id}`)
}

// ── Reviews ───────────────────────────────────────────────────

export async function getReviews(params?: ListParams) {
  const { data } = await apiClient.get<PaginatedResponse<Review>>(
    "/reviews/admin/list",
    { params },
  )
  return data
}

export async function approveReview(id: number) {
  const { data } = await apiClient.patch<ApiResponse<Review>>(
    `/reviews/admin/${id}/approve`,
  )
  return data.data
}

export async function deleteReview(id: number) {
  await apiClient.delete(`/reviews/admin/${id}`)
}

// ── Site Content ──────────────────────────────────────────────

export async function getSiteContentList() {
  const { data } = await apiClient.get<ApiResponse<SiteContent[]>>(
    "/site-content",
  )
  return data.data
}

export async function upsertSiteContent(payload: {
  key: string
  value: Record<string, unknown>
}) {
  const { data } = await apiClient.put<ApiResponse<SiteContent>>(
    "/site-content",
    payload,
  )
  return data.data
}

export async function deleteSiteContent(key: string) {
  await apiClient.delete(`/site-content/${key}`)
}

// ── Upload ────────────────────────────────────────────────────

export async function uploadImage(file: File, folder = "products") {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", folder)
  const { data } = await apiClient.post<
    ApiResponse<{ url: string; publicId: string }>
  >("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data.data
}
