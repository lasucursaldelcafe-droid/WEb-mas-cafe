import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Cormorant_Garamond } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Más Café | Café de especialidad colombiano",
    template: "%s | Más Café",
  },
  description:
    "Tostadores de café de especialidad en Cali, Colombia. Microlotes frescos, trazabilidad al origen y experiencias de hospitalidad consciente.",
  keywords: [
    "café de especialidad",
    "café colombiano",
    "tostión",
    "Medellín",
    "microlotes",
  ],
  openGraph: {
    title: "Más Café | Café de especialidad colombiano",
    description:
      "La riqueza del grano en cada taza. Café fresco, trazable y extraordinario.",
    type: "website",
    locale: "es_CO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${dmSans.variable} ${cormorant.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
