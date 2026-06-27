import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { createModuleLogger } from "../utils/logger.js";

const log = createModuleLogger("email-service");

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const emailService = {
  /**
   * Send transactional email.
   */
  async sendMail(to: string, subject: string, html: string, text?: string) {
    if (env.SMTP_USER === "change_me" || env.SMTP_PASS === "change_me") {
      log.warn({ to, subject }, "SMTP credentials not configured. Email suppressed (Logged only)");
      return;
    }

    try {
      const info = await transporter.sendMail({
        from: `"${env.APP_NAME}" <${env.SMTP_FROM}>`,
        to,
        subject,
        text: text ?? html.replace(/<[^>]*>/g, ""), // strip HTML for text fallback
        html,
      });

      log.info({ messageId: info.messageId, to }, "Email sent successfully");
    } catch (err: any) {
      log.error({ err: err.message, to }, "Failed to send email");
    }
  },

  /**
   * Send Welcome Email.
   */
  async sendWelcomeEmail(to: string, fullName: string) {
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to Ceramic Studio, ${fullName}!</h2>
        <p>Thank you for creating an account with us. We are thrilled to have you here.</p>
        <p>Explore our premium collections of handcrafted ceramic tableware, vases, and dinnerware.</p>
        <br/>
        <a href="${env.CORS_ORIGIN}/shop" style="background-color: #9c27b0; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Start Shopping</a>
        <br/><br/>
        <p>Warm regards,<br/>The Ceramic Studio Team</p>
      </div>
    `;
    await this.sendMail(to, "Welcome to Ceramic Studio", html);
  },

  /**
   * Send Password Reset Email.
   */
  async sendPasswordResetEmail(to: string, token: string) {
    const resetUrl = `${env.CORS_ORIGIN}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Reset Your Password</h2>
        <p>You requested a password reset. Click the button below to set a new password. This link is valid for 10 minutes.</p>
        <br/>
        <a href="${resetUrl}" style="background-color: #d32f2f; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <br/><br/>
        <p>If you did not request this, please ignore this email.</p>
        <p>Warm regards,<br/>The Ceramic Studio Team</p>
      </div>
    `;
    await this.sendMail(to, "Password Reset Request", html);
  },

  /**
   * Send Order Confirmation Email.
   */
  async sendOrderConfirmationEmail(to: string, orderNumber: string, totalAmount: number) {
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Order Confirmed!</h2>
        <p>Thank you for your order. We are preparing it with care.</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Total Amount Paid:</strong> INR ${totalAmount.toFixed(2)}</p>
        <br/>
        <a href="${env.CORS_ORIGIN}/profile/orders" style="background-color: #4caf50; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Track Order</a>
        <br/><br/>
        <p>Warm regards,<br/>The Ceramic Studio Team</p>
      </div>
    `;
    await this.sendMail(to, `Order Confirmation - ${orderNumber}`, html);
  },
};
