import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-store";
import { SiteNav } from "@/components/site-nav";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VietTravel - Chợ đặt tour, khách sạn & vé",
  description:
    "Nền tảng đặt dịch vụ du lịch trực tuyến: tour, khách sạn, vé tham quan. Thanh toán qua VNPAY.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="vi" className={inter.variable}>
      <body className="min-h-[100dvh] antialiased">
        <CartProvider>
          <SiteNav />
          <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}