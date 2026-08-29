"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Key,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Official logo linked from Admin Settings
  const [logoUrl, setLogoUrl] = useState<string>("/images/logo.webp");

  useEffect(() => {
    fetch("/api/settings?_t=" + Date.now(), { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.logoUrl) {
          setLogoUrl(json.data.logoUrl);
        }
      })
      .catch((err) => console.error("Error al cargar logo en login:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Credenciales inválidas. Verifica tu usuario y contraseña.");
        setIsLoading(false);
        return;
      }

      // Smooth transition to dashboard
      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      console.error("Error al iniciar sesión:", err);
      setErrorMessage("Ocurrió un error al conectar con el servidor. Intenta nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF4EC] waffle-bg-pattern flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative selection:bg-[#C81D31] selection:text-white overflow-hidden">
      {/* Warm Ambient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF4EC]/50 via-transparent to-[#FAF4EC]/80 pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full bg-[#D49B4B]/10 blur-3xl pointer-events-none" />

      {/* Centered Clean Container */}
      <div className="w-full max-w-md relative z-10 space-y-6 sm:space-y-8 flex flex-col items-center">
        
        {/* Brand Header */}
        <div className="text-center space-y-2 w-full">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2C1A14] tracking-tight">
            Panel de Control
          </h1>
          <p className="text-xs sm:text-sm text-[#2C1A14]/70 font-sans max-w-xs mx-auto">
            Ingresa tus credenciales para administrar el menú, promociones y métricas.
          </p>
        </div>

        {/* CARD CON LA MORDIDA EN LA ESQUINA (Bitten Corner Mask) & BORDE DORADO FINO */}
        <div className="w-full relative filter drop-shadow-[0_20px_35px_rgba(44,26,20,0.14)]">
          
          {/* Bitten Outer Layer: Fine Gold Border (#D49B4B) */}
          <div className="bitten-corner-mask p-[1.5px] bg-[#D49B4B]">
            
            {/* Bitten Inner Layer: Crema Vainilla (#FAF4EC) Card */}
            <div className="bitten-corner-mask bg-[#FAF4EC] p-7 sm:p-9 relative">
              
              {/* Official Waffle Logo linked from Admin Settings */}
              <div className="flex flex-col items-center justify-center pb-6 border-b border-[#E5D5C0]">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-1 group">
                  <div className="absolute inset-0 rounded-full bg-[#D49B4B]/20 blur-xl group-hover:bg-[#D49B4B]/30 transition-all" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Logo Oficial Dulce Tentación"
                    className="w-full h-full object-contain relative z-10 drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = "true";
                        target.src = "/images/logo.webp";
                      }
                    }}
                  />
                </div>
                <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#D49B4B] mt-1">
                  Repostería & Gelato Artesanal
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5 pt-6">
                {/* Error Alert */}
                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C81D31]" />
                    <div className="leading-relaxed font-semibold">{errorMessage}</div>
                  </div>
                )}

                {/* Username Field with Custom Chocolate Amargo Icon */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2C1A14] uppercase tracking-wider font-sans">
                    Usuario
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 flex items-center pointer-events-none z-10">
                      <div className="w-8 h-8 rounded-lg bg-[#F4EBDC] border border-[#D49B4B]/40 flex items-center justify-center shadow-2xs">
                        <User className="w-4 h-4 text-[#2C1A14]" />
                      </div>
                    </div>
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full pl-14 pr-4 py-3 bg-[#F4EBDC]/50 border border-[#D49B4B]/40 rounded-xl text-sm font-medium text-[#2C1A14] placeholder-[#2C1A14]/35 focus:outline-none focus:ring-2 focus:ring-[#C81D31] focus:border-transparent transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Password Field with Custom Chocolate Amargo Key Icon */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#2C1A14] uppercase tracking-wider font-sans">
                      Contraseña
                    </label>
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 flex items-center pointer-events-none z-10">
                      <div className="w-8 h-8 rounded-lg bg-[#F4EBDC] border border-[#D49B4B]/40 flex items-center justify-center shadow-2xs">
                        <Key className="w-4 h-4 text-[#2C1A14]" />
                      </div>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-14 pr-11 py-3 bg-[#F4EBDC]/50 border border-[#D49B4B]/40 rounded-xl text-sm font-medium text-[#2C1A14] placeholder-[#2C1A14]/35 focus:outline-none focus:ring-2 focus:ring-[#C81D31] focus:border-transparent transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-[#2C1A14]/50 hover:text-[#C81D31] transition-colors cursor-pointer p-1"
                      aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-[#2C1A14]" /> : <Eye className="w-4 h-4 text-[#2C1A14]" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#2C1A14] hover:bg-[#C81D31] text-[#FAF4EC] font-sans font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2 group border border-[#D49B4B]/30 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#FAF4EC]" />
                      <span>Verificando credenciales...</span>
                    </>
                  ) : (
                    <span>Ingresar al Panel</span>
                  )}
                </button>
              </form>

              {/* Back to store link */}
              <div className="mt-6 pt-5 border-t border-[#E5D5C0] text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2C1A14]/70 hover:text-[#C81D31] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Volver a la Tienda Pública
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Footnote */}
        <p className="text-[11px] text-[#2C1A14]/50 text-center">
          Dulce Tentación • Acceso administrativo privado con cifrado seguro.
        </p>

      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#FAF4EC] waffle-bg-pattern flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#2C1A14]" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </>
  );
}
