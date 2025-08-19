"use client";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function CheckinPage() {
  const [scanResult, setScanResult] = useState(null);
  const [checkinStatus, setCheckinStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(
      async (decodedText) => {
        setScanResult(decodedText);
        setLoading(true);
        scanner.clear();

        try {
const res = await fetch(
  `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/registrations/checkin`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload: decodedText }),
  }
);


          const data = await res.json();
          setCheckinStatus(data);
        } catch (err) {
          console.error("Checkin error:", err);
          setCheckinStatus({ ok: false, status: "network_error" });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.warn("Scan error:", error);
      }
    );

    return () => {
      scanner.clear().catch((err) => console.error(err));
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 from-gray-50 to-gray-100 p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold mb-6 text-white"
      >
        📲 Sistem Check-in
      </motion.h1>

      <div
        id="reader"
        className="w-[300px] h-[300px] bg-white shadow-md border border-gray-200 rounded-xl text-black"
      ></div>

      {/* Scan result text */}
      {scanResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gray-50 border rounded-lg shadow-sm w-full max-w-md text-white"
        >
          <p className="text-xs uppercase tracking-wide text-white">
            QR Result
          </p>
          <p className="font-mono text-sm break-words text-black mt-1">
            {scanResult}
          </p>
        </motion.div>
      )}

      {/* Loading state */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 flex items-center space-x-2 text-blue-600"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <p className="font-medium">Memproses check-in...</p>
        </motion.div>
      )}

      {/* Status check-in */}
      <AnimatePresence>
        {checkinStatus && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`mt-6 p-4 rounded-xl shadow-md w-full max-w-md flex items-center space-x-3 ${
              checkinStatus.ok
                ? checkinStatus.status === "valid"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {checkinStatus.ok ? (
              checkinStatus.status === "valid" ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )
            ) : (
              <XCircle className="w-6 h-6" />
            )}

            <div className="flex-1">
              {checkinStatus.ok ? (
                <>
                  {checkinStatus.status === "valid" && (
                    <p className="font-semibold">
                      ✅ {checkinStatus.registration.fullName} berhasil check-in!
                    </p>
                  )}
                  {checkinStatus.status === "already_used" && (
                    <p className="font-semibold">
                      ⚠️ Tiket sudah digunakan oleh{" "}
                      {checkinStatus.registration.fullName}
                    </p>
                  )}
                </>
              ) : (
                <p className="font-semibold">
                  ❌ Check-in gagal ({checkinStatus.status})
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
