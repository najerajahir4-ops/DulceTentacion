import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { MeltFilters } from "@/components/ui/MeltFilters";
import { CustomCursor } from "@/components/ui/CustomCursor";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Avita | Ice Cream & Waffles",
  description: "El sabor que te hará volver. Frappés, waffles y helados artesanales.",
  openGraph: {
    title: "Avita | Ice Cream & Waffles",
    description: "El sabor que te hará volver. Frappés, waffles y helados artesanales.",
    type: "website",
    locale: "es_EC",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground overflow-x-hidden">
        <MeltFilters />
        {children}
      </body>
    </html>
  );
}
