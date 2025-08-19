import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Attendance System",
  description: "QR-based attendance confirmation app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <main className="min-h-screen flex flex-col">
          {/* Navbar / Header bisa ditambahkan di sini */}
          <div className="flex-1">{children}</div>
          {/* Footer */}
          <footer className="p-4 text-center text-sm text-gray-500 border-t">
            © {new Date().getFullYear()} Attendance System
          </footer>
        </main>
      </body>
    </html>
  );
}
