// src/controllers/registrationController.js
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();


const prisma = new PrismaClient();

// Buat transporter untuk email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtp.gmail.com
  port: process.env.SMTP_PORT, // 587
  secure: false, // pakai STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // 🔑 penting untuk Gmail
  },
});

// ✅ CREATE registrasi baru
export const createRegistration = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Simpan ke DB
    const registration = await prisma.registration.create({
      data: { name, email },
    });

    // Kirim email notifikasi
    const mailOptions = {
      from: `"Panitia Acara" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Registrasi Berhasil",
      text: `Halo ${name},\n\nTerima kasih sudah registrasi. QR code check-in Anda akan diberikan saat acara.\n\nSalam,\nPanitia`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil, email terkirim",
      data: registration,
    });
  } catch (error) {
    console.error("❌ Error registrasi:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ GET semua registrasi
export const getRegistrations = async (req, res) => {
  try {
    const registrations = await prisma.registration.findMany();
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ GET summary (jumlah peserta)
export const getSummary = async (req, res) => {
  try {
    const total = await prisma.registration.count();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
