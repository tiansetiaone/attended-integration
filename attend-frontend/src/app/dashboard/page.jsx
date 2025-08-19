"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, CheckCircle, Clock, Search } from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | hadir | belum

  // fetch summary
  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/registrations/summary`
        );
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        console.error("Failed to fetch summary:", err);
      }
    }
    fetchSummary();
    const interval = setInterval(fetchSummary, 5000);
    return () => clearInterval(interval);
  }, []);

  // fetch daftar registrasi
  useEffect(() => {
    async function fetchRegistrations() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/registrations`
        );
        const data = await res.json();
        setRegistrations(data);
      } catch (err) {
        console.error("Failed to fetch registrations:", err);
      }
    }
    fetchRegistrations();
    const interval = setInterval(fetchRegistrations, 5000);
    return () => clearInterval(interval);
  }, []);

  const cards = summary
    ? [
        {
          title: "Total Registrasi",
          value: summary.total,
          color: "from-blue-500 to-indigo-500",
          icon: <Users className="w-6 h-6" />,
        },
        {
          title: "Hadir",
          value: summary.checkedIn,
          color: "from-green-500 to-emerald-500",
          icon: <CheckCircle className="w-6 h-6" />,
        },
        {
          title: "Belum Hadir",
          value: summary.pending,
          color: "from-yellow-400 to-orange-500",
          icon: <Clock className="w-6 h-6" />,
        },
      ]
    : [];

  // filter + search
  const filteredRegistrations = registrations.filter((r) => {
    const matchSearch =
      r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.organization?.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "all"
        ? true
        : filter === "hadir"
        ? r.checkedInAt
        : !r.checkedInAt;

    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <h1 className="text-3xl font-extrabold mb-8 text-black">
        📊 Dashboard Kehadiran
      </h1>

      {/* Summary cards */}
      {summary ? (
        <div className="grid gap-6 md:grid-cols-3 mb-10">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-2xl shadow-md p-6 text-white bg-gradient-to-br ${card.color} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{card.title}</h2>
                <div className="p-2 bg-white/20 rounded-full">{card.icon}</div>
              </div>
              <p className="text-4xl font-extrabold tracking-tight">
                {card.value}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500 animate-pulse">Loading data...</p>
        </div>
      )}

      {/* Daftar registrasi */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <h2 className="text-xl font-bold text-black">📋 Daftar Registrasi</h2>

          {/* Search + Filter */}
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-3 py-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-500"
            >
              <option value="all">Semua</option>
              <option value="hadir">Hadir</option>
              <option value="belum">Belum Hadir</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 border-b">Nama</th>
                <th className="p-3 border-b">Email</th>
                <th className="p-3 border-b">Organisasi</th>
                <th className="p-3 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b text-black">{r.fullName || r.name}</td>
                    <td className="p-3 border-b text-black">{r.email}</td>
                    <td className="p-3 border-b text-black">{r.organization || "-"}</td>
                    <td className="p-3 border-b text-black">
                      {r.checkedInAt ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                          Hadir
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                          Belum Hadir
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    Tidak ada data cocok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
