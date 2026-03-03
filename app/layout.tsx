import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Second Brain — WhatsApp'ı İkinci Beynine Dönüştür",
  description:
    "Sesli notları, linkleri ve görselleri WhatsApp üzerinden kaydet. Yapay zeka ile anında geri çağır. secondbrain.com.tr",
  keywords: [
    "second brain",
    "whatsapp bot",
    "yapay zeka asistan",
    "bilgi yönetimi",
    "sesli not",
    "link özet",
    "secondbrain.com.tr",
  ],
  authors: [{ name: "Second Brain", url: "https://secondbrain.com.tr" }],
  metadataBase: new URL("https://secondbrain.com.tr"),
  openGraph: {
    title: "Second Brain — WhatsApp'ı İkinci Beynine Dönüştür",
    description:
      "Sesli notları, linkleri ve görselleri WhatsApp üzerinden kaydet. Yapay zeka ile anında geri çağır.",
    url: "https://secondbrain.com.tr",
    siteName: "Second Brain",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Second Brain",
    description: "WhatsApp'ı İkinci Beynine Dönüştür",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className="bg-black text-white antialiased font-body">
        {children}
      </body>
    </html>
  );
}
