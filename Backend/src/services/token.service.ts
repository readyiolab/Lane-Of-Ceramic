import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const hashPassword = (value: string) => bcrypt.hash(value, 12);
export const comparePassword = (value: string, hashed: string) => bcrypt.compare(value, hashed);
export const signAccessToken = (sub: string, role: string) => jwt.sign({ role }, env.JWT_ACCESS_SECRET, { subject: sub, expiresIn: env.JWT_ACCESS_EXPIRES_IN as any });
export const signRefreshToken = (sub: string) => jwt.sign({}, env.JWT_REFRESH_SECRET, { subject: sub, expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });
