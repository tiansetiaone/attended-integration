"use client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [summary, setSummary] = useState({ total: 0, attended: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/registrations/summary`);
      const json = await res.json();
      setSummary(json);
    };
    fetchData();

    // refresh tiap 5 detik biar real-time
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", textAlign: "center" }}>
      <h1>Dashboard Kehadiran</h1>
      <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 8, marginTop: 20 }}>
        <h2>Total Registrasi: {summary.total}</h2>
        <h2>Sudah Hadir: {summary.attended}</h2>
        <h2>Belum Hadir: {summary.total - summary.attended}</h2>
      </div>
    </main>
  );
}
