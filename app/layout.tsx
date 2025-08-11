import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";

export const metadata = {
  title: "SmartHive Automation",
  description: "Smart home automation company website with quote builder and 3D demo."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
          <div className="container flex items-center justify-between py-3">
            <Link href="/" className="font-bold text-xl">SmartHive</Link>
            <nav className="flex items-center gap-4">
              <Link href="/quote" className="btn-outline">Get a Quote</Link>
              <Link href="/demo" className="btn-outline">3D Demo</Link>
              <Link href="/login" className="btn">Sign In</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t">
          <div className="container py-6 text-sm text-gray-500">© {new Date().getFullYear()} SmartHive by Dashath — Comfort beyond boundaries.</div>
        </footer>
      </body>
    </html>
  );
}
