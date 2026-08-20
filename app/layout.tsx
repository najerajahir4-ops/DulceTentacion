import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
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
      className={`${nunito.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
