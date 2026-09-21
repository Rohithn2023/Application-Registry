import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Application Registry — Centralized Application Documentation",
  description:
    "A centralized system for documenting and managing information about software applications, their technologies, and inter-application relationships.",
  keywords: ["application registry", "software documentation", "technology stack", "application management"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
