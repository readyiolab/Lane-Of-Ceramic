import { PAGINATION } from "../config/constants.js";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/** Parse and sanitise pagination query params */
export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, Number(query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, Number(query.limit) || PAGINATION.DEFAULT_LIMIT),
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/** Build Prisma orderBy from sort string */
export function buildOrderBy(sort: string | undefined): Record<string, "asc" | "desc"> {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "rating":
      return { rating: "desc" };
    case "name-asc":
      return { name: "asc" };
    case "name-desc":
      return { name: "desc" };
    case "newest":
      return { createdAt: "desc" };
    case "featured":
    default:
      return { featuredRank: "asc" };
  }
}
