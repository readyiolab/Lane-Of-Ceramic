import { Router } from "express";
import { addressController } from "./addresses.controller.js";
import { validateBody, validateParams } from "../../middlewares/validate.middleware.js";
import { authGuard } from "../../middlewares/auth.middleware.js";
import { createAddressSchema, updateAddressSchema, addressIdParamSchema } from "./addresses.validator.js";

export const addressesRouter = Router();

// Secure all address routes
addressesRouter.use(authGuard);

/**
 * @swagger
 * /addresses:
 *   get:
 *     tags: [Addresses]
 *     summary: Get all saved addresses of current user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of user addresses }
 */
addressesRouter.get("/", addressController.list);

/**
 * @swagger
 * /addresses/{id}:
 *   get:
 *     tags: [Addresses]
 *     summary: Get address details by ID
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Address object }
 */
addressesRouter.get("/:id", validateParams(addressIdParamSchema), addressController.getById);

/**
 * @swagger
 * /addresses:
 *   post:
 *     tags: [Addresses]
 *     summary: Add new delivery address
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Address created }
 */
addressesRouter.post("/", validateBody(createAddressSchema), addressController.create);

/**
 * @swagger
 * /addresses/{id}:
 *   patch:
 *     tags: [Addresses]
 *     summary: Update existing address
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Address updated }
 */
addressesRouter.patch(
  "/:id",
  validateParams(addressIdParamSchema),
  validateBody(updateAddressSchema),
  addressController.update,
);

/**
 * @swagger
 * /addresses/{id}:
 *   delete:
 *     tags: [Addresses]
 *     summary: Remove address
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Address deleted }
 */
addressesRouter.delete("/:id", validateParams(addressIdParamSchema), addressController.remove);
