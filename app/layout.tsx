import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bursluluk Sınavı Başvuru Sistemi - Levent Koleji",
  description: "2025 Yılı Bursluluk Sınavı İçin Başvuru Formu - Levent Koleji",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Bursluluk Sınavı Başvuru Sistemi - Levent Koleji",
    description: "2025 Yılı Bursluluk Sınavı İçin Başvuru Formu - Levent Koleji",
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
    title: "Bursluluk Sınavı Başvuru Sistemi - Levent Koleji",
    description: "2025 Yılı Bursluluk Sınavı İçin Başvuru Formu - Levent Koleji",
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
