import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/public/styles/fontawesome/all.min.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SPEED Case Management System",
  description: "Track and monitor case management teams in HIV program",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
          {children}
      </body>
    </html>
  );
}
