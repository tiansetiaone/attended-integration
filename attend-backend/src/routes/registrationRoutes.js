import express from "express";
import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { z } from "zod";

const router = express.Router();
const prisma = new PrismaClient();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

// utils
const genToken = () => crypto.randomBytes(16).toString("base64url");

// Zod schema untuk validasi input
const RegistrationSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  eventId: z.string().min(1)
});

// 📌 Registrasi baru
router.post("/", async (req, res) => {
  try {
    const parse = RegistrationSchema.safeParse(req.body);
    if (!parse.success) {
      return res
        .status(400)
        .json({ error: "Invalid payload", details: parse.error.flatten() });
    }
    const { fullName, email, phone, organization, eventId } = parse.data;

    const token = genToken();

    const reg = await prisma.registration.create({
      data: { fullName, email, phone, organization, eventId, token },
    });

    // payload untuk QR
    const payload = `ATTEND:${reg.id}:${token}`;

    // QR buffer
    const qrPng = await QRCode.toBuffer(payload, { type: "png", margin: 1, width: 512 });

    // kirim email tiket
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Tiket Registrasi - ${eventId}`,
      text: `Halo ${fullName},\n\nTerima kasih sudah registrasi. Tiket QR dilampirkan.\nAtau buka: ${process.env.FRONTEND_ORIGIN?.split(",")[0]}/ticket/${reg.id}`,
      attachments: [{ filename: `ticket-${reg.id}.png`, content: qrPng, contentType: "image/png" }]
    });

    res.status(201).json({ id: reg.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Summary (jumlah registrasi & hadir)
router.get("/summary", async (req, res) => {
  try {
    const total = await prisma.registration.count();
    const checkedIn = await prisma.registration.count({
      where: { checkedInAt: { not: null } },
    });
    res.json({
      total,
      checkedIn,
      pending: total - checkedIn,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});


// 📌 List semua registrasi
router.get("/", async (req, res) => {
  try {
    const regs = await prisma.registration.findMany({
      orderBy: { createdAt: "desc" }, // urutkan terbaru dulu
    });
    res.json(regs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});


// 📌 Detail peserta
router.get("/:id", async (req, res) => {
  try {
    const reg = await prisma.registration.findUnique({
      where: { id: req.params.id },
    });
    if (!reg) return res.status(404).json({ error: "Not found" });
    res.json(reg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// 📌 QR code untuk peserta (base64 JSON)
router.get("/:id/qr", async (req, res) => {
  const { id } = req.params;
  const reg = await prisma.registration.findUnique({ where: { id } });
  if (!reg) return res.status(404).json({ error: "Not found" });

  const qrData = `ATTEND:${reg.id}:${reg.token}`;

  try {
    const qrBase64 = await QRCode.toDataURL(qrData, { margin: 1, width: 512 });
    res.json({ qr: qrBase64 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate QR" });
  }
});

// 📌 Check-in via QR payload
router.post("/checkin", async (req, res) => {
  const CheckinSchema = z.object({ payload: z.string().min(10) });
  const parse = CheckinSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid payload" });

  const parts = parse.data.payload.split(":");
  if (parts.length !== 3 || parts[0] !== "ATTEND") {
    return res.status(400).json({ ok: false, status: "invalid_format" });
  }
  const [, id, token] = parts;

  const reg = await prisma.registration.findUnique({ where: { id } });
  if (!reg) return res.status(404).json({ ok: false, status: "not_found" });

  if (reg.token !== token) {
    return res.status(401).json({ ok: false, status: "invalid_token" });
  }

  if (reg.checkedInAt) {
    return res.json({
      ok: true,
      status: "already_used",
      registration: { id: reg.id, fullName: reg.fullName, email: reg.email },
    });
  }

  const updated = await prisma.registration.update({
    where: { id },
    data: { checkedInAt: new Date() },
  });

  res.json({
    ok: true,
    status: "valid",
    registration: { id: updated.id, fullName: updated.fullName, email: updated.email },
  });
});

export default router;
