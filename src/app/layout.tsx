import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const publicSans = Geist({ subsets: ["latin"], display: "swap", variable: "--font-public-sans" });
const publicMono = Geist_Mono({ subsets: ["latin"], display: "swap", variable: "--font-public-mono" });

export const metadata: Metadata = {
  title: "Jatin Pandey | Portfolio",
  description: "Jatin Pandey's developer portfolio — Java, Spring Boot, full-stack projects, education, leadership, certifications and achievements.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={publicSans.variable+" "+publicMono.variable+" h-full antialiased"}><body className="min-h-full flex flex-col">{children}</body></html>;
}
