export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: PaginationMeta
}

export interface User {
  id: string
  email: string
  fullName: string
  phone?: string | null
  role: string
  isEmailVerified?: boolean
  isActive?: boolean
  createdAt?: string
}

export interface DashboardStats {
  revenue: number
  ordersCount: number
  usersCount: number
  lowStockProducts: Array<{
    id: number
    name: string
    sku: string
    stockCount: number
  }>
  topSellingProducts: Array<{
    productId: number
    name: string
    sku: string
    totalQuantitySold: number
    totalRevenueGenerated: number
  }>
  recentOrders: Array<{
    id: number
    orderNumber: string
    customerName: string
    customerEmail: string
    totalAmount: number
    status: string
    createdAt: string
  }>
  monthlySales: Array<{
    month: string
    revenue: number
    orderCount: number
  }>
}

export interface Product {
  id: number
  name: string
  slug: string
  sku: string
  shortDescription?: string
  longDescription?: string
  material?: string
  dimensions?: string
  weight?: string
  categoryId: number
  brandId?: number | null
  price: number
  salePrice?: number | null
  isFeatured?: boolean
  isTrending?: boolean
  featuredRank?: number
  stockCount: number
  tags?: string[]
  seoTitle?: string
  seoDescription?: string
  images?: Array<{ id: number; url: string; isPrimary: boolean }>
  category?: { id: number; name: string }
  brand?: { id: number; name: string } | null
}

export interface Category {
  id: number
  name: string
  slug: string
  parentId?: number | null
  description?: string | null
  image?: string | null
  subtitle?: string | null
  displayOrder?: number
  sortOrder?: number
}

export interface Brand {
  id: number
  name: string
  slug: string
  description?: string | null
  logo?: string | null
}

export interface Order {
  id: number
  orderNumber: string
  status: string
  totalAmount: number
  subtotal?: number
  discountAmount?: number
  shippingAmount?: number
  paymentMethod?: string
  createdAt: string
  user?: { id: string; fullName: string; email: string }
  items?: Array<{
    id: number
    productName: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }>
  shippingAddress?: Record<string, string>
}

export interface Coupon {
  id: number
  code: string
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  minOrderValue?: number | null
  maxDiscount?: number | null
  usageLimit?: number | null
  usageCount?: number
  isFirstOrderOnly: boolean
  startsAt?: string | null
  expiresAt?: string | null
  isActive: boolean
}

export interface Bundle {
  id: number
  slug: string
  label: string
  tagline?: string | null
  itemCount: number
  price: number
  isActive: boolean
}

export interface DiscountTier {
  id: number
  threshold: number
  label: string
  icon?: string | null
  discountPct: number
  shipping: number
  sortOrder: number
  isActive: boolean
}

export interface Announcement {
  id: number
  text: string
  sortOrder: number
  isActive: boolean
  startsAt?: string | null
  endsAt?: string | null
}

export interface Review {
  id: number
  productId: number
  productName?: string
  userId: string
  userName?: string
  rating: number
  title?: string
  comment?: string
  isApproved: boolean
  createdAt: string
}

export interface SiteContent {
  key: string
  value: Record<string, unknown>
  updatedAt?: string
}
