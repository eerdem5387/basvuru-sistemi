import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
});

const PAGE_TITLE =
  process.env.NEXT_PUBLIC_APPLICATION_MODE === "bursluluk"
    ? "Bursluluk Sınavı Başvuru Formu - Levent Koleji"
    : "2026-2027 Yaz Okulu Başvuru Formu - Levent Koleji";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#121a4f",
};

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_TITLE,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_TITLE,
    url: 'https://basvuru.leventokullari.com',
    siteName: 'Levent Koleji Başvuru Sistemi',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'Levent Koleji Logo',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: PAGE_TITLE,
    description: PAGE_TITLE,
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
