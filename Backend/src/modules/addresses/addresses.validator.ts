import { z } from "zod";
const AddressType = {
  HOME: "HOME",
  WORK: "WORK",
  OTHER: "OTHER",
} as const;

export const createAddressSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(150),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
  email: z.string().email("Invalid email").optional().nullable(),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  addressLine1: z.string().min(5, "Address must be at least 5 characters").max(255),
  addressLine2: z.string().max(255).optional().nullable(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  country: z.string().default("India").optional(),
  landmark: z.string().max(120).optional().nullable(),
  addressType: z.nativeEnum(AddressType).default(AddressType.HOME),
  isDefault: z.boolean().default(false).optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

export const addressIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
