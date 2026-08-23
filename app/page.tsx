"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useSpring } from "framer-motion";
import Image from "next/image";
import { 
  IceCream2, 
  MapPin, 
  Heart,
  Leaf,
  Cherry,
  Milk,
  Cookie,
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingCart,
  LayoutGrid,
  List as ListIcon,
  Star,
  Sparkles
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DripDivider } from "@/components/ui/DripDivider";
import { useCart } from "@/components/CartContext";
import { CartSidebar } from "@/components/ui/CartSidebar";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

// --- Mock Data ---
const MENU_CATEGORIES = ["Todo", "Helados Artesanales", "Waffles", "Frappés", "Crepes"];

// We use local images interchangeably to guarantee they load and show the melt effect properly
const MENU_ITEMS = [
  // 10 Helados Artesanales
  { id: 1, name: "Helado de Frutos Rojos", category: "Helados Artesanales", description: "Cremoso helado con trozos de fresas y frambuesas naturales.", price: "$3.50", image: "/images/saborfresa-bgless.png", popular: true },
  { id: 2, name: "Cono Doble Choco-Vainilla", category: "Helados Artesanales", description: "Clásico cono con chocolate belga y vainilla.", price: "$4.00", image: "/images/chocolate-bgless.png" },
  { id: 3, name: "Copa Sundae Suprema", category: "Helados Artesanales", description: "Tres bolas de helado, crema chantilly, cereza y full sirope.", price: "$4.50", image: "/images/vainilla-bgless.png" },
  { id: 4, name: "Helado de Pistacho", category: "Helados Artesanales", description: "Pistachos reales italianos molidos en base de crema dulce.", price: "$3.75", image: "/images/vainilla-bgless.png" },
  { id: 5, name: "Cono Simple de Mora", category: "Helados Artesanales", description: "El clásico favorito, ácido y dulce a la vez.", price: "$2.50", image: "/images/saborfresa-bgless.png" },
  { id: 6, name: "Copa Banana Split", category: "Helados Artesanales", description: "Banana entera, tres sabores de helado, chispas y crema.", price: "$5.50", image: "/images/chocolate-bgless.png", popular: true },
  { id: 7, name: "Helado Ron Pasas", category: "Helados Artesanales", description: "Pasas maceradas en ron añejo con base de vainilla cremosa.", price: "$3.50", image: "/images/vainilla-bgless.png" },
  { id: 8, name: "Cono Waffle Gigante", category: "Helados Artesanales", description: "Cono de masa de waffle crujiente con dos bolas inmensas.", price: "$4.25", image: "/images/waffle-bgless.png" },
  { id: 9, name: "Helado Menta Granizada", category: "Helados Artesanales", description: "Menta fresca con crujientes chispas de chocolate amargo.", price: "$3.50", image: "/images/new_icecream-bgless.png" },
  { id: 10, name: "Tarrina Familiar", category: "Helados Artesanales", description: "Un litro entero de tu sabor favorito para llevar a casa.", price: "$9.00", image: "/images/vainilla-bgless.png" },
  
  // 3 Waffles
  { id: 11, name: "Waffle Sencillo", category: "Waffles", description: "Waffle recién horneado con una bola de helado a elección.", price: "$3.50", image: "/images/waffle-bgless.png", hasOptions: true },
  { id: 12, name: "Waffle Especial", category: "Waffles", description: "Waffle con fruta, helado y sirope.", price: "$4.50", image: "/images/new_waffle-bgless.png", popular: true, hasOptions: true },
  { id: 13, name: "Waffle Supremo", category: "Waffles", description: "Doble porción de helado, doble fruta y extra crema.", price: "$6.00", image: "/images/waffle-bgless.png", hasOptions: true },

  // 5 Frappés
  { id: 14, name: "Frappé de Moka", category: "Frappés", description: "Café moka helado con crema batida y chispas.", price: "$4.50", image: "/images/frappe-bgless.png", popular: true },
  { id: 15, name: "Frappé de Fresa", category: "Frappés", description: "Batido refrescante de fresas naturales con crema.", price: "$4.00", image: "/images/frappe-bgless.png" },
  { id: 16, name: "Frappé de Caramelo", category: "Frappés", description: "Dulce caramelo fundido con café y crema.", price: "$4.75", image: "/images/new_frappe-bgless.png", popular: true },
  { id: 17, name: "Frappé de Oreo", category: "Frappés", description: "Galletas Oreo trituradas con leche y vainilla.", price: "$4.50", image: "/images/frappe-bgless.png" },
  { id: 18, name: "Frappé de Vainilla", category: "Frappés", description: "Clásico batido cremoso de vainilla.", price: "$3.75", image: "/images/frappe-bgless.png" },

  // 7 Crepes
  { id: 19, name: "Crepe Nutella Clásico", category: "Crepes", description: "Crepe francés con abundante Nutella.", price: "$3.50", image: "/images/crepe-bgless.png" },
  { id: 20, name: "Crepe Frutos del Bosque", category: "Crepes", description: "Crepe relleno de fresas y chocolate, acompañado de helado.", price: "$4.50", image: "/images/new_crepe-bgless.png", popular: true, hasOptions: true },
  { id: 21, name: "Crepe Tropical", category: "Crepes", description: "Crepe con banano, piña, lechera y coco rallado.", price: "$4.25", image: "/images/crepe-bgless.png", hasOptions: true },
  { id: 22, name: "Crepe Dulce de Leche", category: "Crepes", description: "Abundante manjar (arequipe) con helado a elección.", price: "$4.00", image: "/images/crepe-bgless.png", hasOptions: true },
  { id: 23, name: "Crepe Salado Jamón Queso", category: "Crepes", description: "Crepe salado con jamón ahumado y queso derretido.", price: "$5.00", image: "/images/crepe-bgless.png" },
  { id: 24, name: "Crepe Salado Pollo", category: "Crepes", description: "Pollo con champiñones en salsa blanca.", price: "$5.50", image: "/images/crepe-bgless.png" },
  { id: 25, name: "Crepe Mix Supreme", category: "Crepes", description: "Mitad Nutella, mitad Manjar, con 2 frutas y helado.", price: "$6.50", image: "/images/new_crepe-bgless.png", popular: true, hasOptions: true },
];

const FEATURES = [
  { icon: IceCream2, title: "100% Artesanal", desc: "Elaborados diariamente con recetas propias." },
  { icon: Leaf, title: "Ingredientes Frescos", desc: "Frutas naturales y lácteos de primera calidad." },
  { icon: Heart, title: "Hechos con Amor", desc: "El sabor que te hará volver por más." },
];

// --- Components ---
function CustomizationModal({ item, onClose, onConfirm }: { item: any, onClose: () => void, onConfirm: (options: Record<string, string>) => void }) {
  const [fruta, setFruta] = useState("Fresa");
  const [helado, setHelado] = useState("Vainilla");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-surface-border z-10"
      >
        <h3 className="text-2xl font-serif font-bold text-accent mb-2">Personaliza tu pedido</h3>
        <p className="text-foreground/70 mb-6 font-medium">{item.name}</p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-foreground mb-3">Elige tu Fruta</label>
            <div className="grid grid-cols-3 gap-2">
              {['Fresa', 'Banano', 'Mixto'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setFruta(opt)}
                  className={`py-2 rounded-xl text-sm font-bold transition-all ${fruta === opt ? 'bg-accent text-white shadow-md' : 'bg-surface text-foreground/70 hover:bg-surface-border'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-foreground mb-3">Sabor de Helado</label>
            <div className="grid grid-cols-2 gap-2">
              {['Vainilla', 'Chocolate', 'Fresa', 'Ron Pasas'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setHelado(opt)}
                  className={`py-2 rounded-xl text-sm font-bold transition-all ${helado === opt ? 'bg-accent text-white shadow-md' : 'bg-surface text-foreground/70 hover:bg-surface-border'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-full font-bold text-foreground/60 bg-surface hover:bg-surface-border transition-colors">
            Cancelar
          </button>
          <button 
            onClick={() => onConfirm({ "Fruta": fruta, "Helado": helado })}
            className="flex-1 py-3 rounded-full font-bold text-white bg-accent hover:bg-accent-hover shadow-lg shadow-accent/30 transition-all hover:-translate-y-1"
          >
            Agregar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

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
function MeltingCard({ item, WHATSAPP_NUMBER, onAddToCart }: { item: any, WHATSAPP_NUMBER: string, onAddToCart: (item: any) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dispMapRef = useRef<SVGFEDisplacementMapElement>(null);
  
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    
    // Continuous loop to check distance to center
    const animate = () => {
      if (cardRef.current && dispMapRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        
        // Center of the card on the X axis
        const cardCenter = rect.left + rect.width / 2;
        // Center of the viewport on the X axis
        const windowCenter = window.innerWidth / 2;
        
        // Absolute distance from the center
        const dist = Math.abs(cardCenter - windowCenter);
        // Normalize distance (0 when perfectly centered, 1 when completely off edge)
        // We use window.innerWidth / 1.5 as a reasonable falloff threshold
        const normalizedDist = Math.min(dist / (window.innerWidth / 1.5), 1);
        
        // Map normalized distance to filter scale (0 to 45 max distortion)
        const meltValue = Math.pow(normalizedDist, 2) * 45; 
        
        // Scale: Center is 1.1, edges are 0.85
        const scaleValue = 1.1 - (normalizedDist * 0.25);
        
        // Blur: Center is 0px, edges up to 8px
        const blurValue = normalizedDist * 8;
        
        // Opacity: Center is 1, edges is 0.4
        const opacityValue = 1 - (normalizedDist * 0.6);

        // Shadow fades in when centered
        const shadowOpacity = Math.max(0, 0.2 - (normalizedDist * 0.2));

        // Use gsap.set for instant updates on every frame without lagging
        gsap.set(dispMapRef.current, { attr: { scale: meltValue } });
        gsap.set(cardRef.current, { 
          scale: scaleValue, 
          opacity: opacityValue,
          filter: `blur(${blurValue}px)`
        });
        
        if (imgRef.current) {
          gsap.set(imgRef.current, {
            filter: `url(#melt-${item.id}) drop-shadow(0 20px 30px rgba(122, 22, 32, ${shadowOpacity}))`
          });
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
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
            scale="45" // Starts highly melted before JS kicks in
            xChannelSelector="R" 
            yChannelSelector="G" 
          />
        </filter>
      </svg>

      <div 
        ref={cardRef} 
        className="bg-transparent flex flex-col h-full transform-gpu will-change-transform items-center"
      >
        <div className="relative w-full h-[220px] flex items-center justify-center p-2">
          {item.popular && (
            <div className="absolute top-0 right-4 md:right-8 z-10 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 tracking-wider uppercase border border-yellow-200">
              ⭐ Más Vendido
            </div>
          )}
          <img 
            ref={imgRef}
            src={item.image} 
            alt={item.name} 
            loading="lazy"
            className="w-full h-full object-contain"
            style={{ filter: `url(#melt-${item.id})` }}
          />
        </div>
        <div className="p-3 flex flex-col flex-grow text-center w-full">
          <h3 className="text-xl font-serif text-foreground mb-2 font-bold">{item.name}</h3>
          <p className="text-xs text-foreground/60 mb-4 flex-grow leading-relaxed line-clamp-3">
            {item.description}
          </p>
          <div className="text-2xl font-serif text-foreground font-bold mb-4">
            {item.price}
          </div>
          <button 
            onClick={() => onAddToCart(item)}
            className="inline-block w-full max-w-[160px] mx-auto py-3 bg-accent text-white rounded-full font-bold text-sm hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20 hover:-translate-y-1"
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { cartCount, toggleCart, addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState("Todo");
  const [searchQuery, setSearchQuery] = useState("");
  const [shuffledMenu, setShuffledMenu] = useState(MENU_ITEMS);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");
  const [selectedItemForOptions, setSelectedItemForOptions] = useState<any>(null);
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const handleHeroVideoTimeUpdate = useCallback(() => {
    if (heroVideoRef.current && heroVideoRef.current.currentTime >= 30) {
      heroVideoRef.current.currentTime = 24;
    }
  }, []);
  
  // Reset scroll on filter change
  useEffect(() => {
    if (galleryRef.current) {
      galleryRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    setScrollProgress(0);
  }, [activeCategory, searchQuery]);
  
  // Custom progress bar logic
  const handleGalleryScroll = useCallback(() => {
    if (galleryRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = galleryRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      setScrollProgress(progress);
    }
  }, []);

  useGSAP(() => {
    // Hero slow viscosity loop
    gsap.to("#hero-turbulence", {
      attr: { baseFrequency: "0.01 0.03" },
      repeat: -1,
      yoyo: true,
      duration: 8,
      ease: "sine.inOut"
    });
  });

  useEffect(() => {
    // Initial random shuffle on client
    setShuffledMenu([...MENU_ITEMS].sort(() => Math.random() - 0.5));

    // Force scroll to top on reload
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    if (galleryRef.current) {
      galleryRef.current.scrollLeft = 0;
      setScrollProgress(0);
    }

    // Initial check for navbar
    setIsScrolled(window.scrollY > 20);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Check Open Status (2 PM to 10 PM)
    const checkOpenStatus = () => {
      const hour = new Date().getHours();
      setIsOpen(hour >= 14 && hour < 22);
    };
    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, []);

  // React state for Dragging
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!galleryRef.current) return;
    isDown.current = true;
    galleryRef.current.style.cursor = 'grabbing';
    galleryRef.current.style.scrollSnapType = 'none'; // Disable snap while dragging
    startX.current = e.pageX - galleryRef.current.offsetLeft;
    scrollLeft.current = galleryRef.current.scrollLeft;
  };
  const handleMouseLeave = () => {
    isDown.current = false;
    if (galleryRef.current) {
      galleryRef.current.style.cursor = '';
      galleryRef.current.style.scrollSnapType = ''; 
    }
  };
  const handleMouseUp = () => {
    isDown.current = false;
    if (galleryRef.current) {
      galleryRef.current.style.cursor = '';
      galleryRef.current.style.scrollSnapType = ''; 
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !galleryRef.current) return;
    e.preventDefault();
    const x = e.pageX - galleryRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // scroll-fast multiplier
    galleryRef.current.scrollLeft = scrollLeft.current - walk;
    handleGalleryScroll();
  };

  const scrollGallery = (direction: 'left' | 'right') => {
    if (galleryRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 400 : window.innerWidth * 0.8;
      galleryRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    if (category === "Todo") {
      setShuffledMenu([...MENU_ITEMS].sort(() => Math.random() - 0.5));
    }
  };

  const filteredMenu = shuffledMenu.filter(item => {
    const matchesCategory = activeCategory === "Todo" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const WHATSAPP_NUMBER = "593997338788";
  const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quisiera%20más%20información%20sobre%20sus%20helados`;

  const handleAddToCartClick = (item: any) => {
    if (item.hasOptions) {
      setSelectedItemForOptions(item);
    } else {
      addToCart(item);
    }
  };

  return (
    <main className="min-h-screen selection:bg-accent selection:text-white">
      {selectedItemForOptions && (
        <CustomizationModal 
          item={selectedItemForOptions}
          onClose={() => setSelectedItemForOptions(null)}
          onConfirm={(options) => {
            addToCart(selectedItemForOptions, options);
            setSelectedItemForOptions(null);
          }}
        />
      )}
      <CartSidebar whatsappNumber={WHATSAPP_NUMBER} />
      
      {/* NAVBAR */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative">
          <a href="#" className="flex items-center z-10">
            <Image 
              src="/images/logo-transparent.png" 
              unoptimized
              alt="Avita Logo" 
              width={180} 
              height={50}
              priority
              className="h-14 w-auto object-contain"
            />
          </a>

          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-10">
            <a href="#nosotros" className="group flex items-center gap-2 text-sm text-foreground font-semibold hover:text-accent transition-colors">
              <Heart className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
              Nosotros
            </a>
            <a href="#menu" className="group flex items-center gap-2 text-sm text-foreground font-semibold hover:text-accent transition-colors">
              <IceCream2 className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
              Menú
            </a>
            <a href="#ubicacion" className="group flex items-center gap-2 text-sm text-foreground font-semibold hover:text-accent transition-colors">
              <MapPin className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
              Ubicación
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/80 border border-surface-border text-xs font-bold mr-2 text-foreground/80 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </span>
                {isOpen ? 'Abierto Ahora' : 'Cerrado'}
              </div>
              <a href="https://www.facebook.com/share/1XQsEULYRm/" target="_blank" rel="noopener noreferrer" className="p-2 bg-surface rounded-full text-foreground hover:text-white hover:bg-accent transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/avita_ice_cream/" target="_blank" rel="noopener noreferrer" className="p-2 bg-surface rounded-full text-foreground hover:text-white hover:bg-accent transition-colors">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="https://www.tiktok.com/@heladeriaavita" target="_blank" rel="noopener noreferrer" className="p-2 bg-surface rounded-full text-foreground hover:text-white hover:bg-accent transition-colors">
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>
            <button 
              onClick={toggleCart}
              className="relative p-3 bg-accent text-white rounded-full hover:bg-accent-hover transition-colors shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/40 hover:-translate-y-0.5 duration-300"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-foreground text-surface text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-32 lg:pt-48 lg:pb-48 bg-background z-40 overflow-hidden">
        
        {/* Background Video (Store Interior) */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-10 pointer-events-none">
          <video 
            ref={heroVideoRef}
            src="/images/como_llegar.mp4#t=24"
            autoPlay 
            muted 
            playsInline 
            onTimeUpdate={handleHeroVideoTimeUpdate}
            className="w-full h-full object-cover blur-[30px] opacity-40 scale-110"
          />
          {/* Tint overlay */}
          <div className="absolute inset-0 bg-background/60" />
        </div>

        {/* Animated Background Blobs (Melt System Aura) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div 
            animate={{ 
              x: [0, 60, 0], 
              y: [0, 40, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-accent/15 blur-[120px] mix-blend-multiply"
          />
          <motion.div 
            animate={{ 
              x: [0, -50, 0], 
              y: [0, 60, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[20%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-secondary/15 blur-[130px] mix-blend-multiply"
          />
          <motion.div 
            animate={{ 
              x: [0, 40, 0], 
              y: [0, -40, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
            className="absolute -bottom-[20%] left-[20%] w-[70vw] h-[70vw] rounded-full bg-[#8FAE7A]/15 blur-[140px] mix-blend-multiply"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-8 text-center lg:text-left"
          >
            <h1 
              className="text-5xl lg:text-7xl font-serif text-accent leading-[1.1] tracking-tight transform-gpu will-change-transform"
              style={{ filter: "url(#melt-hero)" }}
            >
              EL SABOR QUE <br/>
              <span className="text-foreground">TE HARÁ VOLVER</span>
            </h1>
            <p className="text-lg text-foreground/80 font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
              Disfruta de nuestros deliciosos frappés, waffles y helados artesanales elaborados con los mejores ingredientes naturales.
            </p>
            <div className="pt-4">
              <a 
                href="#menu"
                className="inline-flex px-10 py-4 bg-accent text-white rounded-full font-bold text-lg hover:bg-accent-hover transition-all shadow-lg shadow-accent/30 hover:shadow-xl hover:-translate-y-1"
              >
                Ver Menú
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Sombra base */}
              <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[55%] h-[8%] bg-black/25 rounded-[100%] blur-xl z-0 pointer-events-none" />
              <Image 
                src="/images/helado_transparente.png" 
                unoptimized
                alt="Helado en Vaso" 
                fill
                priority
                className="object-contain drop-shadow-[0_20px_30px_rgba(122,22,32,0.3)] relative z-10"
              />
            </div>
          </motion.div>
        </div>
        
        <DripDivider color="var(--surface)" position="bottom-inside" />
      </section>


      {/* MENU / MELTING GALLERY */}
      <section className="pt-8 pb-12 bg-surface relative z-30 overflow-hidden">
        
        {/* REALISTIC BACKGROUND ACCENTS (MENU) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <img src="/images/strawberry_float.png" alt="" className="absolute top-[5%] right-[2%] w-32 h-32 md:w-48 md:h-48 object-contain rotate-12 blur-[2px] opacity-50" />
          <img src="/images/chocolate_float.png" alt="" className="absolute top-[25%] left-[2%] w-24 h-24 md:w-36 md:h-36 object-contain -rotate-12 blur-[1px] opacity-60" />
        </div>

        <div id="menu" className="max-w-7xl mx-auto px-6 mb-16 text-center scroll-mt-28 relative z-10">
          <motion.div 
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-4xl md:text-5xl font-serif text-accent tracking-tight">
              TÚ SOLO MIRA ESTOS POSTRES
            </h2>
            <p className="text-foreground/70 text-lg">
              Elige tu categoría favorita
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-wrap justify-center gap-3 mt-10"
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
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeCategory === category 
                    ? 'bg-foreground text-surface shadow-md scale-105'
                    : 'bg-surface-border/50 text-foreground/80 hover:bg-surface-border hover:text-foreground'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          {/* Search Bar & View Toggle */}
          <motion.div 
            className="mt-8 max-w-xl mx-auto relative flex flex-col md:flex-row gap-4 items-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="relative flex-1 w-full flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-foreground/50" />
              <input 
                type="text" 
                placeholder="Busca tu postre favorito..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-surface-border rounded-full text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all shadow-sm"
              />
            </div>
            
            <div className="flex bg-surface-border/30 rounded-full p-1 border border-surface-border">
              <button
                onClick={() => setViewMode("gallery")}
                className={`p-2.5 rounded-full transition-colors flex items-center gap-2 ${viewMode === "gallery" ? "bg-white text-accent shadow-sm" : "text-foreground/50 hover:text-foreground"}`}
                title="Vista interactiva"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-full transition-colors flex items-center gap-2 ${viewMode === "list" ? "bg-white text-accent shadow-sm" : "text-foreground/50 hover:text-foreground"}`}
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
                className="max-w-xs mx-auto mt-8 flex items-center justify-center gap-4"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">Desliza</div>
                <div className="flex-1 bg-foreground/5 rounded-full h-1.5 relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full w-1/4 bg-accent rounded-full transition-transform duration-75 ease-out shadow-sm shadow-accent/50" 
                    style={{ transform: `translateX(${scrollProgress * 300}%)` }} 
                  />
                </div>
              </motion.div>

              {/* Horizontal/Vertical Drag Gallery Container */}
              <div className="relative group w-full max-w-full mt-4">
                {/* Left Arrow */}
                <button 
                  onClick={() => scrollGallery('left')}
                  className="hidden md:block absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 bg-background/90 backdrop-blur-md rounded-full shadow-xl border border-surface-border text-foreground hover:bg-accent hover:text-white transition-all md:opacity-0 md:group-hover:opacity-100 hover:scale-110"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </button>

                {/* Right Arrow */}
                <button 
                  onClick={() => scrollGallery('right')}
                  className="hidden md:block absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 bg-background/90 backdrop-blur-md rounded-full shadow-xl border border-surface-border text-foreground hover:bg-accent hover:text-white transition-all md:opacity-0 md:group-hover:opacity-100 hover:scale-110"
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
                    <MeltingCard key={`${activeCategory}-${item.id}`} item={item} WHATSAPP_NUMBER={WHATSAPP_NUMBER} onAddToCart={handleAddToCartClick} />
                  ))}
                  {/* Spacer to enforce trailing padding in flex scrollbars */}
                  <div className="w-[1px] h-[1px] flex-shrink-0 md:w-[calc(50vw-200px)]" aria-hidden="true" />
                </div>
              </div>
            </>
          )}

          {viewMode === 'list' && (
            <div className="max-w-5xl mx-auto mt-12 px-6 text-left space-y-16 pb-12 relative z-10">
              {MENU_CATEGORIES.filter(cat => cat !== "Todo").map(category => {
                const itemsInCategory = filteredMenu.filter(item => item.category === category);
                if (itemsInCategory.length === 0) return null;
                
                return (
                  <motion.div 
                    key={category} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-end border-b-2 border-surface-border/60 pb-3 px-2">
                      <h3 className="text-2xl font-serif font-bold text-foreground">{category}</h3>
                      <span className="text-sm font-medium text-foreground/50">{itemsInCategory.length} productos</span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6 px-2">
                      {itemsInCategory.map(item => (
                        <div key={item.id} className="bg-white rounded-[24px] p-3 md:p-4 flex items-center gap-4 shadow-sm border border-surface-border hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                          {item.popular && (
                            <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-br-xl text-[10px] font-bold shadow-sm z-10 flex items-center gap-1 uppercase tracking-wider">
                              ⭐ Pop
                            </div>
                          )}
                          <div className="w-24 h-24 md:w-28 md:h-28 bg-surface rounded-[20px] flex-shrink-0 relative flex items-center justify-center p-3 group-hover:scale-105 transition-transform duration-500">
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                          </div>
                          
                          <div className="flex-1 min-w-0 py-1 flex flex-col h-full justify-center">
                            <h4 className="font-bold text-foreground text-[15px] md:text-base leading-tight pr-4">{item.name}</h4>
                            <p className="text-[13px] text-foreground/60 line-clamp-2 mt-1.5 pr-2 leading-relaxed">{item.description}</p>
                            <div className="mt-3 text-accent font-bold text-lg">{item.price}</div>
                          </div>
                          
                          <button 
                            onClick={() => handleAddToCartClick(item)}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 shadow-md hover:bg-accent-hover hover:scale-110 transition-all mr-1 md:mr-2"
                            aria-label="Agregar"
                          >
                            <span className="text-2xl md:text-3xl leading-none font-light mb-1">+</span>
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

        <DripDivider color="var(--surface)" position="bottom" />
      </section>

      {/* TESTIMONIALS */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-surface relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-foreground font-bold mb-4">Lo que dicen nuestros clientes</h2>
            <p className="text-foreground/60 max-w-2xl mx-auto font-medium">Cientos de familias ya disfrutan de la calidad de Avita. ¡Únete a ellos!</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "María F.", text: "Los mejores waffles que he probado, la masa es súper crujiente y la atención de primera.", stars: 5 },
              { name: "Carlos J.", text: "El helado de pistacho es increíble, se nota que usan ingredientes reales y no saborizantes.", stars: 5 },
              { name: "Ana P.", text: "Pedimos siempre por WhatsApp y llega perfecto. El empaque mantiene el helado intacto.", stars: 5 }
            ].map((testimonio, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background p-8 rounded-3xl border border-surface-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full" />
                <div className="flex text-yellow-400 mb-4 text-xl">
                  {[...Array(testimonio.stars)].map((_, j) => (
                    <span key={j}>★</span>
                  ))}
                </div>
                <p className="text-foreground/80 italic mb-6 leading-relaxed">"{testimonio.text}"</p>
                <div className="font-bold text-foreground flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    {testimonio.name.charAt(0)}
                  </div>
                  {testimonio.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <DripDivider color="var(--surface)" position="bottom" />
      </section>

      {/* LOCATION / UBICACION */}
      <section id="ubicacion" className="py-12 md:py-16 bg-background relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground font-bold mb-2">Encuéntranos</h2>
            <div className="flex items-center gap-2 font-medium bg-surface px-8 py-4 rounded-full border border-surface-border w-full max-w-lg justify-center shadow-sm">
              <MapPin className="w-5 h-5 text-accent" />
              Frente al Parque Helen Tenka
            </div>
            
            <div className="w-full max-w-5xl bg-white rounded-[2.5rem] p-4 md:p-6 shadow-2xl shadow-accent/5 border border-surface-border flex flex-col md:flex-row gap-4 md:gap-6">
              
              {/* MAPA */}
              <div className="w-full md:w-3/5 h-[350px] md:h-[500px] rounded-[1.5rem] overflow-hidden relative group bg-surface">
                <div className="absolute inset-0 bg-background/5 backdrop-blur-[1px] group-hover:opacity-0 transition-opacity duration-500 pointer-events-none z-10 flex items-center justify-center">
                  <span className="bg-foreground text-white text-sm font-bold px-5 py-2.5 rounded-full flex items-center gap-2 shadow-xl">
                    <MapPin className="w-4 h-4" /> Ver en Mapa
                  </span>
                </div>
                <iframe 
                  src="https://maps.google.com/maps?q=-0.244889,-79.163583&t=&z=17&ie=UTF8&iwloc=&output=embed" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  className="w-full h-full opacity-90 group-hover:opacity-100 transition-all duration-500 grayscale group-hover:grayscale-0"
                />
              </div>

              {/* VIDEO COMO LLEGAR */}
              <div className="w-full md:w-2/5 h-[400px] md:h-[500px] rounded-[1.5rem] overflow-hidden relative bg-black flex items-center justify-center group">
                <video 
                  src="/images/como_llegar.mp4" 
                  controls 
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 pointer-events-none flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Ruta al local
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-foreground text-background py-4 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* LOGO */}
            <div className="flex-shrink-0">
              <Image 
                src="/images/logo-transparent.png" 
                unoptimized
                alt="Avita Logo" 
                width={160} 
                height={60}
                className="h-10 md:h-12 w-auto object-contain"
              />
            </div>

            {/* ÍNDICE DE NAVEGACIÓN EN FOOTER */}
            <ul className="flex flex-col md:flex-row items-center gap-3 md:gap-8 text-sm font-bold">
              <li>
                <a href="#" className="flex items-center gap-1 hover:text-accent transition-colors group">
                  <span className="text-accent opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">→</span> 
                  Inicio
                </a>
              </li>
              <li>
                <a href="#menu" className="flex items-center gap-1 hover:text-accent transition-colors group">
                  <span className="text-accent opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">→</span> 
                  Menú
                </a>
              </li>
              <li>
                <a href="#ubicacion" className="flex items-center gap-1 hover:text-accent transition-colors group">
                  <span className="text-accent opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">→</span> 
                  Ubicación
                </a>
              </li>
            </ul>

            {/* REDES SOCIALES */}
            <div className="flex gap-4 flex-shrink-0">
              <a href="https://www.facebook.com/share/1XQsEULYRm/" target="_blank" rel="noopener noreferrer" className="p-2 bg-background/10 backdrop-blur-sm border border-white/10 rounded-full hover:bg-accent transition-colors">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/avita_ice_cream/" target="_blank" rel="noopener noreferrer" className="p-2 bg-background/10 backdrop-blur-sm border border-white/10 rounded-full hover:bg-accent transition-colors">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@heladeriaavita" target="_blank" rel="noopener noreferrer" className="p-2 bg-background/10 backdrop-blur-sm border border-white/10 rounded-full hover:bg-accent transition-colors">
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
            
          </div>

          <div className="w-full h-px bg-white/10 my-4" />

            <p className="text-sm text-background/50 font-medium font-sans text-center md:text-left">
              &copy; {new Date().getFullYear()} Avita Ice Cream & Waffles. Todos los derechos reservados.
            </p>
          </div>
      </footer>


    </main>
  );
}

// Icons
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
