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
  ChevronRight
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DripDivider } from "@/components/ui/DripDivider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

// --- Mock Data ---
const MENU_CATEGORIES = ["Helados Artesanales", "Waffles", "Frappés", "Crepes"];

// We use local images interchangeably to guarantee they load and show the melt effect properly
const MENU_ITEMS = [
  { id: 1, name: "Helado de Frutos Rojos", category: "Helados Artesanales", description: "Cremoso helado artesanal con trozos de fresas y frambuesas naturales.", price: "$3.50", image: "/images/concepto-plato.png" },
  { id: 2, name: "Cono Doble Choco-Vainilla", category: "Helados Artesanales", description: "Clásico cono artesanal con chocolate belga y vainilla de Madagascar.", price: "$4.00", image: "/images/hero-bg.png" },
  { id: 3, name: "Copa Sundae Suprema", category: "Helados Artesanales", description: "Tres bolas de helado, crema chantilly, cereza y full sirope.", price: "$4.50", image: "/images/concepto-plato.png" },
  { id: 4, name: "Helado de Pistacho", category: "Helados Artesanales", description: "Pistachos reales italianos molidos en base de crema dulce.", price: "$3.75", image: "/images/hero-bg.png" },
  { id: 5, name: "Cono Simple de Mora", category: "Helados Artesanales", description: "El clásico favorito, ácido y dulce a la vez.", price: "$2.50", image: "/images/concepto-plato.png" },
  { id: 6, name: "Copa Banana Split", category: "Helados Artesanales", description: "Banana entera, tres sabores de helado, chispas y crema.", price: "$5.50", image: "/images/hero-bg.png" },
  { id: 7, name: "Helado Ron Pasas", category: "Helados Artesanales", description: "Pasas maceradas en ron añejo con base de vainilla cremosa.", price: "$3.50", image: "/images/concepto-plato.png" },
  { id: 8, name: "Cono Waffle Gigante", category: "Helados Artesanales", description: "Cono de masa de waffle crujiente con dos bolas inmensas.", price: "$4.25", image: "/images/hero-bg.png" },
  { id: 9, name: "Helado Menta Granizada", category: "Helados Artesanales", description: "Menta fresca con crujientes chispas de chocolate amargo.", price: "$3.50", image: "/images/concepto-plato.png" },
  { id: 10, name: "Tarrina Familiar", category: "Helados Artesanales", description: "Un litro entero de tu sabor favorito para llevar a casa.", price: "$9.00", image: "/images/hero-bg.png" },
  { id: 11, name: "Waffle Supremo", category: "Waffles", description: "Waffle recién horneado con helado, fresas frescas y sirope de chocolate.", price: "$5.50", image: "/images/concepto-plato.png" },
  { id: 12, name: "Waffle Clásico", category: "Waffles", description: "Waffle crujiente con miel de maple y mantequilla.", price: "$3.50", image: "/images/hero-bg.png" },
  { id: 13, name: "Frappé de Moka", category: "Frappés", description: "Café moka helado con crema batida y chispas de chocolate.", price: "$4.50", image: "/images/concepto-plato.png" },
  { id: 14, name: "Frappé de Fresa", category: "Frappés", description: "Batido refrescante de fresas naturales con crema.", price: "$4.00", image: "/images/hero-bg.png" },
  { id: 15, name: "Crepe Nutella Fresas", category: "Crepes", description: "Crepe francés con abundante Nutella y fresas frescas.", price: "$4.50", image: "/images/concepto-plato.png" },
  { id: 16, name: "Crepe Salado Jamón Queso", category: "Crepes", description: "Crepe salado con jamón ahumado y queso derretido.", price: "$5.00", image: "/images/hero-bg.png" },
];

const FEATURES = [
  { icon: IceCream2, title: "100% Artesanal", desc: "Elaborados diariamente con recetas propias." },
  { icon: Leaf, title: "Ingredientes Frescos", desc: "Frutas naturales y lácteos de primera calidad." },
  { icon: Heart, title: "Hechos con Amor", desc: "El sabor que te hará volver por más." },
];

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
function MeltingCard({ item, WHATSAPP_NUMBER }: { item: any, WHATSAPP_NUMBER: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
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
          filter: `blur(${blurValue}px)`,
          boxShadow: `0 30px 60px rgba(122, 22, 32, ${shadowOpacity})`
        });
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="shrink-0 w-[85vw] md:w-[400px] h-auto snap-center relative py-12">
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
        className="bg-surface rounded-3xl overflow-hidden flex flex-col h-full transform-gpu will-change-transform"
      >
        <div className="relative w-full h-[300px]">
          <img 
            src={item.image} 
            alt={item.name} 
            loading="lazy"
            className="w-full h-full object-cover bg-surface-border"
            style={{ filter: `url(#melt-${item.id})` }}
          />
        </div>
        <div className="p-8 flex flex-col flex-grow text-center">
          <h3 className="text-2xl font-serif text-foreground mb-3">{item.name}</h3>
          <p className="text-sm text-foreground/70 mb-6 flex-grow">
            {item.description}
          </p>
          <div className="text-3xl font-serif text-secondary mb-6">
            {item.price}
          </div>
          <a 
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quisiera%20pedir%20un%20${encodeURIComponent(item.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full py-4 bg-accent text-white rounded-full font-bold hover:bg-accent-hover transition-colors shadow-md shadow-accent/20"
          >
            Comprar
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState("Helados Artesanales");
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  
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
    // Force scroll to top on reload
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Initial check for navbar
    setIsScrolled(window.scrollY > 20);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  const filteredMenu = MENU_ITEMS.filter(item => item.category === activeCategory);

  const WHATSAPP_NUMBER = "593997338788";
  const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quisiera%20más%20información%20sobre%20sus%20helados`;

  return (
    <main className="min-h-screen selection:bg-accent selection:text-white">
      
      {/* NAVBAR */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="#" className="flex items-center">
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

          <div className="hidden md:flex items-center gap-8">
            <a href="#menu" className="text-sm text-foreground font-semibold hover:text-accent transition-colors">Menú</a>
            <a href="#ingredientes" className="text-sm text-foreground font-semibold hover:text-accent transition-colors">Ingredientes</a>
            <a href="#ubicacion" className="text-sm text-foreground font-semibold hover:text-accent transition-colors">Ubicación</a>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="p-2 bg-surface rounded-full text-foreground hover:text-white hover:bg-accent transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/avita_ice_cream/" target="_blank" rel="noopener noreferrer" className="p-2 bg-surface rounded-full text-foreground hover:text-white hover:bg-accent transition-colors">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="https://www.tiktok.com/@heladeriaavita" target="_blank" rel="noopener noreferrer" className="p-2 bg-surface rounded-full text-foreground hover:text-white hover:bg-accent transition-colors">
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>
            <a 
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-accent text-white rounded-full font-bold hover:bg-accent-hover transition-colors shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/40 hover:-translate-y-0.5 duration-300"
            >
              Pedir Ahora
            </a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-32 lg:pt-48 lg:pb-48 bg-background z-40">
        
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
              <Image 
                src="/images/hero-bg.png" 
                unoptimized
                alt="Helado Artesanal Avita" 
                fill
                priority
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
        
        <DripDivider color="var(--surface)" position="bottom-inside" />
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-surface relative z-30">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="grid md:grid-cols-3 gap-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={idx}
                  variants={fadeUp}
                  className="group flex flex-col items-center text-center space-y-4 p-6 rounded-3xl hover:bg-background transition-colors duration-500"
                >
                  <div className="w-20 h-20 rounded-full bg-background text-accent flex items-center justify-center mb-2 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:shadow-md">
                    <Icon className="w-10 h-10 transition-all duration-500" style={{ filter: "url(#melt-hover)" }} />
                  </div>
                  <h3 className="text-xl font-serif text-foreground">{feature.title}</h3>
                  <p className="text-foreground/70">{feature.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
        
        <DripDivider color="var(--surface)" position="bottom" />
      </section>

      {/* MENU / MELTING GALLERY */}
      <section id="menu" className="py-32 bg-background relative z-20">
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <motion.div 
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-4xl md:text-6xl font-serif text-accent tracking-tight">
              TÚ SOLO MIRA ESTOS POSTRES
            </h2>
            <p className="text-foreground/60 font-medium text-lg">Elige tu categoría favorita</p>
          </motion.div>

          {/* Categorías Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  if (galleryRef.current) galleryRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
                }}
                className={`px-8 py-3 rounded-full font-bold text-sm md:text-base transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'bg-foreground text-background shadow-md' 
                    : 'bg-surface-border text-foreground hover:bg-foreground/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Syrup Thread Progress Indicator */}
        <div className="max-w-xs mx-auto mb-8 h-1 bg-surface-border rounded-full overflow-hidden relative">
           <div 
             className="absolute top-0 left-0 bottom-0 bg-secondary rounded-full transition-transform duration-100 ease-out"
             style={{ width: '100%', transform: `scaleX(${scrollProgress})`, transformOrigin: '0%' }}
           />
        </div>

        {/* Horizontal/Vertical Drag Gallery Container */}
        <div className="relative group max-w-[100vw]">
          {/* Left Arrow */}
          <button 
            onClick={() => scrollGallery('left')}
            className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 bg-background/90 backdrop-blur-md rounded-full shadow-xl border border-surface-border text-foreground hover:bg-accent hover:text-white transition-all opacity-80 md:opacity-0 md:group-hover:opacity-100 hover:scale-110"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          {/* Right Arrow */}
          <button 
            onClick={() => scrollGallery('right')}
            className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 bg-background/90 backdrop-blur-md rounded-full shadow-xl border border-surface-border text-foreground hover:bg-accent hover:text-white transition-all opacity-80 md:opacity-0 md:group-hover:opacity-100 hover:scale-110"
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
            className="w-full flex md:flex-row flex-col gap-6 md:gap-12 overflow-x-auto md:overflow-y-hidden overflow-y-auto px-[7.5vw] md:px-[calc(50vw-200px)] pb-20 pt-10 snap-y md:snap-x snap-mandatory hide-scrollbar items-center md:items-stretch will-change-scroll"
          >
            {filteredMenu.map((item) => (
              <MeltingCard key={`${activeCategory}-${item.id}`} item={item} WHATSAPP_NUMBER={WHATSAPP_NUMBER} />
            ))}
          </div>
        </div>

        <DripDivider color="var(--background)" position="bottom" />
      </section>

      {/* INGREDIENTES / SECRETO */}
      <section id="ingredientes" className="py-40 relative bg-foreground z-10">
        
        {/* Background Image with Glassmorphism overlay */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
           <Image 
              src="/images/concepto-plato.png" 
              alt="Background" 
              fill
              className="object-cover object-center opacity-40 mix-blend-overlay"
            />
            {/* Heavy Glass blur */}
            <div className="absolute inset-0 backdrop-blur-xl bg-foreground/70" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center mb-24 space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-4xl md:text-6xl font-serif text-background tracking-tight">
              EL SECRETO DE NUESTRO SABOR
            </h2>
            <p className="text-background/80 font-medium text-xl max-w-2xl mx-auto">
              El respeto absoluto por el ingrediente real.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={fadeUp} className="bg-background/10 backdrop-blur-md border border-white/10 p-8 rounded-3xl text-center text-background">
               <Cherry className="w-12 h-12 mx-auto mb-6 text-accent" />
               <h3 className="text-xl font-bold mb-3">Fruta 100% Natural</h3>
               <p className="text-background/70 text-sm">Sin jarabes artificiales ni colorantes. Solo fruta real y fresca de temporada.</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-background/10 backdrop-blur-md border border-white/10 p-8 rounded-3xl text-center text-background">
               <Milk className="w-12 h-12 mx-auto mb-6 text-background" />
               <h3 className="text-xl font-bold mb-3">Lácteos Frescos</h3>
               <p className="text-background/70 text-sm">Leche y crema enteras pasteurizadas diariamente para lograr esa textura sedosa única.</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-background/10 backdrop-blur-md border border-white/10 p-8 rounded-3xl text-center text-background">
               <Cookie className="w-12 h-12 mx-auto mb-6 text-secondary" />
               <h3 className="text-xl font-bold mb-3">Chocolate Premium</h3>
               <p className="text-background/70 text-sm">Cacao de origen ecuatoriano de alta gama para fundir y crear nuestros rizos perfectos.</p>
            </motion.div>
          </motion.div>
          
          <div className="mt-24 text-center">
            <a 
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-10 py-4 bg-background text-foreground rounded-full font-bold text-lg hover:bg-surface transition-all shadow-xl hover:-translate-y-1"
            >
              Escríbenos
            </a>
          </div>
        </div>

        <DripDivider color="var(--foreground)" position="bottom-inside" />
      </section>

      {/* FOOTER */}
      <footer id="ubicacion" className="bg-foreground text-background pt-16 pb-12 relative z-0 overflow-hidden">
        {/* Drip Texture Background overlay */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ maskImage: 'linear-gradient(to bottom, transparent, black 150px)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 150px)' }}
        >
          {/* Repeating drip svg for texture */}
          <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwQzI1IDI1IDI1IDUwIDUwIDUwQzc1IDUwIDc1IDI1IDEwMCAwWiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] bg-[length:100px_100px] repeat" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <Image 
              src="/images/logo-transparent.png" 
              unoptimized
              alt="Avita Logo" 
              width={200} 
              height={80}
              className="h-12 md:h-16 w-auto object-contain"
            />
            
            <div className="flex items-center gap-2 font-medium bg-background/10 backdrop-blur-sm px-8 py-4 rounded-full border border-white/10">
              <MapPin className="w-5 h-5 text-accent" />
              Frente al Parque Helen Tenka
            </div>

            <div className="flex gap-6">
              <a href="https://www.instagram.com/avita_ice_cream/" target="_blank" rel="noopener noreferrer" className="p-4 bg-background/10 backdrop-blur-sm border border-white/10 rounded-full hover:bg-accent transition-colors">
                <InstagramIcon className="w-6 h-6" />
              </a>
              <a href="https://www.tiktok.com/@heladeriaavita" target="_blank" rel="noopener noreferrer" className="p-4 bg-background/10 backdrop-blur-sm border border-white/10 rounded-full hover:bg-accent transition-colors">
                <TikTokIcon className="w-6 h-6" />
              </a>
            </div>

            <div className="w-full h-px bg-white/10 max-w-2xl mx-auto my-6" />

            <p className="text-sm text-background/50 font-medium font-sans">
              &copy; {new Date().getFullYear()} Avita Ice Cream & Waffles. Todos los derechos reservados.
            </p>
          </div>
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
