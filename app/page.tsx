"use client";

import { useState, useEffect, useRef, memo, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  IceCream2, 
  MapPin, 
  ChevronLeft,
  ChevronRight,
  Search,
  LayoutGrid,
  List as ListIcon,
  Pencil,
  ShoppingBag,
  Sparkles,
  Heart,
  Leaf,
  User
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import dynamic from "next/dynamic";
import { DripDivider, MeltingCreamDivider } from "@/components/ui/DripDivider";
import { useCart } from "@/components/CartContext";
import { CartSidebar } from "@/components/ui/CartSidebar";
import { optimizeCloudinaryUrl } from "@/lib/image-utils";
import { GourmetPreloader } from "@/components/ui/GourmetPreloader";

const LiveEditorDrawer = dynamic(
  () => import("@/components/admin/LiveEditorDrawer").then((mod) => mod.LiveEditorDrawer),
  { ssr: false }
);

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

// Dynamic categories fetched from menu-types
const MENU_CATEGORIES = ["Todo", "Helados Artesanales", "Waffles", "Frappés", "Crepes", "Gelato", "Sabores de Gelato", "Bolos Gourmet", "Combos"];

// --- Animation Variants ---
const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};
const fadeUp: any = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

// --- Melting Card Component ---
const MeltingCard = memo(function MeltingCard({ 
  item, 
  onAddToCart,
  isLiveEditMode,
  onLiveEdit
}: { 
  item: any, 
  onAddToCart: (item: any) => void,
  isLiveEditMode?: boolean,
  onLiveEdit?: (item: any) => void
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dispMapRef = useRef<SVGFEDisplacementMapElement>(null);
  
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let rafId: number | null = null;
    const parent = cardRef.current?.parentElement;

    const update = () => {
      rafId = null;
      if (!cardRef.current || !dispMapRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;

      if (rect.right < -150 || rect.left > windowWidth + 150) return;

      const cardCenter = rect.left + rect.width / 2;
      const windowCenter = windowWidth / 2;
      const dist = Math.abs(cardCenter - windowCenter);
      const normalizedDist = Math.min(dist / (windowWidth / 1.5), 1);
      
      const meltValue = Math.pow(normalizedDist, 2) * 45; 
      const scaleValue = 1.1 - (normalizedDist * 0.25);
      const blurValue = normalizedDist * 8;
      const opacityValue = 1 - (normalizedDist * 0.6);
      const shadowOpacity = Math.max(0, 0.2 - (normalizedDist * 0.2));

      gsap.set(dispMapRef.current, { attr: { scale: meltValue } });
      gsap.set(cardRef.current, { 
        scale: scaleValue, 
        opacity: opacityValue,
        filter: blurValue > 0.5 ? `blur(${blurValue}px)` : 'none'
      });
      
      if (imgRef.current) {
        gsap.set(imgRef.current, {
          filter: `url(#melt-${item.id}) drop-shadow(0 20px 30px rgba(44, 26, 20, ${shadowOpacity}))`
        });
      }
    };

    const scheduleUpdate = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(update);
      }
    };

    scheduleUpdate();

    if (parent) {
      parent.addEventListener('scroll', scheduleUpdate, { passive: true });
    }
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (parent) {
        parent.removeEventListener('scroll', scheduleUpdate);
      }
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [item.id]);

  return (
    <div className="shrink-0 w-[75vw] md:w-[280px] h-auto snap-center relative py-4">
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <filter id={`melt-${item.id}`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" result="warp" />
          <feDisplacementMap 
            ref={dispMapRef}
            in="SourceGraphic" 
            in2="warp" 
            scale="45"
            xChannelSelector="R" 
            yChannelSelector="G" 
          />
        </filter>
      </svg>

      <div 
        ref={cardRef} 
        className="bg-transparent flex flex-col h-full transform-gpu will-change-transform items-center relative"
      >
        {isLiveEditMode && onLiveEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLiveEdit(item);
            }}
            className="absolute top-2 left-2 z-30 p-2 bg-white/95 text-[#C81D31] rounded-full shadow-xl border border-[#FAF4EC] flex items-center justify-center hover:scale-110 hover:bg-[#C81D31] hover:text-white transition-all cursor-pointer"
            title="Editar este plato"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        <div className={`relative w-full flex items-center justify-center p-1 overflow-hidden ${
          item.imageSize === "extra" 
            ? "h-[260px] sm:h-[300px]" 
            : item.imageSize === "large" 
            ? "h-[220px] sm:h-[250px]" 
            : "h-[180px] sm:h-[200px]"
        }`}>
          {item.popular && (
            <div className="absolute top-0 right-2 md:right-4 z-10 bg-gradient-to-r from-[#D49B4B] to-[#F0B865] text-[#2C1A14] text-[10px] font-serif font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 tracking-wider uppercase border border-[#FAF4EC]">
              ⭐ Más Vendido
            </div>
          )}
          <img 
            ref={imgRef}
            src={optimizeCloudinaryUrl(item.image, 600)} 
            alt="" 
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.dataset.fallback) {
                target.dataset.fallback = "true";
                target.src = "/images/new_waffle-bgless.png";
              }
            }}
            className={`w-full h-full transition-transform duration-300 ${
              item.imageFit === "cover" ? "object-cover rounded-xl" : "object-contain"
            }`}
            style={{ 
              filter: `url(#melt-${item.id})`,
              transform: item.imageScale ? `scale(${item.imageScale})` : undefined
            }}
          />
        </div>
        <div className="p-1 pt-2 flex flex-col flex-grow text-center w-full items-center">
          <h3 className="text-xl sm:text-2xl font-serif text-[#2C1A14] font-bold leading-tight tracking-tight mb-1 text-balance">
            {item.name}
          </h3>
          {item.description && item.description.trim() && (
            <p className="text-xs text-[#2C1A14]/70 mb-1 leading-snug line-clamp-2 max-w-[240px] font-sans font-medium text-pretty">
              {item.description}
            </p>
          )}
          <div className="text-xl sm:text-2xl font-serif text-[#D49B4B] font-extrabold my-1 tabular-nums">
            {item.price}
          </div>
          <button 
            onClick={() => onAddToCart(item)}
            className="mt-1.5 inline-block w-full max-w-[170px] py-2.5 bg-[#C81D31] text-white rounded-full font-serif font-bold text-xs sm:text-sm hover:bg-[#E02B43] transition-all shadow-md shadow-[#C81D31]/20 hover:scale-105 cursor-pointer border border-[#C81D31]"
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
});

export default function LandingPage() {
  const { cartCount, toggleCart, addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState("Todo");
  const [searchQuery, setSearchQuery] = useState("");
  const [shuffledMenu, setShuffledMenu] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const promoRef = useRef<HTMLDivElement>(null);

  // Live Visual Editor State
  const [isLiveEditMode, setIsLiveEditMode] = useState(false);
  const [activeEditItem, setActiveEditItem] = useState<any | null>(null);
  const [activeEditType, setActiveEditType] = useState<"banner" | "product" | "hero">("product");

  // Public storefront logo & hero state
  const [logoUrl, setLogoUrl] = useState<string>("/images/logo-transparent.png");
  const [heroImageUrl, setHeroImageUrl] = useState<string>("/images/new_waffle-bgless.png");
  const [heroImageScale, setHeroImageScale] = useState<number>(1.0);
  const [heroImageFit, setHeroImageFit] = useState<string>("contain");
  const [heroTitle, setHeroTitle] = useState<string>("Una Dulce Tentación");
  const [heroSubtitle, setHeroSubtitle] = useState<string>("Hecha Arte");
  const [heroDescription, setHeroDescription] = useState<string>("Descubre el placer incomparable de nuestros waffles crujientes recién horneados, crepes esponjosos y gelato artesanal elaborados con ingredientes 100% naturales.");

  const handleRealtimeUpdate = (updatedItem: any) => {
    if (activeEditType === "hero") {
      if (updatedItem.heroImageUrl) setHeroImageUrl(updatedItem.heroImageUrl);
      if (updatedItem.heroTitle) setHeroTitle(updatedItem.heroTitle);
      if (updatedItem.heroSubtitle) setHeroSubtitle(updatedItem.heroSubtitle);
      if (updatedItem.heroDescription) setHeroDescription(updatedItem.heroDescription);
      if (updatedItem.heroImageScale !== undefined) setHeroImageScale(updatedItem.heroImageScale);
      if (updatedItem.heroImageFit !== undefined) setHeroImageFit(updatedItem.heroImageFit);
    } else if (activeEditType === "banner") {
      setBanners((prev) =>
        prev.map((b) => (b.id === updatedItem.id ? updatedItem : b))
      );
    } else {
      setShuffledMenu((prev) =>
        prev.map((p) => (p.id === updatedItem.id ? updatedItem : p))
      );
    }
  };

  const handleLiveSaveSuccess = () => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          if (json.data.heroImageUrl) setHeroImageUrl(json.data.heroImageUrl);
          if (json.data.heroTitle) setHeroTitle(json.data.heroTitle);
          if (json.data.heroSubtitle) setHeroSubtitle(json.data.heroSubtitle);
          if (json.data.heroDescription) setHeroDescription(json.data.heroDescription);
          if (json.data.heroImageScale !== undefined) setHeroImageScale(json.data.heroImageScale);
          if (json.data.heroImageFit !== undefined) setHeroImageFit(json.data.heroImageFit);
        }
      });
    fetch("/api/banners?active=true")
      .then((res) => res.json())
      .then((json) => json.success && setBanners(json.data));
    fetch("/api/menu")
      .then((res) => res.json())
      .then((json) => json.success && setShuffledMenu(json.data));
  };

  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");

  useEffect(() => {
    // Public storefront website is always Light Mode
    document.documentElement.classList.remove("dark");

    // Parallel data fetching (Vercel Best Practice: eliminating waterfalls)
    Promise.all([
      fetch("/api/settings").then((res) => res.json()).catch(() => null),
      fetch("/api/banners?active=true").then((res) => res.json()).catch(() => null),
      fetch("/api/menu").then((res) => res.json()).catch(() => null),
    ]).then(([settingsJson, bannersJson, menuJson]) => {
      if (settingsJson && settingsJson.success && settingsJson.data) {
        if (settingsJson.data.logoUrl) setLogoUrl(settingsJson.data.logoUrl);
        if (settingsJson.data.heroImageUrl) setHeroImageUrl(settingsJson.data.heroImageUrl);
        if (settingsJson.data.heroTitle) setHeroTitle(settingsJson.data.heroTitle);
        if (settingsJson.data.heroSubtitle) setHeroSubtitle(settingsJson.data.heroSubtitle);
        if (settingsJson.data.heroDescription) setHeroDescription(settingsJson.data.heroDescription);
        if (settingsJson.data.heroImageScale !== undefined) setHeroImageScale(settingsJson.data.heroImageScale);
        if (settingsJson.data.heroImageFit !== undefined) setHeroImageFit(settingsJson.data.heroImageFit);
      }

      if (bannersJson && bannersJson.success && Array.isArray(bannersJson.data)) {
        setBanners(bannersJson.data);
      }

      if (menuJson && menuJson.success && Array.isArray(menuJson.data)) {
        setShuffledMenu(menuJson.data);
      }
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Check query params for live editor shortcut
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("edit") === "true") {
        setIsLiveEditMode(true);
      }
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Collect all image URLs for GourmetPreloader
  const allImageUrls = useMemo(() => {
    return [
      logoUrl,
      heroImageUrl,
      ...banners.map((b) => b.image),
      ...shuffledMenu.map((m) => m.image),
    ].filter(Boolean) as string[];
  }, [logoUrl, heroImageUrl, banners, shuffledMenu]);

  const galleryRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!galleryRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - galleryRef.current.offsetLeft);
    setScrollLeftState(galleryRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !galleryRef.current) return;
    e.preventDefault();
    const x = e.pageX - galleryRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    galleryRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleGalleryScroll = () => {
    if (!galleryRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = galleryRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(scrollLeft / maxScroll);
    }
  };

  const scrollGallery = (direction: "left" | "right") => {
    if (!galleryRef.current) return;
    const scrollAmount = direction === "left" ? -400 : 400;
    galleryRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollPromoBanners = (direction: "left" | "right") => {
    if (!promoRef.current) return;
    const scrollAmount = direction === "left" ? -450 : 450;
    promoRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
  };

  const handleAddToCartClick = (item: any) => {
    addToCart({
      id: String(item.id),
      name: item.name,
      price: parseFloat(String(item.price).replace("$", "")),
      image: item.image,
      category: item.category
    });
  };

  const filteredMenu = shuffledMenu.filter(item => {
    const matchesCategory = activeCategory === "Todo" || item.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const WHATSAPP_NUMBER = "593963519916";

  return (
    <main className="min-h-screen bg-[#FAF4EC] text-[#2C1A14] selection:bg-[#C81D31] selection:text-white font-sans antialiased overflow-x-hidden relative">
      
      {/* Gourmet Preloader Screen while images are downloading */}
      {isLoading && (
        <GourmetPreloader
          logoUrl="/images/logo.webp"
          imageUrls={allImageUrls}
          onComplete={() => setIsLoading(false)}
        />
      )}
      
      {/* Dynamic Melt Filter for Hero Title */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <filter id="melt-hero" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="1" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="12" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Cart Drawer */}
      <CartSidebar whatsappNumber={WHATSAPP_NUMBER} />

      {/* NAVBAR */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-[#FAF4EC]/90 backdrop-blur-md shadow-md py-3 border-b border-[#E5D5C0]" 
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={logoUrl || "/images/logo.webp"}
              alt=""
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = "true";
                  target.src = "/images/logo.webp";
                }
              }}
              className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-serif font-bold text-[#2C1A14]">
            <li>
              <a href="#" className="hover:text-[#C81D31] transition-colors">Inicio</a>
            </li>
            <li>
              <a href="#menu" className="hover:text-[#C81D31] transition-colors">Nuestras Tentaciones</a>
            </li>
            <li>
              <a href="#ubicacion" className="hover:text-[#C81D31] transition-colors">Sucursal</a>
            </li>
          </ul>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleCart}
              className="relative p-3 rounded-full bg-[#F4EBDC] text-[#2C1A14] border border-[#D49B4B]/40 hover:bg-[#C81D31] hover:text-white transition-all shadow-xs cursor-pointer group"
              aria-label="Ver Carrito"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C81D31] text-white text-[11px] font-black flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Panel Access Button (Persona con Traje) */}
            <a
              href="/admin"
              className="p-3 rounded-full bg-[#F4EBDC] text-[#2C1A14] border border-[#D49B4B]/40 hover:bg-[#2C1A14] hover:text-white transition-all shadow-xs cursor-pointer group flex items-center justify-center relative z-50"
              title="Panel de Administración"
              aria-label="Panel Administrador"
            >
              <User className="w-5 h-5" />
            </a>

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2.5 rounded-full bg-[#F4EBDC] text-[#2C1A14] border border-[#D49B4B]/40"
              aria-label="Abrir Menú"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`h-0.5 w-full bg-[#2C1A14] transition-all ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`h-0.5 w-full bg-[#2C1A14] transition-all ${isOpen ? 'opacity-0' : ''}`} />
                <span className={`h-0.5 w-full bg-[#2C1A14] transition-all ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        {isOpen && (
          <div className="md:hidden bg-[#FAF4EC] border-b border-[#E5D5C0] px-6 py-6 space-y-4 shadow-xl">
            <a 
              href="#" 
              onClick={() => setIsOpen(false)}
              className="block font-serif font-bold text-lg text-[#2C1A14] hover:text-[#C81D31]"
            >
              Inicio
            </a>
            <a 
              href="#menu" 
              onClick={() => setIsOpen(false)}
              className="block font-serif font-bold text-lg text-[#2C1A14] hover:text-[#C81D31]"
            >
              Nuestras Tentaciones
            </a>
            <a 
              href="#ubicacion" 
              onClick={() => setIsOpen(false)}
              className="block font-serif font-bold text-lg text-[#2C1A14] hover:text-[#C81D31]"
            >
              Sucursal
            </a>
            <a 
              href="/admin" 
              onClick={() => setIsOpen(false)}
              className="block font-serif font-bold text-lg text-[#C81D31] hover:underline flex items-center gap-2 pt-2 border-t border-[#D49B4B]/20"
            >
              <User className="w-5 h-5" />
              <span>Panel Administrador</span>
            </a>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-28 pb-16 sm:pb-20 lg:pt-36 lg:pb-24 bg-[#FAF4EC] z-40 overflow-hidden">
        
        {/* Background Video (Store Interior) */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-10 pointer-events-none">
          <video 
            src="/images/como_llegar.mp4"
            autoPlay 
            muted 
            loop
            playsInline
            preload="none"
            className="w-full h-full object-cover blur-[20px] opacity-25 scale-105"
          />
          {/* Warm Tint Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF4EC]/80 via-[#FAF4EC]/95 to-[#FAF4EC]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="lg:col-span-7 space-y-7 text-center lg:text-left"
          >
            {/* Gourmet Artisan Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4EBDC] border border-[#E5D5C0]">
              <span className="w-2 h-2 rounded-full bg-[#D49B4B]" />
              <span className="text-xs font-sans font-medium uppercase tracking-wider text-[#2C1A14]">
                Repostería & Gelato Artesanal · Santo Domingo
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#2C1A14] leading-[1.12] tracking-tight text-balance">
              {heroTitle} <br/>
              <span className="text-[#D49B4B]">{heroSubtitle}</span>
            </h1>

            <p className="text-base sm:text-lg text-[#2C1A14]/80 font-sans max-w-xl mx-auto lg:mx-0 leading-relaxed text-pretty">
              {heroDescription}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <a 
                href="#menu"
                className="px-8 py-3.5 bg-[#2C1A14] text-[#FAF4EC] font-sans font-medium text-sm rounded-full shadow-sm hover:bg-[#3D2817] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Explorar Menú</span>
                <ChevronRight className="w-4 h-4" />
              </a>
              <a
                href="#ubicacion"
                className="px-6 py-3.5 bg-[#F4EBDC] text-[#2C1A14] font-sans font-medium text-sm rounded-full border border-[#E5D5C0] hover:bg-[#E5D5C0] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#D49B4B]" />
                <span>Nuestra Sucursal</span>
              </a>
            </div>

            {/* Gourmet Value Pillars */}
            <div className="pt-6 grid grid-cols-3 gap-3 border-t border-[#E5D5C0]">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[#2C1A14]">
                  <IceCream2 className="w-3.5 h-3.5 text-[#D49B4B]" />
                  <span>100% Artesanal</span>
                </div>
                <span className="text-[11px] text-[#2C1A14]/70 font-sans">Recetas Propias</span>
              </div>
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[#2C1A14]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D49B4B]" />
                  <span>Fruta Fresca</span>
                </div>
                <span className="text-[11px] text-[#2C1A14]/70 font-sans">Calidad Seleccionada</span>
              </div>
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[#2C1A14]">
                  <Heart className="w-3.5 h-3.5 text-[#D49B4B]" />
                  <span>Hecho con Amor</span>
                </div>
                <span className="text-[11px] text-[#2C1A14]/70 font-sans">Sabor Incomparable</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Featured Image Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 relative flex justify-center"
          >
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-[#F4EBDC] p-6 shadow-sm border border-[#E5D5C0] group">

              {/* Live Edit Button for Hero Showcase */}
              {isLiveEditMode && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveEditItem({
                      id: "hero",
                      heroImageUrl,
                      heroImageScale,
                      heroImageFit,
                      heroTitle,
                      heroSubtitle,
                      heroDescription,
                    });
                    setActiveEditType("hero");
                  }}
                  className="absolute top-4 left-4 z-30 p-2.5 bg-white/95 text-[#2C1A14] rounded-full shadow-md border border-[#E5D5C0] flex items-center justify-center hover:bg-[#2C1A14] hover:text-white transition-all cursor-pointer"
                  title="Editar Portada Hero en Vivo"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={optimizeCloudinaryUrl(heroImageUrl || "/images/new_waffle-bgless.png", 800)}
                alt=""
                fetchPriority="high"
                decoding="async"
                className={`w-full h-full relative z-10 drop-shadow-md transition-all duration-300 ${
                  heroImageFit === "cover" ? "object-cover rounded-2xl" : "object-contain"
                }`}
                style={{
                  transform: `scale(${heroImageScale || 1.0})`,
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = "true";
                    target.src = "/images/new_waffle-bgless.png";
                  }
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROMOTIONAL BANNERS CAROUSEL (KFC STYLE) */}
      {banners && banners.length > 0 && (
        <section className="bg-[#FAF4EC] relative z-25 pb-14 overflow-hidden">
          {/* Clean Border Separator */}
          <div className="border-t border-[#E5D5C0]" />

          <div className="max-w-7xl mx-auto px-6 relative z-20 pt-2 sm:pt-4">
            <div className="flex items-end justify-between mb-4">
              <div>
                <span className="text-xs font-serif font-extrabold uppercase tracking-[0.2em] text-[#C81D31] block mb-1">
                  Promociones & Destacados
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C1A14] tracking-tight">
                  Ofertas Especiales
                </h2>
              </div>
            </div>

            {/* Horizontal Banner Cards Carousel (Fixed / Static when 1 banner) */}
            <div
              ref={promoRef}
              className={`flex gap-5 pt-2 pb-3 items-stretch ${
                banners.length <= 1 
                  ? "justify-center overflow-hidden" 
                  : "overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
              }`}
            >
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="shrink-0 w-[90vw] sm:w-[500px] snap-center relative rounded-tr-[36px] rounded-bl-[36px] rounded-tl-2xl rounded-br-2xl overflow-visible shadow-lg shadow-black/25 text-white p-6 sm:p-7 pt-7 sm:pt-8 flex flex-col justify-between group transition-all duration-300 min-h-[240px] sm:min-h-[260px]"
                >
                  {/* Clipped Card Background Layer (Prevents ANY Blur Bleeding Outside Card!) */}
                  <div className="absolute inset-0 rounded-tr-[36px] rounded-bl-[36px] rounded-tl-2xl rounded-br-2xl overflow-hidden bg-gradient-to-br from-[#6A121B] via-[#4F0D13] to-[#2E0509] border border-[#D49B4B]/35 z-0 pointer-events-none">
                    {banner.layoutMode !== "full_poster" && (
                      <>
                        <div className="absolute -left-16 -top-16 w-60 h-60 bg-[#D49B4B]/10 rounded-full blur-2xl" />
                        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-[#C81D31]/15 rounded-full blur-xl" />
                      </>
                    )}
                  </div>

                  {/* Washi Tape Strip Detail (Esquina Pegada) */}
                  <div className="absolute -top-3 right-10 z-30 w-20 h-6 bg-[#D49B4B]/75 backdrop-blur-xs shadow-xs transform rotate-3 border-x border-[#D49B4B]/40 opacity-90 pointer-events-none" />

                  {/* Full Poster Background Image */}
                  {banner.layoutMode === "full_poster" && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={optimizeCloudinaryUrl(banner.image, 800)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover z-0 rounded-tr-[36px] rounded-bl-[36px] rounded-tl-2xl rounded-br-2xl group-hover:scale-105 transition-transform duration-500"
                        style={{
                          transform: banner.imageScale ? `scale(${banner.imageScale})` : undefined
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-1 pointer-events-none rounded-tr-[36px] rounded-bl-[36px] rounded-tl-2xl rounded-br-2xl" />
                    </>
                  )}

                  {/* Live Edit Button for Banner */}
                  {isLiveEditMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveEditItem(banner);
                        setActiveEditType("banner");
                      }}
                      className="absolute top-3 left-3 z-30 p-2.5 bg-white/95 text-[#C81D31] rounded-full shadow-xl border border-[#FAF4EC] flex items-center justify-center hover:scale-110 hover:bg-[#C81D31] hover:text-white transition-all cursor-pointer"
                      title="Editar este Banner"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}

                  {/* Badge & Price Stamped Seal Header */}
                  <div className="relative z-10 flex items-start justify-between gap-2 pt-1">
                    {/* Slanted Chic Ticket Tag Badge */}
                    <div className="relative inline-flex items-center pt-0.5">
                      <div className="px-3.5 py-1.5 -skew-x-6 bg-[#C81D31] text-white rounded-sm border-2 border-dashed border-[#FAF4EC]/50 shadow-md">
                        <span className="skew-x-6 inline-block font-serif text-[10px] sm:text-[11px] font-extrabold tracking-[0.25em] uppercase text-white">
                          {banner.badge ? banner.badge.replace(/[✦⭐✨]/g, '').trim() : 'OFERTA ESPECIAL'}
                        </span>
                      </div>
                    </div>

                    {/* Stamped Circular Wax Seal Price Badge */}
                    {banner.price && (
                      <div className="relative z-20 shrink-0 w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-gradient-to-br from-[#D49B4B] via-[#F0B865] to-[#D49B4B] text-[#2C1A14] font-serif font-black flex flex-col items-center justify-center shadow-2xl border-2 border-dashed border-[#FAF4EC]/90 transform rotate-3 hover:rotate-0 transition-transform cursor-default mt-0.5 mr-1">
                        <span className="text-[7.5px] uppercase tracking-widest font-sans font-bold text-[#2C1A14] leading-none mb-0.5">PRECIO</span>
                        <span className="text-xs sm:text-sm font-black leading-none">${banner.price}</span>
                      </div>
                    )}
                  </div>

                  {/* Content Grid (Split Mode vs Overlay in Full Poster) */}
                  <div className="relative z-10 grid grid-cols-12 gap-4 items-end mt-2">
                    <div className={banner.layoutMode === "full_poster" ? "col-span-12 space-y-2 pt-8" : "col-span-7 space-y-2"}>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight drop-shadow-md">
                        {banner.title}
                      </h3>
                      {banner.subtitle && (
                        <p className="text-xs sm:text-sm text-white/90 line-clamp-2 leading-relaxed font-sans drop-shadow-xs">
                          {banner.subtitle}
                        </p>
                      )}
                      <div className="pt-2">
                        {/* Clothing Tag Cut Button */}
                        <a
                          href={banner.link || "#menu"}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#D49B4B] to-[#F0B865] text-[#2C1A14] font-serif font-black text-xs rounded-sm border-2 border-dashed border-[#2C1A14]/30 shadow-lg transform -rotate-1 hover:rotate-0 hover:scale-105 transition-all"
                        >
                          <span>Ver Oferta</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {banner.layoutMode !== "full_poster" && (
                      <div className={`col-span-5 relative flex items-center justify-center overflow-visible ${
                        banner.imageSize === "full" 
                          ? "h-48 sm:h-56" 
                          : banner.imageSize === "large" 
                          ? "h-40 sm:h-48" 
                          : "h-36 sm:h-42"
                      }`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={optimizeCloudinaryUrl(banner.image, 600)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className={`w-full h-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.65)] group-hover:scale-110 transition-all duration-500 relative z-20 ${
                            banner.imageFit === "cover" ? "object-cover rounded-2xl" : "object-contain"
                          }`}
                          style={{
                            transform: banner.imageScale ? `scale(${banner.imageScale})` : undefined,
                            mixBlendMode: banner.blendMode === "none" ? undefined : "multiply"
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.dataset.fallback) {
                              target.dataset.fallback = "true";
                              target.src = "/images/new_waffle-bgless.png";
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Clean Border Separator */}
      <div className="border-t border-[#E5D5C0]" />

      {/* MENU / GALLERY */}
      <section className="pt-12 pb-16 bg-[#FAF4EC] relative z-30 overflow-hidden">
        <div id="menu" className="max-w-7xl mx-auto px-6 mb-12 text-center scroll-mt-28 relative z-10">
          <motion.div 
            className="space-y-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#D49B4B] block">
              NUESTRO MENÚ ARTESANAL
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-[#2C1A14] font-bold tracking-tight">
              Tú solo mira estos postres
            </h2>
            <p className="text-[#2C1A14]/80 text-base font-sans">
              Elige tu categoría favorita y déjate tentar
            </p>
          </motion.div>

          <div className="w-full text-center mt-8">
            <motion.div 
              className="inline-flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-3 pb-4 px-2 max-w-full"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
            {MENU_CATEGORIES.map((category) => (
              <motion.button
                key={category}
                variants={fadeUp}
                onClick={() => handleCategoryClick(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-sans font-medium transition-colors flex-shrink-0 snap-center cursor-pointer ${
                  activeCategory === category 
                    ? 'bg-[#2C1A14] text-[#FAF4EC] shadow-xs'
                    : 'bg-[#F4EBDC] text-[#2C1A14] border border-[#E5D5C0] hover:bg-[#E5D5C0]'
                }`}
              >
                {category}
              </motion.button>
            ))}
            </motion.div>
          </div>

          {/* Search Bar & View Toggle */}
          <motion.div 
            className="mt-8 max-w-xl mx-auto relative flex flex-col md:flex-row gap-4 items-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="relative flex-1 w-full flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-[#2C1A14]/50" />
              <input 
                type="text" 
                placeholder="Busca tu postre favorito..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#F4EBDC] border border-[#E5D5C0] rounded-full text-[#2C1A14] placeholder:text-[#2C1A14]/50 focus:outline-none focus:ring-1 focus:ring-[#2C1A14] transition-all shadow-xs font-sans text-sm"
              />
            </div>
            
            <div className="flex bg-[#F4EBDC] rounded-full p-1 border border-[#E5D5C0]">
              <button
                onClick={() => setViewMode("gallery")}
                className={`p-2.5 rounded-full transition-colors flex items-center gap-2 cursor-pointer ${viewMode === "gallery" ? "bg-[#2C1A14] text-[#FAF4EC] shadow-xs" : "text-[#2C1A14]/60 hover:text-[#2C1A14]"}`}
                title="Vista interactiva"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-full transition-colors flex items-center gap-2 cursor-pointer ${viewMode === "list" ? "bg-[#2C1A14] text-[#FAF4EC] shadow-xs" : "text-[#2C1A14]/60 hover:text-[#2C1A14]"}`}
                title="Vista de catálogo"
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>

        <div className="w-full relative z-10">
          {viewMode === 'gallery' && (
            <>
              {/* Custom Scroll Progress Indicator */}
              <motion.div 
                className="max-w-xs mx-auto mt-4 flex items-center justify-center gap-4"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="text-[10px] font-serif font-extrabold text-[#2C1A14]/50 uppercase tracking-[0.2em]">Desliza</div>
                <div className="flex-1 bg-[#2C1A14]/10 rounded-full h-1.5 relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full w-1/4 bg-[#C81D31] rounded-full transition-transform duration-75 ease-out shadow-xs" 
                    style={{ transform: `translateX(${scrollProgress * 300}%)` }} 
                  />
                </div>
              </motion.div>

              {/* Horizontal/Vertical Drag Gallery Container */}
              <div className="relative group w-full max-w-full mt-4">
                {/* Left Arrow */}
                <button 
                  onClick={() => scrollGallery('left')}
                  className="hidden md:block absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 bg-[#F4EBDC] rounded-full shadow-xl border border-[#D49B4B]/40 text-[#2C1A14] hover:bg-[#C81D31] hover:text-white transition-all md:opacity-0 md:group-hover:opacity-100 hover:scale-110 cursor-pointer"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </button>

                {/* Right Arrow */}
                <button 
                  onClick={() => scrollGallery('right')}
                  className="hidden md:block absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 bg-[#F4EBDC] rounded-full shadow-xl border border-[#D49B4B]/40 text-[#2C1A14] hover:bg-[#C81D31] hover:text-white transition-all md:opacity-0 md:group-hover:opacity-100 hover:scale-110 cursor-pointer"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                </button>

                <div 
                  ref={galleryRef}
                  onScroll={handleGalleryScroll}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  className="w-full flex md:flex-row flex-col gap-6 md:gap-12 overflow-x-auto md:overflow-y-hidden overflow-y-auto pl-[7.5vw] md:pl-[calc(50vw-200px)] pr-[7.5vw] md:pr-0 pb-4 pt-4 snap-y md:snap-x snap-mandatory hide-scrollbar items-center md:items-stretch will-change-scroll"
                >
                  {filteredMenu.map((item) => (
                    <MeltingCard 
                      key={`${activeCategory}-${item.id}`} 
                      item={item} 
                      onAddToCart={handleAddToCartClick}
                      isLiveEditMode={isLiveEditMode}
                      onLiveEdit={(itemToEdit) => {
                        setActiveEditItem(itemToEdit);
                        setActiveEditType("product");
                      }}
                    />
                  ))}
                  <div className="w-[1px] h-[1px] flex-shrink-0 md:w-[calc(50vw-200px)]" aria-hidden="true" />
                </div>
              </div>
            </>
          )}

          {viewMode === 'list' && (
            <div className="max-w-5xl mx-auto mt-8 px-6 text-left space-y-12 pb-12 relative z-10">
              {MENU_CATEGORIES.filter(cat => cat !== "Todo").map(category => {
                const itemsInCategory = filteredMenu.filter(item => item.category === category);
                if (itemsInCategory.length === 0) return null;
                
                return (
                  <motion.div 
                    key={category} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-end border-b-2 border-[#D49B4B]/30 pb-2 px-2">
                      <h3 className="text-2xl font-serif font-extrabold text-[#2C1A14]">{category}</h3>
                      <span className="text-xs font-serif font-bold text-[#D49B4B]">{itemsInCategory.length} productos</span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 px-2">
                      {itemsInCategory.map(item => (
                        <div key={item.id} className="bg-[#F4EBDC] rounded-[24px] p-4 flex items-center gap-4 shadow-sm border border-[#E5D5C0] hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                          {item.popular && (
                            <div className="absolute top-0 left-0 bg-[#D49B4B] text-[#2C1A14] px-3 py-1 rounded-br-xl text-[10px] font-serif font-black shadow-xs z-10 flex items-center gap-1 uppercase tracking-wider">
                              ⭐ Pop
                            </div>
                          )}
                          <div className="w-24 h-24 md:w-28 md:h-28 bg-[#FAF4EC] rounded-[20px] flex-shrink-0 relative flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-500 border border-[#E5D5C0]">
                            <img 
                              src={optimizeCloudinaryUrl(item.image, 400)} 
                              alt="" 
                              loading="lazy" 
                              decoding="async" 
                              className="w-full h-full object-contain drop-shadow-md"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.dataset.fallback) {
                                  target.dataset.fallback = "true";
                                  target.src = "/images/new_waffle-bgless.png";
                                }
                              }}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0 py-1 flex flex-col h-full justify-center">
                            <h4 className="font-serif font-extrabold text-[#2C1A14] text-[15px] md:text-base leading-tight pr-4">{item.name}</h4>
                            <p className="text-[13px] text-[#2C1A14]/75 line-clamp-2 mt-1 pr-2 leading-relaxed font-sans">{item.description}</p>
                            <div className="mt-2 text-[#D49B4B] font-serif font-black text-lg">{item.price}</div>
                          </div>
                          
                          <button 
                            onClick={() => handleAddToCartClick(item)}
                            className="w-12 h-12 md:w-13 md:h-13 rounded-full bg-[#C81D31] text-white flex items-center justify-center flex-shrink-0 shadow-md hover:bg-[#E02B43] hover:scale-110 transition-all mr-1 cursor-pointer border border-[#C81D31]"
                            aria-label="Agregar"
                          >
                            <span className="text-2xl leading-none font-light mb-1">+</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        {/* Clean Border Separator */}
        <div className="border-t border-[#E5D5C0]" />
      </section>

      {/* LOCATION / UBICACION */}
      <section id="ubicacion" className="pt-16 pb-16 bg-[#FAF4EC] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <div>
              <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#D49B4B] block mb-1">
                VISÍTANOS EN SANTO DOMINGO
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-[#2C1A14] font-bold">
                Nuestra Sucursal
              </h2>
            </div>

            <div className="flex items-center gap-2 font-sans font-medium text-sm bg-[#F4EBDC] text-[#2C1A14] px-6 py-3 rounded-full border border-[#E5D5C0] shadow-xs">
              <MapPin className="w-4 h-4 text-[#D49B4B]" />
              Frente al Parque Helen Tenka, Santo Domingo
            </div>
            
            <div className="w-full max-w-5xl bg-[#FAF4EC] rounded-3xl p-4 md:p-6 shadow-sm border border-[#E5D5C0] flex flex-col md:flex-row gap-6">
              
              {/* MAPA */}
              <div className="w-full md:w-3/5 aspect-square md:aspect-auto md:h-[420px] rounded-2xl overflow-hidden relative bg-[#FAF4EC] border border-[#E5D5C0]">
                <iframe 
                  src="https://maps.google.com/maps?q=-0.244889,-79.163583&t=&z=17&ie=UTF8&iwloc=&output=embed" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  className="w-full h-full opacity-95"
                />
              </div>

              {/* VIDEO COMO LLEGAR */}
              <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto md:h-[420px] rounded-2xl overflow-hidden relative bg-[#2C1A14] border border-[#E5D5C0] flex items-center justify-center">
                <video 
                  src="/images/como_llegar.mp4" 
                  controls 
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* STRAIGHT BORDER FOOTER TRANSITION */}
      <div className="border-t border-[#E5D5C0]" />

      {/* FOOTER */}
      <footer className="bg-[#2C1A14] text-[#FAF4EC] pb-10 pt-4 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* LOGO */}
            <div className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={logoUrl || "/images/logo.webp"}
                alt=""
                className="h-10 md:h-12 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = "true";
                    target.src = "/images/logo.webp";
                  }
                }}
              />
            </div>

            {/* ÍNDICE DE NAVEGACIÓN EN FOOTER */}
            <ul className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm font-serif font-bold">
              <li>
                <a href="#" className="hover:text-[#C81D31] transition-colors">Inicio</a>
              </li>
              <li>
                <a href="#menu" className="hover:text-[#C81D31] transition-colors">Nuestras Tentaciones</a>
              </li>
              <li>
                <a href="#ubicacion" className="hover:text-[#C81D31] transition-colors">Ubicación</a>
              </li>
            </ul>

            {/* REDES SOCIALES */}
            <div className="flex gap-4 flex-shrink-0">
              <a href="https://www.facebook.com/share/1XQsEULYRm/" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#3D251E] text-[#FAF4EC] rounded-full hover:bg-[#C81D31] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/avita_ice_cream/" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#3D251E] text-[#FAF4EC] rounded-full hover:bg-[#C81D31] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
              </a>
              <a href="https://www.tiktok.com/@heladeriaavita" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#3D251E] text-[#FAF4EC] rounded-full hover:bg-[#C81D31] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
              </a>
            </div>
            
          </div>

          <div className="w-full h-px bg-[#D49B4B]/20 my-6" />

          <p className="text-xs text-[#FAF4EC]/60 font-sans text-center md:text-left font-medium">
            &copy; {new Date().getFullYear()} Waffles y Crepes — Dulce Tentación (Santo Domingo, Ecuador). Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp Button for Customer Storefront */}
      <a 
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quisiera%20hacer%20un%20pedido`}
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg shadow-green-900/20 hover:scale-110 hover:shadow-xl transition-all duration-300 group cursor-pointer"
        aria-label="Contactar por WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 group-hover:animate-pulse">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.225 5.225 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </a>

      {/* Toggle Live Visual Editor Floating Button */}
      <button
        type="button"
        onClick={() => setIsLiveEditMode(!isLiveEditMode)}
        className={`fixed bottom-6 left-6 z-[90] p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group cursor-pointer border ${
          isLiveEditMode 
            ? "bg-[#C81D31] text-white border-white ring-4 ring-[#C81D31]/30 scale-110" 
            : "bg-[#2C1A14] text-[#FAF4EC] border-[#D49B4B]/40 hover:scale-105"
        }`}
        title={isLiveEditMode ? "Desactivar Edición Visual" : "Activar Edición Visual en Vivo"}
      >
        <Pencil className="w-6 h-6 transition-transform group-hover:rotate-12" />
        {isLiveEditMode && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#D49B4B] border-2 border-[#2C1A14]"></span>
          </span>
        )}
      </button>

      {/* Live Editor Drawer */}
      <LiveEditorDrawer
        isOpen={Boolean(activeEditItem)}
        onClose={() => setActiveEditItem(null)}
        type={activeEditType}
        item={activeEditItem}
        onChangeRealtime={handleRealtimeUpdate}
        onSaveSuccess={handleLiveSaveSuccess}
      />
    </main>
  );
}
