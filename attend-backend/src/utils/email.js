// src/utils/email.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // pakai STARTTLS, kalau true maka port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ⚠️ hanya untuk dev
  },
});

export default async function sendEmail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || `"Attend App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
    console.log("✅ Email terkirim:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Gagal kirim email:", err);
    throw err;
  }
}
