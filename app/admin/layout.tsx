import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel Administrador • Dulce Tentación",
  description: "Panel de control interno y gestión de menú.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
