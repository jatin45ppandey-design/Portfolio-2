import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const publicSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});

const publicMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-mono",
});

export const metadata: Metadata = {
  title: "Jatin Pandey — Computer Science Student",
  description:
    "Portfolio of Jatin Pandey, a Computer Science student and aspiring Java / Spring Boot developer building practical backend and full-stack projects.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${publicMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
