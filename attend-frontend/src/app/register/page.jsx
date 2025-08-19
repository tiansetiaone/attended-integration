"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";

export default function RegisterPage() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/registrations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) throw new Error("Gagal registrasi");

      setSuccessMsg("Registrasi berhasil! 🎉 Cek email untuk QR tiket.");
      reset();
    } catch (err) {
      console.error(err);
      setErrorMsg("❌ Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-pink-100 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg animate-fade-in">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          ✍️ Form Registrasi Peserta
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("fullName")}
            placeholder="Nama Lengkap"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-black transition"
            required
          />
          <input
            {...register("email")}
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-black transition"
            required
          />
          <input
            {...register("phone")}
            placeholder="Nomor HP"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-black transition"
          />
          <input
            {...register("organization")}
            placeholder="Organisasi"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-black transition"
          />
          <input
            {...register("eventId")}
            placeholder="Kode Event (misal: ACARA-2025)"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-black transition"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-3 rounded-xl transition hover:bg-indigo-700 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Memproses...
              </>
            ) : (
              "Daftar Sekarang"
            )}
          </button>
        </form>

        {/* ✅ Notifikasi hasil */}
        {successMsg && (
          <div className="mt-4 p-3 rounded-lg bg-green-100 text-green-800 text-center">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-red-100 text-red-800 text-center">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
