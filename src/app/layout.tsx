import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#073954",
};

export const metadata: Metadata = {
  title: {
    default: "Más Café | Café de especialidad colombiano",
    template: "%s | Más Café",
  },
  description:
    "Tostadores de café de especialidad en Cali, Colombia. Microlotes frescos, trazabilidad al origen y experiencias de hospitalidad consciente.",
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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
