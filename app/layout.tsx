import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { MeltFilters } from "@/components/ui/MeltFilters";
import { CartProvider } from "@/components/CartContext";

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
  title: "Avita | Helados Artesanales y Waffles",
  description: "Los mejores frappés, waffles y helados artesanales elaborados con ingredientes naturales. Pide a domicilio o visítanos frente al Parque Helen Tenka.",
  keywords: "helados, waffles, frappés, postres, heladería artesanal, helados a domicilio, parque helen tenka, avita, heladería, postres cerca de mi",
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
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground overflow-x-hidden">
        {/* Global Noise Overlay for premium matte feel */}
        <div 
          className="pointer-events-none fixed inset-0 z-[100] h-full w-full opacity-[0.035] mix-blend-overlay" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
        <CartProvider>
          <MeltFilters />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
