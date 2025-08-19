"use client";
import { useEffect, useState } from "react";

export default function TicketPage({ params }) {
  const { id } = params;
  const [reg, setReg] = useState(null);
  const [qr, setQr] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Ambil detail registrasi
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/registrations/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Tiket tidak ditemukan");
        return res.json();
      })
      .then((data) => setReg(data))
      .catch((err) => setError(err.message));

    // Ambil QR base64
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/registrations/${id}/qr`)
      .then((res) => res.json())
      .then((data) => setQr(data.qr))
      .catch(() => setError("Gagal memuat QR"));
  }, [id]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
        <p className="text-center text-red-400 text-lg font-semibold">❌ {error}</p>
      </main>
    );
  }

  if (!reg) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
        <p className="animate-pulse text-gray-300">🔄 Memuat tiket...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl p-8 text-center border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-yellow-400 flex items-center justify-center gap-2">
          🎟 Tiket Registrasi
        </h1>

        <div className="space-y-2 mb-6 text-gray-200">
          <p>
            <span className="font-semibold text-white">Nama:</span> {reg.fullName}
          </p>
          <p>
            <span className="font-semibold text-white">Email:</span> {reg.email}
          </p>
          <p>
            <span className="font-semibold text-white">Event:</span> {reg.eventId}
          </p>
        </div>

        <div className="flex justify-center mb-4">
          {qr ? (
            <img
              alt="QR Ticket"
              src={qr}
              className="w-64 h-64 rounded-lg border-4 border-yellow-400 shadow-lg bg-white"
            />
          ) : (
            <p className="text-gray-400">🔄 QR sedang dibuat...</p>
          )}
        </div>

        <p className="text-sm text-gray-400 mt-4">
          Silakan simpan atau tunjukkan QR ini saat check-in.
        </p>
      </div>
    </main>
  );
}
