import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "read-log",
  description: "Private Lese-Bibliothek mit KI-Zusammenfassung und Chat",
  appleWebApp: { capable: true, title: "read-log", statusBarStyle: "black" },
};
export const viewport: Viewport = { themeColor: "#1a1a1a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
