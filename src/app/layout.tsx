import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MemoryMakers | Elite Photographers Community & Booking Marketplace",
  description:
    "Discover, compare, and book visionary wedding, pre-wedding, and luxury event photographers. Connect with master visual artisans who craft timeless memories.",
  keywords: [
    "wedding photography",
    "pre-wedding shoot",
    "photographer community",
    "hire photographer",
    "destination wedding",
    "maternity photographer",
    "drone cinematography",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jakarta.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#08090d] text-zinc-100 selection:bg-amber-400 selection:text-black">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
