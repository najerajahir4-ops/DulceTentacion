"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  IceCream2, 
  MapPin, 
  CupSoda, 
  Star, 
  Phone,
  Heart,
  Leaf,
  Cherry,
  Milk,
  Cookie
} from "lucide-react";
import Link from "next/link";

// --- Mock Data ---

const MENU_CATEGORIES = ["Helados Artesanales", "Waffles", "Frappés"];
const MENU_ITEMS = [
  { id: 1, name: "Helado de Frutos Rojos", category: "Helados Artesanales", description: "Cremoso helado artesanal con trozos de fresas y frambuesas naturales.", price: "$3.50", image: "https://images.unsplash.com/photo-1570197781417-0a52375c020b?auto=format&fit=crop&q=80&w=600" },
  { id: 2, name: "Cono Doble Choco-Vainilla", category: "Helados Artesanales", description: "Clásico cono artesanal con chocolate belga y vainilla de Madagascar.", price: "$4.00", image: "https://images.unsplash.com/photo-1558500664-5a21e42a9fb9?auto=format&fit=crop&q=80&w=600" },
  { id: 3, name: "Waffle Supremo", category: "Waffles", description: "Waffle recién horneado con helado, fresas frescas y sirope de chocolate.", price: "$5.50", image: "https://images.unsplash.com/photo-1562376552-0d160a2f9fa4?auto=format&fit=crop&q=80&w=600" },
  { id: 4, name: "Waffle Clásico", category: "Waffles", description: "Waffle crujiente con miel de maple y mantequilla.", price: "$3.50", image: "https://images.unsplash.com/photo-1598214886806-c87b84b7078b?auto=format&fit=crop&q=80&w=600" },
  { id: 5, name: "Frappé de Moka", category: "Frappés", description: "Café moka helado con crema batida y chispas de chocolate.", price: "$4.50", image: "https://images.unsplash.com/photo-1572490122747-3968b75bb811?auto=format&fit=crop&q=80&w=600" },
  { id: 6, name: "Frappé de Fresa", category: "Frappés", description: "Batido refrescante de fresas naturales con crema.", price: "$4.00", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600" },
];

const FEATURES = [
  { icon: IceCream2, title: "100% Artesanal", desc: "Elaborados diariamente con recetas propias." },
  { icon: Leaf, title: "Ingredientes Frescos", desc: "Frutas naturales y lácteos de primera calidad." },
  { icon: Heart, title: "Hechos con Amor", desc: "El sabor que te hará volver por más." },
];

// --- Animation Variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState("Helados Artesanales");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredMenu = MENU_ITEMS.filter(item => item.category === activeCategory);

  const WHATSAPP_NUMBER = "593997338788";
  const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quisiera%20más%20información%20sobre%20sus%20helados`;

  return (
    <main className="min-h-screen font-sans selection:bg-accent selection:text-white">
      
      {/* NAVBAR */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-6'}`}
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
              className="h-16 w-auto object-contain"
            />
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#menu" className="text-foreground font-semibold hover:text-accent transition-colors">Menú</a>
            <a href="#ingredientes" className="text-foreground font-semibold hover:text-accent transition-colors">Ingredientes</a>
            <a href="#ubicacion" className="text-foreground font-semibold hover:text-accent transition-colors">Ubicación</a>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="p-2 bg-surface-border rounded-full text-foreground hover:text-white hover:bg-accent transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/avita_ice_cream/" target="_blank" rel="noopener noreferrer" className="p-2 bg-surface-border rounded-full text-foreground hover:text-white hover:bg-accent transition-colors">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="https://www.tiktok.com/@heladeriaavita" target="_blank" rel="noopener noreferrer" className="p-2 bg-surface-border rounded-full text-foreground hover:text-white hover:bg-accent transition-colors">
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>
            <a 
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-accent text-white rounded-full font-bold hover:bg-accent-hover transition-colors shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/40 hover:-translate-y-0.5 duration-300"
            >
              Pedir Ahora
            </a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 bg-[var(--background-pink)] overflow-hidden">
        {/* Decorative Floating Elements (Mint leaves/Berries effect via CSS) */}
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute top-32 left-10 w-12 h-12 bg-green-400/30 rounded-tl-full rounded-br-full blur-[2px]"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-40 right-20 w-8 h-8 bg-red-400/40 rounded-full blur-[3px]"
        />
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 text-center lg:text-left"
          >
            <h1 className="text-5xl lg:text-7xl font-extrabold text-accent leading-tight tracking-tight">
              EL SABOR QUE <br/>
              <span className="text-foreground">TE HARÁ VOLVER</span>
            </h1>
            <p className="text-lg text-foreground/80 font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
              Disfruta de nuestros deliciosos frappés, waffles y helados artesanales elaborados con los mejores ingredientes naturales.
            </p>
            <div className="pt-4">
              <a 
                href="#menu"
                className="inline-flex px-8 py-4 bg-accent text-white rounded-full font-bold text-lg hover:bg-accent-hover transition-all shadow-lg shadow-accent/30 hover:shadow-xl hover:-translate-y-1"
              >
                Ver Menú
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            {/* The image should be transparent background */}
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

        {/* Drip SVG Divider */}
        <div className="drip-divider">
          <svg viewBox="0 0 1440 150" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,0 C120,80 240,140 360,110 C480,80 600,20 720,60 C840,100 960,150 1080,120 C1200,90 1320,30 1440,50 L1440,150 L0,150 Z" fill="white" />
            <path d="M0,0 C100,50 200,100 300,70 C400,40 500,-10 600,30 C700,70 800,120 900,90 C1000,60 1100,0 1200,20 C1300,40 1400,90 1440,70 L1440,150 L0,150 Z" fill="white" opacity="0.5" />
          </svg>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2, duration: 0.6 }}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[var(--background-pink)] text-accent flex items-center justify-center mb-2 shadow-sm">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-foreground/70">{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* MENU / PRODUCTS */}
      <section id="menu" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16 space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-accent uppercase tracking-tight">
              TÚ SOLO MIRA ESTOS POSTRES
            </h2>
            <p className="text-foreground/60 font-medium text-lg">Elige tu categoría favorita</p>
          </motion.div>

          {/* Categorías Tabs */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-16">
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm md:text-base transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'bg-accent text-white shadow-md shadow-accent/30' 
                    : 'bg-surface-border text-foreground/70 hover:bg-surface-border/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid de Productos */}
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            key={activeCategory}
          >
            {filteredMenu.map((item) => (
              <motion.div 
                key={item.id} 
                variants={fadeUp}
                className="bg-white rounded-3xl p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-surface-border hover:shadow-[0_8px_30px_rgb(229,46,99,0.1)] transition-all duration-300 group"
              >
                <div className="relative w-48 h-48 mx-auto mb-6 overflow-hidden rounded-full border-4 border-surface-border">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{item.name}</h3>
                <p className="text-sm text-foreground/60 mb-6 h-12">
                  {item.description}
                </p>
                <div className="text-3xl font-extrabold text-foreground mb-6">
                  {item.price}
                </div>
                <a 
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quisiera%20pedir%20un%20${encodeURIComponent(item.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full py-3.5 bg-accent text-white rounded-full font-bold hover:bg-accent-hover transition-colors shadow-md shadow-accent/20 hover:-translate-y-1 duration-300"
                >
                  Comprar
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* INGREDIENTES / SECRETO */}
      <section id="ingredientes" className="py-24 bg-[var(--background-pink)] relative overflow-hidden">
        
        {/* Soft Wave Top Divider (Using CSS or simple SVG) */}
        <div className="absolute top-0 left-0 w-full rotate-180">
           <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,0 C240,80 480,80 720,40 C960,0 1200,0 1440,40 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-12">
          <motion.div 
            className="text-center mb-16 space-y-4 relative z-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-accent uppercase tracking-tight">
              EL SECRETO DE NUESTRO SABOR
            </h2>
            <p className="text-foreground/70 font-medium text-lg max-w-2xl mx-auto">
              Utilizamos solo ingredientes naturales, frescos y de primera calidad para preparar nuestros postres.
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative z-10 w-full max-w-lg mx-auto"
            >
              {/* Using concepto-plato.png or hero as the center image */}
              <Image 
                src="/images/concepto-plato.png" 
                alt="Ingredientes Frescos" 
                width={600}
                height={600}
                className="w-full h-auto drop-shadow-2xl rounded-3xl"
              />
            </motion.div>
            
            {/* Decorative text bubbles positioned around the center image */}
            <div className="hidden md:block">
              <motion.div 
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="absolute top-1/4 -left-12 bg-white px-6 py-3 rounded-full shadow-lg font-bold text-accent flex items-center gap-2"
              >
                <Cherry className="w-5 h-5 text-red-500" /> Fruta 100% Natural
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                className="absolute top-1/3 -right-8 bg-white px-6 py-3 rounded-full shadow-lg font-bold text-accent flex items-center gap-2"
              >
                <Milk className="w-5 h-5 text-blue-500" /> Lácteos Frescos
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="absolute bottom-1/4 -left-4 bg-white px-6 py-3 rounded-full shadow-lg font-bold text-accent flex items-center gap-2"
              >
                <Cookie className="w-5 h-5 text-amber-700" /> Chocolate Premium
              </motion.div>
            </div>
          </div>
          
          <div className="mt-20 text-center relative z-10">
            <p className="text-foreground font-bold mb-4">¿QUIERES SABER MÁS?</p>
            <a 
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-8 py-3.5 bg-accent text-white rounded-full font-bold text-lg hover:bg-accent-hover transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
            >
              Escríbenos
            </a>
          </div>
        </div>

        {/* Soft Wave Bottom Divider */}
        <div className="absolute bottom-0 left-0 w-full">
           <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,80 C240,0 480,0 720,40 C960,80 1200,80 1440,40 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="ubicacion" className="bg-white pt-20 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            <Image 
              src="/images/logo-transparent.png" 
              unoptimized
              alt="Avita Logo" 
              width={200} 
              height={80}
              className="h-20 w-auto object-contain"
            />
            
            <div className="flex items-center gap-2 text-foreground font-medium bg-surface-border px-6 py-3 rounded-full">
              <MapPin className="w-5 h-5 text-accent" />
              Frente al Parque Helen Tenka
            </div>

            <div className="flex gap-4">
              <a href="https://www.instagram.com/avita_ice_cream/" target="_blank" rel="noopener noreferrer" className="p-3 bg-surface-border rounded-full text-foreground hover:text-white hover:bg-accent transition-colors">
                <InstagramIcon className="w-6 h-6" />
              </a>
              <a href="https://www.tiktok.com/@heladeriaavita" target="_blank" rel="noopener noreferrer" className="p-3 bg-surface-border rounded-full text-foreground hover:text-white hover:bg-accent transition-colors">
                <TikTokIcon className="w-6 h-6" />
              </a>
            </div>

            <div className="w-full h-px bg-surface-border max-w-2xl mx-auto my-4" />

            <p className="text-sm text-foreground/50 font-medium">
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
