import { z } from "zod";
import { ORDER_STATUS } from "../../config/constants.js";

export const placeOrderSchema = z.object({
  addressId: z.coerce.number().int().positive(),
  paymentMethod: z.enum(["COD", "ONLINE"]),
  couponCode: z.string().max(50).optional().nullable(),
});

export const orderIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const orderListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  status: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PAID,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.PACKED,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.REFUNDED,
  ]),
});
