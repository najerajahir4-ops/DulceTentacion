import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceso Privado • Dulce Tentación",
  description: "Portal de autenticación administrativo restringido.",
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

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
