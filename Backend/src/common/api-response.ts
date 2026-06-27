import { Response } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** Standardised API response builder. */
export class ApiResponse {
  // ── Success ────────────────────────────────────────────────

  static success<T>(res: Response, data: T, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
    });
  }

  static created<T>(res: Response, data: T) {
    return ApiResponse.success(res, data, 201);
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }

  static message(res: Response, message: string, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
    });
  }

  // ── Paginated ──────────────────────────────────────────────

  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
  ) {
    const totalPages = Math.ceil(total / limit);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return res.status(200).json({
      success: true,
      data,
      meta,
    });
  }

  // ── Error ──────────────────────────────────────────────────

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    code?: string,
    details?: unknown,
  ) {
    const body: Record<string, unknown> = {
      success: false,
      message,
    };
    if (code) body.code = code;
    if (details) body.errors = details;

    return res.status(statusCode).json(body);
  }
}
