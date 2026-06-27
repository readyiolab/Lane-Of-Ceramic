import axios from "axios";
import { env } from "../config/env.js";
import { createModuleLogger } from "../utils/logger.js";

const log = createModuleLogger("sms-service");

export const smsService = {
  /**
   * Send SMS via apitxt.com API.
   */
  async sendSMS(phone: string, message: string) {
    if (env.SMS_API_KEY === "change_me") {
      log.warn({ phone, message }, "SMS API Key not configured. SMS suppressed (Logged only)");
      return;
    }

    try {
      // Standard payload structure for apitxt.com
      const payload = {
        apiKey: env.SMS_API_KEY,
        senderId: env.SMS_SENDER_ID,
        route: "otp", // default transactional route
        numbers: phone,
        message,
      };

      const response = await axios.post(`${env.SMS_BASE_URL}/api/v1/sms/send`, payload);

      log.info(
        { response: response.data, phone: phone.slice(-4) },
        "SMS message sent successfully via apitxt.com",
      );
    } catch (err: any) {
      log.error(
        { err: err.response?.data || err.message, phone },
        "Failed to send SMS via apitxt.com",
      );
    }
  },

  /**
   * Send OTP SMS.
   */
  async sendOtpSMS(phone: string, otp: string) {
    const message = `Your Ceramic Studio verification OTP is ${otp}. Valid for 10 minutes. Do not share this with anyone.`;
    await this.sendSMS(phone, message);
  },

  /**
   * Send Shipping Update SMS.
   */
  async sendShippingUpdateSMS(phone: string, orderNumber: string, awb: string, trackingUrl: string) {
    const message = `Good news! Your Ceramic Studio order ${orderNumber} has been shipped. AWB: ${awb}. Track status: ${trackingUrl}`;
    await this.sendSMS(phone, message);
  },
};
