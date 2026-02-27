import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0a',
};

export const metadata: Metadata = {
  title: "Archivo ALSIL — Análisis, opinión y cultura",
  description: "Blog de análisis, opinión y divulgación sobre ciencia, ingeniería, política, arte y cultura.",
  icons: { icon: "/uploads/logo.png" },
  openGraph: {
    title: 'Archivo ALSIL',
    description: 'Análisis, opinión y divulgación sobre ciencia, ingeniería, política, arte y cultura.',
    siteName: 'Archivo ALSIL',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased bg-zinc-950 text-zinc-100`}>
        {children}
      </body>
    </html>
  );
}
