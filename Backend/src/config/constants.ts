// ─── Application Constants ──────────────────────────────────────────────────

/** Default pagination */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/** Cache TTLs (seconds) */
export const CACHE_TTL = {
  PRODUCTS_LIST: 300,       // 5 minutes
  PRODUCT_DETAIL: 600,      // 10 minutes
  CATEGORIES: 3600,         // 1 hour
  BRANDS: 3600,             // 1 hour
  FEATURED_PRODUCTS: 300,   // 5 minutes
  USER_SESSION: 86_400,     // 24 hours
  OTP: 600,                 // 10 minutes
  CART: 1_800,              // 30 minutes
} as const;

/** Cache key prefixes */
export const CACHE_KEY = {
  PRODUCT: "product:",
  PRODUCTS_LIST: "products:list:",
  CATEGORY: "category:",
  CATEGORIES_ALL: "categories:all",
  BRANDS_ALL: "brands:all",
  FEATURED: "products:featured",
  TRENDING: "products:trending",
  CART: "cart:",
  SESSION: "session:",
  OTP: "otp:",
  RATE_LIMIT: "rl:",
} as const;

/** Order status flow */
export const ORDER_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  PROCESSING: "PROCESSING",
  PACKED: "PACKED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

export type OrderStatusType = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** Valid order status transitions */
export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

/** Payment status */
export const PAYMENT_STATUS = {
  INITIATED: "INITIATED",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  PARTIAL_REFUNDED: "PARTIAL_REFUNDED",
} as const;

/** Shipment status */
export const SHIPMENT_STATUS = {
  CREATED: "CREATED",
  PICKUP_BOOKED: "PICKUP_BOOKED",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  RTO: "RTO",
  CANCELLED: "CANCELLED",
} as const;

/** User roles */
export const USER_ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
  VENDOR: "VENDOR",
} as const;

export type UserRoleType = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/** Discount tiers — matching frontend CartContext exactly */
export const DISCOUNT_TIERS = [
  { threshold: 0, label: "Standard Shipping", discountPct: 0, shipping: 99 },
  { threshold: 999, label: "Free Shipping", discountPct: 0, shipping: 0 },
  { threshold: 1550, label: "Flat 15% Discount", discountPct: 15, shipping: 0 },
  { threshold: 2500, label: "Flat 20% Discount", discountPct: 20, shipping: 0 },
] as const;

/** Address types */
export const ADDRESS_TYPES = ["HOME", "WORK", "OTHER"] as const;

/** Product sort options — matching frontend exactly */
export const SORT_OPTIONS = {
  featured: { field: "featuredRank", direction: "asc" },
  "price-asc": { field: "price", direction: "asc" },
  "price-desc": { field: "price", direction: "desc" },
  rating: { field: "rating", direction: "desc" },
  "name-asc": { field: "name", direction: "asc" },
  "name-desc": { field: "name", direction: "desc" },
} as const;

/** Product tags */
export const PRODUCT_TAGS = ["Bestseller", "New", "Set"] as const;

/** COD surcharge */
export const COD_SURCHARGE = 50;

/** Max addresses per user */
export const MAX_ADDRESSES_PER_USER = 10;

/** Guest cart expiry (30 days in seconds) */
export const GUEST_CART_EXPIRY_DAYS = 30;

/** Low stock threshold */
export const LOW_STOCK_THRESHOLD = 5;

/** Indian states list */
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh",
] as const;
