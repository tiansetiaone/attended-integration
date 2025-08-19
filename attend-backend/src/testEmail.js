import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // pakai STARTTLS, bukan SSL langsung
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // <- bypass sertifikat self-signed
  },
});


    let info = await transporter.sendMail({
      from: `"Attend App" <${process.env.SMTP_USER}>`,
      to: "test@example.com",
      subject: "Test Email",
      text: "Halo ini email testing dari Attend App",
    });

    console.log("✅ Email terkirim:", info.messageId);
  } catch (err) {
    console.error("❌ Gagal kirim email:", err);
  }
}

main();
