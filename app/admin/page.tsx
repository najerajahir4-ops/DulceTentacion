"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  ShoppingBag,
  MapPin,
  ExternalLink,
  ChevronLeft,
  Plus,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  TrendingUp,
  Users,
  Smartphone,
  Monitor,
  Eye,
  RefreshCw,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  X,
  Loader2,
  Clock,
  Menu as MenuIcon,
  Sun,
  Moon,
  Grid,
  ChefHat,
  IceCream2,
  Sparkles,
  Palette,
  Package,
  Gift,
  Star,
  Flame,
  Settings,
  Coffee,
} from "lucide-react";
import { MENU_CATEGORIES, MenuCategory, MenuItem } from "@/lib/menu-types";
import { DishImageUploader } from "@/components/admin/DishImageUploader";
import { LogoCropperModal } from "@/components/admin/LogoCropperModal";
import { AnalyticsSummary } from "@/lib/analytics";

// Sleek Monochrome Vector Icons for Categories
const CATEGORY_VECTOR_ICONS: Record<MenuCategory, React.ComponentType<{ className?: string }>> = {
  "Helados Artesanales": IceCream2,
  Waffles: Grid,
  Frappés: Coffee,
  Crepes: ChefHat,
  Gelato: IceCream2,
  Nuevos: Sparkles,
  "Sabores de Gelato": Palette,
  "Bolos Gourmet": Package,
  Combos: Gift,
};

export default function AdminPage() {
  // Navigation tabs & Dark Mode
  const [currentTab, setCurrentTab] = useState<"analytics" | "products" | "banners" | "locations" | "settings">("products");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Logo & Hero Settings state
  const [logoUrl, setLogoUrl] = useState<string>("/images/logo-transparent.png");
  const [logoPublicId, setLogoPublicId] = useState<string>("");
  const [heroImageUrl, setHeroImageUrl] = useState<string>("/images/new_waffle-bgless.png");
  const [heroImagePublicId, setHeroImagePublicId] = useState<string>("");
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isLogoSaving, setIsLogoSaving] = useState(false);
  const [isHeroSaving, setIsHeroSaving] = useState(false);

  useEffect(() => {
    // Ensure public storefront html class is clean of global dark class
    document.documentElement.classList.remove("dark");
    const saved = localStorage.getItem("admin_theme");
    if (saved === "dark") {
      setIsDarkMode(true);
    }

    // Load site logo & hero settings
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          if (json.data.logoUrl) setLogoUrl(json.data.logoUrl);
          if (json.data.logoPublicId) setLogoPublicId(json.data.logoPublicId);
          if (json.data.heroImageUrl) setHeroImageUrl(json.data.heroImageUrl);
          if (json.data.heroImagePublicId) setHeroImagePublicId(json.data.heroImagePublicId);
        }
      })
      .catch((err) => console.error("Error al obtener configuración:", err));
  }, []);

  const handleSaveHeroImage = async (url: string, publicId: string) => {
    try {
      setIsHeroSaving(true);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroImageUrl: url,
          heroImagePublicId: publicId,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Fallo al guardar la foto de portada.");
      }
      setHeroImageUrl(url);
      setHeroImagePublicId(publicId);
    } catch (err: any) {
      console.error("Error al actualizar la foto del hero:", err);
      alert(err.message || "Error al actualizar la foto del hero.");
    } finally {
      setIsHeroSaving(false);
    }
  };

  const handleConfirmLogoCrop = async (croppedFile: File) => {
    try {
      setIsLogoSaving(true);

      // 1. Upload cropped file to Cloudinary
      const formData = new FormData();
      formData.append("file", croppedFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadJson = await uploadRes.json();
      const newUrl = uploadJson.url || uploadJson.data?.url;
      const newPublicId = uploadJson.public_id || uploadJson.data?.public_id || "";

      if (!uploadRes.ok || !newUrl) {
        throw new Error(uploadJson.error || "Fallo al subir el nuevo logo.");
      }

      // 2. Save settings (this API automatically deletes the old logo from Cloudinary!)
      const settingsRes = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoUrl: newUrl,
          logoPublicId: newPublicId,
        }),
      });

      const settingsJson = await settingsRes.json();
      if (!settingsRes.ok || !settingsJson.success) {
        throw new Error(settingsJson.error || "Fallo al guardar el logo.");
      }

      setLogoUrl(newUrl);
      setLogoPublicId(newPublicId);
    } catch (err: any) {
      console.error("Error al actualizar el logo:", err);
      alert(err.message || "Error al guardar el logo.");
    } finally {
      setIsLogoSaving(false);
    }
  };

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem("admin_theme", next ? "dark" : "light");
  };

  // Products state
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | "Todos">("Todos");
  const [productSearch, setProductSearch] = useState("");

  // Banners state
  const [banners, setBanners] = useState<any[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [bannerFormData, setBannerFormData] = useState({
    title: "",
    subtitle: "",
    price: "",
    badge: "OFERTA ESPECIAL ✦",
    link: "#menu",
    image: "",
    active: true,
    imageSize: "normal" as "normal" | "large" | "full",
    imageScale: 1.0,
    imageFit: "contain" as "contain" | "cover",
  });
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [bannerFormError, setBannerFormError] = useState<string | null>(null);
  const [productViewMode, setProductViewMode] = useState<"table" | "grid">("table");

  // Product Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Waffles" as MenuCategory,
    price: "",
    description: "",
    image: "",
    popular: false,
    isNew: false,
    available: true,
    imageSize: "normal" as "normal" | "large" | "extra",
    imageScale: 1.0,
    imageFit: "contain" as "contain" | "cover",
  });

  // Delete Confirmation Modal State
  const [productToDelete, setProductToDelete] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Load products
  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch("/api/menu");
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error("Error al cargar productos:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const res = await fetch("/api/analytics");
      const json = await res.json();
      if (json.success) {
        setAnalytics(json.data);
      }
    } catch (err) {
      console.error("Error al cargar analítica:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Load banners
  const loadBanners = async () => {
    try {
      setBannersLoading(true);
      const res = await fetch("/api/banners");
      const json = await res.json();
      if (json.success) {
        setBanners(json.data);
      }
    } catch (err) {
      console.error("Error al cargar banners:", err);
    } finally {
      setBannersLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadAnalytics();
    loadBanners();
  }, []);

  const handleOpenCreateBannerModal = () => {
    setEditingBanner(null);
    setBannerFormError(null);
    setBannerFormData({
      title: "",
      subtitle: "",
      price: "",
      badge: "OFERTA ESPECIAL ✦",
      link: "#menu",
      image: "",
      active: true,
      imageSize: "normal",
      imageScale: 1.0,
      imageFit: "contain",
    });
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBannerModal = (banner: any) => {
    setEditingBanner(banner);
    setBannerFormError(null);
    setBannerFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      price: banner.price || "",
      badge: banner.badge || "OFERTA ESPECIAL ✦",
      link: banner.link || "#menu",
      image: banner.image || "",
      active: banner.active,
      imageSize: banner.imageSize || "normal",
      imageScale: banner.imageScale ? Number(banner.imageScale) : 1.0,
      imageFit: banner.imageFit || "contain",
    });
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFormData.title.trim()) {
      setBannerFormError("Por favor ingresa un título para la promoción.");
      return;
    }

    setIsSavingBanner(true);
    setBannerFormError(null);

    try {
      const payload = {
        ...bannerFormData,
        image: bannerFormData.image.trim() || "/images/new_waffle-bgless.png",
      };

      let res;
      if (editingBanner) {
        res = await fetch("/api/banners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingBanner.id, ...payload }),
        });
      } else {
        res = await fetch("/api/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Error al guardar banner.");

      setIsBannerModalOpen(false);
      await loadBanners();
    } catch (err: any) {
      setBannerFormError(err.message || "No se pudo guardar el banner.");
    } finally {
      setIsSavingBanner(false);
    }
  };

  const handleToggleBannerActive = async (banner: any) => {
    try {
      const res = await fetch("/api/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: banner.id, active: !banner.active }),
      });
      const json = await res.json();
      if (json.success) {
        setBanners((prev) =>
          prev.map((b) => (b.id === banner.id ? { ...b, active: !banner.active } : b))
        );
      }
    } catch (err) {
      console.error("Error al cambiar estado del banner:", err);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este banner promocional?")) return;
    try {
      const res = await fetch(`/api/banners?id=${bannerId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setBanners((prev) => prev.filter((b) => b.id !== bannerId));
      }
    } catch (err) {
      console.error("Error al eliminar banner:", err);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === "Todos" || p.category === selectedCategory;
    const matchesQuery =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Modal Handlers
  const handleOpenCreateModal = (categoryOverride?: MenuCategory) => {
    setEditingProduct(null);
    setFormError(null);
    setFormData({
      name: "",
      category: categoryOverride || (selectedCategory === "Todos" ? "Waffles" : selectedCategory),
      price: "",
      description: "",
      image: "",
      popular: false,
      isNew: selectedCategory === "Nuevos",
      available: true,
      imageSize: "normal",
      imageScale: 1.0,
      imageFit: "contain",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: MenuItem) => {
    setEditingProduct(product);
    setFormError(null);
    setFormData({
      name: product.name,
      category: product.category as MenuCategory,
      price: product.price.replace("$", ""),
      description: product.description,
      image: product.image,
      popular: Boolean(product.popular),
      isNew: Boolean(product.isNew),
      available: Boolean(product.available),
      imageSize: product.imageSize || "normal",
      imageScale: product.imageScale ? Number(product.imageScale) : 1.0,
      imageFit: product.imageFit || "contain",
    });
    setIsModalOpen(true);
  };

  const getCategoryFallbackImage = (category: MenuCategory) => {
    switch (category) {
      case "Crepes": return "/images/crepe-bgless.png";
      case "Gelato": return "/images/new_icecream-bgless.png";
      case "Sabores de Gelato": return "/images/saborfresa-bgless.png";
      case "Bolos Gourmet": return "/images/vainilla-bgless.png";
      case "Combos": return "/images/concepto-plato.png";
      default: return "/images/new_waffle-bgless.png";
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price.trim()) {
      setFormError("Por favor completa el nombre y el precio.");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const payload = {
        ...formData,
        price: `$${formData.price.replace("$", "").trim()}`,
        image: formData.image.trim() || getCategoryFallbackImage(formData.category),
      };

      let res;
      if (editingProduct) {
        res = await fetch("/api/menu", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });
      } else {
        res = await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Error al guardar el producto.");

      setIsModalOpen(false);
      await loadProducts();
    } catch (err: any) {
      setFormError(err.message || "Error al procesar la solicitud.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAvailability = async (product: MenuItem) => {
    try {
      const res = await fetch("/api/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, available: !product.available }),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, available: !p.available } : p))
        );
      }
    } catch (err) {
      console.error("Error cambiando disponibilidad:", err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/menu?id=${productToDelete.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        setProductToDelete(null);
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Max visits for chart scaling
  const maxChartVisits = analytics?.dailyTimeline?.reduce(
    (max, d) => Math.max(max, d.visits),
    1
  ) || 1;

  // Dynamic Theme Helper Classes
  const cardBgClass = isDarkMode
    ? "bg-[#141C2E] border-slate-800 text-slate-100 shadow-none"
    : "bg-white border-slate-200 text-slate-800 shadow-2xs";

  const titleClass = isDarkMode ? "text-white" : "text-slate-900";
  const subtitleClass = isDarkMode ? "text-slate-400" : "text-slate-500";
  const inputClass = isDarkMode
    ? "w-full px-3.5 py-2 text-xs rounded-xl border admin-input-dark font-sans"
    : "w-full px-3.5 py-2 text-xs rounded-xl border admin-input-light font-sans";

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-200 ${isDarkMode ? "bg-[#0B0F17] text-slate-100" : "bg-[#F8FAFC] text-slate-800"}`}>
      {/* MOBILE TOP BAR */}
      <div className={`md:hidden border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50 ${isDarkMode ? "bg-[#0F172A] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#7A1620] flex items-center justify-center text-white font-bold text-sm">
            W
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight font-sans">Waffles & Crepes</h1>
            <p className={`text-[10px] font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Panel Administrativo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg border text-xs font-semibold ${isDarkMode ? "bg-slate-800 border-slate-700 text-amber-400" : "bg-slate-50 border-slate-200 text-slate-700"}`}
          >
            {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg ${isDarkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* LEFT SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 min-w-[256px] shrink-0 border-r z-40 flex flex-col justify-between transition-all duration-200 ${
          isDarkMode ? "bg-[#0F172A] border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
        } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div>
          {/* Brand Header */}
          <div className={`p-6 border-b ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7A1620] to-[#E4536B] flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
                W
              </div>
              <div>
                <h2 className={`font-bold text-sm tracking-tight font-sans ${isDarkMode ? "text-white" : "text-slate-900"}`}>Waffles & Crepes</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className={`text-[11px] font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Online • Santo Domingo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="px-3 py-6 space-y-1.5">
            <div className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
              Menú Principal
            </div>

            {/* 1. ANALYTICS */}
            <button
              onClick={() => {
                setCurrentTab("analytics");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === "analytics"
                  ? isDarkMode ? "bg-[#E4536B] text-white shadow-sm" : "bg-slate-900 text-white shadow-xs"
                  : isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4" />
                <span>Analítica & Visitas</span>
              </div>
              {analytics && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    currentTab === "analytics"
                      ? "bg-white/20 text-white"
                      : isDarkMode ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40" : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  +{analytics.todayVisits} hoy
                </span>
              )}
            </button>

            {/* 2. PRODUCTOS */}
            <button
              onClick={() => {
                setCurrentTab("products");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === "products"
                  ? isDarkMode ? "bg-[#E4536B] text-white shadow-sm" : "bg-slate-900 text-white shadow-xs"
                  : isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>Productos</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  currentTab === "products" 
                    ? "bg-white/20 text-white" 
                    : isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                }`}
              >
                {products.length}
              </span>
            </button>

            {/* 3. BANNERS PROMOCIONALES */}
            <button
              onClick={() => {
                setCurrentTab("banners");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === "banners"
                  ? isDarkMode ? "bg-[#E4536B] text-white shadow-sm" : "bg-slate-900 text-white shadow-xs"
                  : isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Banners Promocionales</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  currentTab === "banners" 
                    ? "bg-white/20 text-white" 
                    : isDarkMode ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" : "bg-amber-50 text-amber-600 border border-amber-200"
                }`}
              >
                {banners.length}
              </span>
            </button>

            {/* 4. SUCURSALES */}
            <button
              onClick={() => {
                setCurrentTab("locations");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === "locations"
                  ? isDarkMode ? "bg-[#E4536B] text-white shadow-sm" : "bg-slate-900 text-white shadow-xs"
                  : isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>Sucursales</span>
              </div>
              <span className={`text-[10px] font-medium ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>2 sedes</span>
            </button>

            {/* 5. LOGO DE LA MARCA */}
            <button
              onClick={() => {
                setCurrentTab("settings");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === "settings"
                  ? isDarkMode ? "bg-[#E4536B] text-white shadow-sm" : "bg-slate-900 text-white shadow-xs"
                  : isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-[#E4536B]" />
                <span>Logo & Marca</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  currentTab === "settings" 
                    ? "bg-white/20 text-white" 
                    : isDarkMode ? "bg-[#E4536B]/15 text-[#E4536B]" : "bg-rose-50 text-[#E4536B]"
                }`}
              >
                Oficial
              </span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t space-y-3 ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
          {/* Modo Noche / Día Switch */}
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isDarkMode
                ? "bg-slate-800/80 border-slate-700/80 text-amber-300 hover:bg-slate-800"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>{isDarkMode ? "Modo Noche" : "Modo Día"}</span>
            </div>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${isDarkMode ? "bg-amber-400/20 text-amber-300" : "bg-slate-200 text-slate-700"}`}>
              {isDarkMode ? "ON" : "OFF"}
            </span>
          </button>

          <Link
            href="/"
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
              isDarkMode 
                ? "border-slate-800 text-slate-300 hover:bg-slate-800" 
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Volver a la Tienda
          </Link>
          <div className={`text-[11px] text-center ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
            Avita v2.4 • Panel Corporativo
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-xs"
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* ========================================================= */}
        {/* TAB 1: ANALYTICS & VISITAS                                */}
        {/* ========================================================= */}
        {currentTab === "analytics" && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className={`text-2xl font-bold font-sans tracking-tight flex items-center gap-2.5 ${titleClass}`}>
                  <BarChart3 className="w-6 h-6 text-[#E4536B]" />
                  Analítica de Tráfico Diario
                </h1>
                <p className={`text-xs mt-1 ${subtitleClass}`}>
                  Métricas en tiempo real de visitas, visitantes únicos y afluencia al menú.
                </p>
              </div>

              <button
                onClick={loadAnalytics}
                disabled={analyticsLoading}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-colors shadow-2xs self-start ${
                  isDarkMode
                    ? "bg-[#141C2E] border-slate-800 text-slate-200 hover:bg-slate-800"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? "animate-spin" : ""}`} />
                Actualizar Datos
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Visitas Hoy */}
              <div className={`rounded-2xl p-5 border ${cardBgClass}`}>
                <div className={`flex items-center justify-between ${subtitleClass}`}>
                  <span className="text-xs font-semibold">Visitas Hoy</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? "bg-blue-950/60 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className={`text-3xl font-extrabold font-sans ${titleClass}`}>
                    {analytics?.todayVisits ?? "--"}
                  </span>
                  {analytics && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        analytics.growthRate >= 0
                          ? isDarkMode ? "bg-emerald-950/60 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                          : isDarkMode ? "bg-rose-950/60 text-rose-400" : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {analytics.growthRate >= 0 ? "+" : ""}
                      {analytics.growthRate}%
                    </span>
                  )}
                </div>
                <p className={`text-[11px] mt-1.5 ${subtitleClass}`}>
                  vs {analytics?.yesterdayVisits ?? 0} visitas ayer
                </p>
              </div>

              {/* Visitantes Únicos */}
              <div className={`rounded-2xl p-5 border ${cardBgClass}`}>
                <div className={`flex items-center justify-between ${subtitleClass}`}>
                  <span className="text-xs font-semibold">Visitantes Únicos</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? "bg-emerald-950/60 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`text-3xl font-extrabold font-sans ${titleClass}`}>
                    {analytics?.uniqueVisitorsToday ?? "--"}
                  </span>
                </div>
                <p className={`text-[11px] mt-1.5 ${subtitleClass}`}>Personas estimadas navegando hoy</p>
              </div>

              {/* Total Visitas */}
              <div className={`rounded-2xl p-5 border ${cardBgClass}`}>
                <div className={`flex items-center justify-between ${subtitleClass}`}>
                  <span className="text-xs font-semibold">Total Histórico</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? "bg-violet-950/60 text-violet-400" : "bg-violet-50 text-violet-600"}`}>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`text-3xl font-extrabold font-sans ${titleClass}`}>
                    {analytics?.totalVisits ? analytics.totalVisits.toLocaleString() : "--"}
                  </span>
                </div>
                <p className={`text-[11px] mt-1.5 ${subtitleClass}`}>Aperturas de menú registradas</p>
              </div>

              {/* Dispositivo Principal */}
              <div className={`rounded-2xl p-5 border ${cardBgClass}`}>
                <div className={`flex items-center justify-between ${subtitleClass}`}>
                  <span className="text-xs font-semibold">Móvil vs Escritorio</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? "bg-amber-950/60 text-amber-400" : "bg-amber-50 text-amber-600"}`}>
                    <Smartphone className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className={`text-3xl font-extrabold font-sans ${titleClass}`}>
                    {analytics?.deviceBreakdown?.mobile ?? 80}%
                  </span>
                  <span className={`text-xs font-medium ${subtitleClass}`}>Móvil</span>
                </div>
                <p className={`text-[11px] mt-1.5 ${subtitleClass}`}>
                  {analytics?.deviceBreakdown?.desktop ?? 20}% desde PC / Laptops
                </p>
              </div>
            </div>

            {/* 7-DAY VISITS CHART */}
            <div className={`rounded-2xl p-6 border space-y-6 ${cardBgClass}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-base font-bold font-sans ${titleClass}`}>Tráfico de los Últimos 7 Días</h2>
                  <p className={`text-xs ${subtitleClass}`}>Número de visitas recibidas día por día</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-500"}`}>
                  Última semana
                </span>
              </div>

              {/* Interactive Bar Chart */}
              <div className="pt-6 pb-2">
                <div className={`flex items-end justify-between gap-2 sm:gap-6 border-b px-2 sm:px-6 pb-2 ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                  {analytics?.dailyTimeline?.map((day, idx) => {
                    const heightPercent = Math.max(16, Math.round((day.visits / maxChartVisits) * 100));
                    const isToday = idx === (analytics?.dailyTimeline?.length ?? 0) - 1;

                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap z-20">
                          {day.visits} visitas ({day.uniqueVisitors} únicos)
                        </div>

                        {/* Bar Container with defined height */}
                        <div className={`w-full max-w-[52px] h-40 rounded-t-xl overflow-hidden flex flex-col justify-end relative shadow-2xs ${isDarkMode ? "bg-slate-800/60" : "bg-slate-100/90"}`}>
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t-xl transition-all duration-500 flex items-start justify-center pt-1.5 ${
                              isToday
                                ? "bg-gradient-to-t from-[#7A1620] to-[#E4536B] shadow-sm shadow-[#E4536B]/30"
                                : isDarkMode ? "bg-slate-600 group-hover:bg-[#E4536B]" : "bg-slate-800 group-hover:bg-[#E4536B]"
                            }`}
                          >
                            <span className="text-[10px] font-bold text-white/90 drop-shadow-xs">
                              {day.visits}
                            </span>
                          </div>
                        </div>

                        {/* Day label */}
                        <span
                          className={`text-[11px] font-semibold tracking-tight ${
                            isToday ? "text-[#E4536B] font-bold" : subtitleClass
                          }`}
                        >
                          {day.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* HORAS PICO & DISPOSITIVOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Horas de Mayor Afluencia */}
              <div className={`rounded-2xl p-6 border space-y-4 ${cardBgClass}`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#E4536B]" />
                  <h3 className={`text-sm font-bold font-sans ${titleClass}`}>Horarios con Mayor Demanda</h3>
                </div>
                <p className={`text-xs ${subtitleClass}`}>
                  Horas del día en que los clientes abren el menú con más frecuencia:
                </p>

                <div className="space-y-3 pt-2">
                  <div className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
                    <span className={`text-xs font-semibold ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>Tarde (15:00 - 18:00)</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${isDarkMode ? "bg-emerald-950/80 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                      <span>Pico Máximo</span>
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                    </span>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
                    <span className={`text-xs font-semibold ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>Noche (19:00 - 21:30)</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isDarkMode ? "bg-blue-950/80 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                      Alta Afluencia
                    </span>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
                    <span className={`text-xs font-semibold ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>Mediodía (12:00 - 14:00)</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-200/60 text-slate-500"}`}>
                      Moderado
                    </span>
                  </div>
                </div>
              </div>

              {/* Desglose por Dispositivos */}
              <div className={`rounded-2xl p-6 border space-y-4 ${cardBgClass}`}>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#E4536B]" />
                  <h3 className={`text-sm font-bold font-sans ${titleClass}`}>Distribución por Dispositivo</h3>
                </div>
                <p className={`text-xs ${subtitleClass}`}>
                  Porcentaje de visitas según el dispositivo del usuario:
                </p>

                {/* Progress bar visual */}
                <div className={`w-full h-4 rounded-full overflow-hidden flex ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                  <div
                    style={{ width: `${analytics?.deviceBreakdown?.mobile ?? 80}%` }}
                    className="bg-[#7A1620]"
                    title="Móvil"
                  />
                  <div
                    style={{ width: `${analytics?.deviceBreakdown?.desktop ?? 15}%` }}
                    className="bg-[#E4536B]"
                    title="Escritorio"
                  />
                  <div
                    style={{ width: `${analytics?.deviceBreakdown?.tablet ?? 5}%` }}
                    className="bg-amber-400"
                    title="Tablet"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
                    <span className={`text-xs font-bold font-sans block ${titleClass}`}>
                      {analytics?.deviceBreakdown?.mobile ?? 80}%
                    </span>
                    <span className={`text-[10px] font-medium ${subtitleClass}`}>Smartphones</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
                    <span className={`text-xs font-bold font-sans block ${titleClass}`}>
                      {analytics?.deviceBreakdown?.desktop ?? 15}%
                    </span>
                    <span className={`text-[10px] font-medium ${subtitleClass}`}>Computadoras</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
                    <span className={`text-xs font-bold font-sans block ${titleClass}`}>
                      {analytics?.deviceBreakdown?.tablet ?? 5}%
                    </span>
                    <span className={`text-[10px] font-medium ${subtitleClass}`}>Tablets</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE ACTIVITY LOG */}
            <div className={`rounded-2xl p-6 border space-y-4 ${cardBgClass}`}>
              <h3 className={`text-sm font-bold font-sans ${titleClass}`}>Registro Reciente de Visitas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b text-slate-400 font-bold uppercase tracking-wider ${isDarkMode ? "border-slate-800 bg-slate-900/40" : "border-slate-100 bg-slate-50/50"}`}>
                      <th className="py-3 px-3">Fecha y Hora</th>
                      <th className="py-3 px-3">Dispositivo</th>
                      <th className="py-3 px-3">Navegador</th>
                      <th className="py-3 px-3">Página</th>
                      <th className="py-3 px-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-medium ${isDarkMode ? "divide-slate-800 text-slate-200" : "divide-slate-100 text-slate-700"}`}>
                    {analytics?.recentVisits?.map((visit) => (
                      <tr key={visit.id} className={`transition-colors ${isDarkMode ? "hover:bg-slate-800/40" : "hover:bg-slate-50/80"}`}>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {new Date(visit.timestamp).toLocaleString("es-EC", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1.5">
                            {visit.device === "Mobile" ? (
                              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <Monitor className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            {visit.device}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">{visit.browser}</td>
                        <td className={`py-2.5 px-3 font-mono text-[11px] ${subtitleClass}`}>
                          {visit.path}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40" : "bg-emerald-50 text-emerald-600"}`}>
                            <CheckCircle2 className="w-3 h-3" /> Conectado
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: APARTADO DE PRODUCTOS                             */}
        {/* ========================================================= */}
        {currentTab === "products" && (
          <div className="space-y-6">
            {/* Header with Title and Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className={`text-2xl font-bold font-sans tracking-tight flex items-center gap-2.5 ${titleClass}`}>
                  <ShoppingBag className="w-6 h-6 text-[#E4536B]" />
                  Catálogo de Productos
                </h1>
                <p className={`text-xs mt-1 ${subtitleClass}`}>
                  Administra las 7 categorías de waffles, crepes, gelato, bolos y combos.
                </p>
              </div>

              <button
                onClick={() => handleOpenCreateModal()}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all self-start sm:self-auto ${
                  isDarkMode
                    ? "bg-[#E4536B] text-white hover:bg-[#c4455a]"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                <Plus className="w-4 h-4" />
                Nuevo Producto
              </button>
            </div>

            {/* Category Filter Pills (Vector Icons) */}
            <div className={`rounded-2xl p-2.5 border ${cardBgClass}`}>
              <div className="flex overflow-x-auto gap-1.5 pb-1 hide-scrollbar">
                <button
                  onClick={() => setSelectedCategory("Todos")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    selectedCategory === "Todos"
                      ? isDarkMode ? "bg-[#E4536B] text-white shadow-sm" : "bg-slate-900 text-white shadow-xs"
                      : isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Todos</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      selectedCategory === "Todos"
                        ? "bg-white/20 text-white"
                        : isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {products.length}
                  </span>
                </button>

                {MENU_CATEGORIES.map((cat) => {
                  const IconComponent = CATEGORY_VECTOR_ICONS[cat];
                  const count = products.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 group ${
                        selectedCategory === cat
                          ? isDarkMode ? "bg-[#E4536B] text-white shadow-sm" : "bg-slate-900 text-white shadow-xs"
                          : isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {IconComponent && <IconComponent className="w-4 h-4" />}
                      <span>{cat}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          selectedCategory === cat
                            ? "bg-white/20 text-white"
                            : isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar & View Mode Switch */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#E4536B] ${
                    isDarkMode
                      ? "bg-[#141C2E] border-slate-800 text-white placeholder-slate-500"
                      : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className={`text-xs font-medium mr-1 ${subtitleClass}`}>
                  {filteredProducts.length} productos
                </span>
                <div className={`border rounded-xl p-1 flex items-center gap-1 shadow-2xs ${isDarkMode ? "bg-[#141C2E] border-slate-800" : "bg-white border-slate-200"}`}>
                  <button
                    onClick={() => setProductViewMode("table")}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      productViewMode === "table"
                        ? isDarkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                    title="Vista de Tabla"
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setProductViewMode("grid")}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      productViewMode === "grid"
                        ? isDarkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                    title="Vista de Tarjetas"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* PRODUCTS CONTENT */}
            {productsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#E4536B]" />
                <p className="text-xs font-semibold">Cargando catálogo de productos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className={`rounded-2xl p-12 text-center border space-y-3 ${cardBgClass}`}>
                <div className="w-12 h-12 mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className={`text-sm font-bold font-sans ${titleClass}`}>No se encontraron productos</h3>
                <p className={`text-xs max-w-sm mx-auto ${subtitleClass}`}>
                  Prueba cambiando el filtro o agrega un nuevo producto en esta categoría.
                </p>
                <button
                  onClick={() =>
                    handleOpenCreateModal(selectedCategory === "Todos" ? "Waffles" : selectedCategory)
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E4536B] text-white text-xs font-bold hover:bg-[#c4455a]"
                >
                  <Plus className="w-4 h-4" />
                  Crear Producto
                </button>
              </div>
            ) : productViewMode === "table" ? (
              /* TABLA PROFESIONAL */
              <div className={`rounded-2xl border overflow-hidden ${cardBgClass}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b font-bold uppercase tracking-wider ${isDarkMode ? "bg-slate-900/60 border-slate-800 text-slate-400" : "bg-slate-50/70 border-slate-100 text-slate-400"}`}>
                        <th className="py-3.5 px-4">Producto</th>
                        <th className="py-3.5 px-4">Categoría</th>
                        <th className="py-3.5 px-4">Precio</th>
                        <th className="py-3.5 px-4">Estado</th>
                        <th className="py-3.5 px-4">Etiquetas</th>
                        <th className="py-3.5 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y font-medium ${isDarkMode ? "divide-slate-800 text-slate-200" : "divide-slate-100 text-slate-700"}`}>
                      {filteredProducts.map((product) => {
                        const CatIcon = CATEGORY_VECTOR_ICONS[product.category as MenuCategory] || IceCream2;

                        return (
                          <tr key={product.id} className={`transition-colors ${isDarkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50/60"}`}>
                            {/* Photo & Name */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl border overflow-hidden flex-shrink-0 flex items-center justify-center p-1 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div>
                                  <h4 className={`font-bold font-sans text-xs leading-tight ${titleClass}`}>
                                    {product.name}
                                  </h4>
                                  <p className={`text-[11px] line-clamp-1 mt-0.5 max-w-xs ${subtitleClass}`}>
                                    {product.description}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Categoría con Vector Icon */}
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${isDarkMode ? "bg-slate-800 text-slate-300 border border-slate-700/50" : "bg-slate-100 text-slate-700"}`}>
                                {CatIcon && <CatIcon className="w-3.5 h-3.5" />}
                                <span>{product.category}</span>
                              </span>
                            </td>

                            {/* Precio */}
                            <td className={`py-3 px-4 font-bold font-sans text-xs ${titleClass}`}>
                              {product.price}
                            </td>

                            {/* Estado Disponible / Agotado */}
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleToggleAvailability(product)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                                  product.available
                                    ? isDarkMode ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40" : "bg-emerald-50 text-emerald-700"
                                    : isDarkMode ? "bg-rose-950/80 text-rose-400 border border-rose-800/40" : "bg-rose-50 text-rose-700"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    product.available ? "bg-emerald-500" : "bg-rose-500"
                                  }`}
                                />
                                {product.available ? "Disponible" : "Agotado"}
                              </button>
                            </td>

                            {/* Badges con Vector Icons */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                {product.popular && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${isDarkMode ? "bg-amber-950/60 text-amber-300 border-amber-800/40" : "bg-amber-50 text-amber-800 border-amber-200/60"}`}>
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                    Pop
                                  </span>
                                )}
                                {product.isNew && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${isDarkMode ? "bg-rose-950/60 text-rose-300 border-rose-800/40" : "bg-rose-50 text-rose-700 border-rose-200/60"}`}>
                                    <Sparkles className="w-3 h-3 text-rose-500" />
                                    Nuevo
                                  </span>
                                )}
                                {!product.popular && !product.isNew && (
                                  <span className="text-slate-400 text-xs">—</span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleOpenEditModal(product)}
                                  className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"}`}
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setProductToDelete(product)}
                                  className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? "text-rose-400 hover:text-rose-300 hover:bg-rose-950/50" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"}`}
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* GRID VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const CatIcon = CATEGORY_VECTOR_ICONS[product.category as MenuCategory] || IceCream2;

                  return (
                    <div
                      key={product.id}
                      className={`rounded-2xl p-5 border transition-all duration-200 shadow-2xs flex flex-col justify-between ${cardBgClass} ${
                        !product.available ? "opacity-75" : ""
                      }`}
                    >
                      <div>
                        {/* Photo */}
                        <div className={`relative w-full h-40 rounded-xl overflow-hidden flex items-center justify-center p-3 mb-3 border ${isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                            {product.popular && (
                              <span className="bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs inline-flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-950 fill-amber-950" />
                                Pop
                              </span>
                            )}
                            {product.isNew && (
                              <span className="bg-[#E4536B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs inline-flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-white" />
                                Nuevo
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={`font-bold font-sans text-sm line-clamp-1 ${titleClass}`}>
                              {product.name}
                            </h3>
                            <span className="font-bold font-sans text-[#E4536B] text-sm">{product.price}</span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${subtitleClass} flex items-center gap-1`}>
                            {CatIcon && <CatIcon className="w-3.5 h-3.5" />}
                            {product.category}
                          </span>
                          <p className={`text-xs line-clamp-2 mt-1 leading-relaxed ${subtitleClass}`}>
                            {product.description}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className={`pt-3 mt-3 border-t flex items-center justify-between ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                        <button
                          onClick={() => handleToggleAvailability(product)}
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                            product.available
                              ? isDarkMode ? "bg-emerald-950/80 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                              : isDarkMode ? "bg-rose-950/80 text-rose-400" : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {product.available ? "Disponible" : "Agotado"}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className={`p-1.5 rounded-lg ${isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className={`p-1.5 rounded-lg ${isDarkMode ? "text-rose-400 hover:bg-rose-950/50" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: BANNERS PROMOCIONALES                              */}
        {/* ========================================================= */}
        {currentTab === "banners" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className={`text-2xl font-bold font-sans tracking-tight flex items-center gap-2.5 ${titleClass}`}>
                  <Sparkles className="w-6 h-6 text-amber-400" />
                  Banners Promocionales (Estilo KFC)
                </h1>
                <p className={`text-xs mt-1 ${subtitleClass}`}>
                  Administra las ofertas, combos y anuncios que aparecen en el carrusel de la tienda pública.
                </p>
              </div>

              <button
                onClick={handleOpenCreateBannerModal}
                className="px-4 py-2.5 rounded-xl bg-[#E4536B] hover:bg-[#c4455a] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Banner Promocional</span>
              </button>
            </div>

            {bannersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#E4536B]" />
              </div>
            ) : banners.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl border ${cardBgClass}`}>
                <p className="text-sm font-semibold">No hay banners promocionales creados.</p>
                <button
                  onClick={handleOpenCreateBannerModal}
                  className="mt-4 px-4 py-2 bg-[#E4536B] text-white rounded-xl text-xs font-bold"
                >
                  Crear Primer Banner
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className={`rounded-2xl p-5 border relative overflow-hidden flex flex-col justify-between space-y-4 ${cardBgClass}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="bg-[#E4536B] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                        {banner.badge}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleBannerActive(banner)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                            banner.active
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-700/50 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {banner.active ? "● Activo" : "○ Pausado"}
                        </button>
                        <button
                          onClick={() => handleOpenEditBannerModal(banner)}
                          className={`p-1.5 rounded-lg ${isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          className={`p-1.5 rounded-lg ${isDarkMode ? "text-rose-400 hover:bg-rose-950/50" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-8 space-y-1">
                        <h3 className={`text-base font-bold ${titleClass}`}>{banner.title}</h3>
                        <p className={`text-xs ${subtitleClass} line-clamp-2`}>{banner.subtitle}</p>
                      </div>
                      <div className="col-span-4 h-24 relative flex items-center justify-center p-1 bg-slate-950/20 rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SUCURSALES                                        */}
        {/* ========================================================= */}
        {currentTab === "locations" && (
          <div className="space-y-6">
            <div>
              <h1 className={`text-2xl font-bold font-sans tracking-tight flex items-center gap-2.5 ${titleClass}`}>
                <MapPin className="w-6 h-6 text-[#E4536B]" />
                Sucursales en Santo Domingo
              </h1>
              <p className={`text-xs mt-1 ${subtitleClass}`}>
                Información de puntos de venta y atención al cliente.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Casa Matriz */}
              <div className={`rounded-2xl p-6 border space-y-4 ${cardBgClass}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-rose-950/60 text-rose-400" : "bg-rose-50 text-[#E4536B]"}`}>
                  <MapPin className="w-5 h-5 text-[#E4536B]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4536B] block">
                    Casa Matriz
                  </span>
                  <h3 className={`text-base font-bold font-sans mt-0.5 ${titleClass}`}>
                    Av. la Lorena y Lázaro Cárdenas esquina
                  </h3>
                  <p className={`text-xs mt-1 ${subtitleClass}`}>
                    Santo Domingo de los Tsáchilas, Ecuador
                  </p>
                </div>
                <div className={`p-3 rounded-xl text-xs space-y-1 font-medium ${isDarkMode ? "bg-slate-900/80 border border-slate-800 text-slate-300" : "bg-slate-50 border border-slate-100 text-slate-600"}`}>
                  <div className="flex justify-between">
                    <span>Horario de Atención:</span>
                    <span className={`font-bold ${titleClass}`}>14:00 - 22:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waffles y Crepes:</span>
                    <span className="font-bold text-emerald-500">Servicio en mesa & Takeaway</span>
                  </div>
                </div>
              </div>

              {/* Sucursal #1 */}
              <div className={`rounded-2xl p-6 border space-y-4 ${cardBgClass}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-rose-950/60 text-rose-400" : "bg-rose-50 text-[#E4536B]"}`}>
                  <MapPin className="w-5 h-5 text-[#E4536B]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4536B] block">
                    Sucursal #1
                  </span>
                  <h3 className={`text-base font-bold font-sans mt-0.5 ${titleClass}`}>
                    Los Rosales, calle Venezuela
                  </h3>
                  <p className={`text-xs mt-1 ${subtitleClass}`}>
                    Santo Domingo de los Tsáchilas, Ecuador
                  </p>
                </div>
                <div className={`p-3 rounded-xl text-xs space-y-1 font-medium ${isDarkMode ? "bg-slate-900/80 border border-slate-800 text-slate-300" : "bg-slate-50 border border-slate-100 text-slate-600"}`}>
                  <div className="flex justify-between">
                    <span>Horario de Atención:</span>
                    <span className={`font-bold ${titleClass}`}>14:00 - 22:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gelato & Postres:</span>
                    <span className="font-bold text-emerald-500">Servicio en mesa & Takeaway</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: LOGO & MARCA DE LA EMPRESA                        */}
        {/* ========================================================= */}
        {currentTab === "settings" && (
          <div className="space-y-6">
            <div>
              <h1 className={`text-2xl font-bold font-sans tracking-tight flex items-center gap-2.5 ${titleClass}`}>
                <Settings className="w-6 h-6 text-[#E4536B]" />
                Logo Oficial de la Marca
              </h1>
              <p className={`text-xs mt-1 ${subtitleClass}`}>
                Gestiona el logo que se muestra en el encabezado y pie de página de toda la tienda web.
              </p>
            </div>

            <div className={`rounded-3xl p-6 sm:p-8 border space-y-6 max-w-2xl ${cardBgClass}`}>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Current Circular Logo Preview */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-[#E4536B] shadow-xl overflow-hidden bg-white flex items-center justify-center p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoUrl}
                      alt="Logo Oficial"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-[#E4536B] text-white p-2 rounded-full shadow-lg border-2 border-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>

                {/* Info & Action */}
                <div className="space-y-3 text-center sm:text-left flex-1">
                  <div>
                    <h3 className={`text-base font-bold font-sans ${titleClass}`}>
                      Logo Actual de Avita
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${subtitleClass}`}>
                      Este logo se sincroniza automáticamente en el <strong>Header</strong> y el <strong>Footer</strong> de la tienda pública.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3 justify-center sm:justify-start">
                    <button
                      type="button"
                      disabled={isLogoSaving}
                      onClick={() => setIsLogoModalOpen(true)}
                      className="px-5 py-2.5 bg-[#E4536B] text-white text-xs font-bold rounded-full shadow-md hover:bg-[#c4455a] flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Cambiar y Recortar Logo</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Space Saving Info Alert */}
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                isDarkMode ? "bg-slate-900/60 border-slate-800 text-slate-300" : "bg-rose-50/60 border-rose-200/60 text-slate-700"
              }`}>
                <div className="flex items-center gap-2 font-bold text-[#E4536B]">
                  <CheckCircle2 className="w-4 h-4" />
                  Optimización de Almacenamiento Automático
                </div>
                <p className="pl-6">
                  Al confirmar un nuevo logo, el visor circular interactivo te permitirá ajustar la posición y escala. La imagen anterior en Cloudinary se eliminará automáticamente para ahorrar espacio de almacenamiento.
                </p>
              </div>
            </div>

            {/* 2. CARD FOTO DE PORTADA / HERO SHOWCASE */}
            <div className={`rounded-3xl p-6 sm:p-8 border space-y-6 max-w-2xl ${cardBgClass}`}>
              <div>
                <h2 className={`text-lg font-bold font-sans flex items-center gap-2 ${titleClass}`}>
                  <Sparkles className="w-5 h-5 text-[#E4536B]" />
                  Foto Principal de la Portada (Hero Showcase)
                </h2>
                <p className={`text-xs mt-1 ${subtitleClass}`}>
                  Esta es la imagen principal de tu plato estrella que se muestra en grande al inicio de la página. Puedes activar la casilla para <strong>quitar el fondo automáticamente con IA (PNG transparente)</strong>.
                </p>
              </div>

              {/* Current Hero Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-44 h-44 shrink-0 rounded-[30px] bg-gradient-to-br from-[#F4EBDC] to-[#E5D5C0] p-4 shadow-xl border-2 border-[#D49B4B]/40 bitten-corner-mask flex items-center justify-center relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImageUrl}
                    alt="Foto Principal Hero"
                    className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4536B] block">
                      Subir y Cambiar Foto con Eliminación de Fondo
                    </span>
                    <p className={`text-xs ${subtitleClass}`}>
                      Selecciona la foto de tu plato. Marca la casilla para que la IA elimine el fondo automáticamente y ahorre espacio en Cloudinary.
                    </p>
                  </div>

                  <DishImageUploader
                    isDarkMode={isDarkMode}
                    onUploadSuccess={(url, publicId) => {
                      handleSaveHeroImage(url, publicId);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Interactive Circle Logo Cropper Modal */}
      <LogoCropperModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        onConfirmCrop={handleConfirmLogoCrop}
        isDarkMode={isDarkMode}
      />

      {/* ========================================================= */}
      {/* MODAL CREAR / EDITAR PRODUCTO                             */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => !isSaving && setIsModalOpen(false)}
          />

          <div className={`relative rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 border z-10 space-y-5 ${isDarkMode ? "bg-[#141C2E] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
              <div>
                <h3 className={`text-base font-bold font-sans ${titleClass}`}>
                  {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                </h3>
                <p className={`text-[11px] ${subtitleClass}`}>
                  {editingProduct ? "Modifica los detalles del producto" : "Agrega un nuevo ítem a tu catálogo"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-1.5 rounded-lg ${isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Name & Category */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${titleClass}`}>Nombre *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Waffle Frutos Rojos"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold ${titleClass}`}>Categoría *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as MenuCategory })
                    }
                    className={inputClass}
                  >
                    {MENU_CATEGORIES.map((c) => (
                      <option key={c} value={c} className={isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Switches */}
              <div className="grid sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${titleClass}`}>Precio ($ USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      $
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="4.50"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 sm:pt-4">
                  <label className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer ${titleClass}`}>
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                      className="rounded text-[#E4536B] focus:ring-[#E4536B]"
                    />
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Pop
                  </label>

                  <label className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer ${titleClass}`}>
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                      className="rounded text-[#E4536B] focus:ring-[#E4536B]"
                    />
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    Nuevo
                  </label>

                  <label className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer ${titleClass}`}>
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    ✅ Disponible
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className={`text-xs font-bold ${titleClass}`}>Descripción / Ingredientes</label>
                <textarea
                  rows={2}
                  placeholder="Detalla los ingredientes o si incluye gelato, frutas, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={inputClass}
                />
              </div>

              {/* Foto del Plato Uploader */}
              <div className="space-y-1.5 pt-1">
                <label className={`text-xs font-bold ${titleClass}`}>Foto del Plato</label>
                <DishImageUploader
                  isDarkMode={isDarkMode}
                  onUploadSuccess={(url) => {
                    setFormData((prev) => ({ ...prev, image: url }));
                  }}
                />
              </div>

              {/* Apariencia y Escala de Imagen (Estilo WordPress) */}
              <div className={`p-3.5 rounded-2xl border space-y-3 ${isDarkMode ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E4536B]" />
                  <span className={`text-xs font-bold font-sans ${titleClass}`}>
                    Apariencia y Tamaños de Imagen (Estilo WordPress)
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className={`text-[11px] font-bold ${subtitleClass}`}>Tamaño Visual</label>
                    <select
                      value={formData.imageSize}
                      onChange={(e) => setFormData({ ...formData, imageSize: e.target.value as any })}
                      className={inputClass}
                    >
                      <option value="normal">Estándar (180px)</option>
                      <option value="large">Grande (230px)</option>
                      <option value="extra">Gigante (280px)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[11px] font-bold ${subtitleClass}`}>Zoom / Escala</label>
                    <select
                      value={formData.imageScale}
                      onChange={(e) => setFormData({ ...formData, imageScale: Number(e.target.value) })}
                      className={inputClass}
                    >
                      <option value={1.0}>100% (Normal)</option>
                      <option value={1.15}>115% (Ligeramente ampliado)</option>
                      <option value={1.3}>130% (Zoom destacado)</option>
                      <option value={1.5}>150% (Zoom máximo)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[11px] font-bold ${subtitleClass}`}>Modo de Encuadre</label>
                    <select
                      value={formData.imageFit}
                      onChange={(e) => setFormData({ ...formData, imageFit: e.target.value as any })}
                      className={inputClass}
                    >
                      <option value="contain">Ajustar plato (Sin recortar)</option>
                      <option value="cover">Llenar tarjeta (Cover)</option>
                    </select>
                  </div>
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-rose-950/80 border border-rose-800/60 text-rose-300 text-xs rounded-xl">
                  {formError}
                </div>
              )}

              {/* Modal Buttons */}
              <div className={`flex items-center justify-end gap-2.5 pt-3 border-t ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold ${isDarkMode ? "border-slate-800 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#E4536B] text-white text-xs font-bold hover:bg-[#c4455a] flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...
                    </>
                  ) : editingProduct ? (
                    "Guardar Cambios"
                  ) : (
                    "Crear Producto"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL ELIMINAR PRODUCTO (CONFIRMACIÓN MODERNA)            */}
      {/* ========================================================= */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => !isDeleting && setProductToDelete(null)}
          />

          <div className={`relative rounded-2xl max-w-md w-full p-6 border z-10 space-y-4 shadow-2xl transition-all ${isDarkMode ? "bg-[#141C2E] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            {/* Header Icon */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className={`p-1.5 rounded-lg ${isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title and Message */}
            <div className="space-y-1">
              <h3 className={`text-base font-bold font-sans ${titleClass}`}>
                ¿Eliminar "{productToDelete.name}"?
              </h3>
              <p className={`text-xs leading-relaxed ${subtitleClass}`}>
                Esta acción borrará el plato permanentemente del menú y dejará de estar disponible para los clientes en la tienda pública.
              </p>
            </div>

            {/* Dish Preview Card */}
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
              <div className={`w-12 h-12 rounded-lg border overflow-hidden flex-shrink-0 flex items-center justify-center p-1 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={productToDelete.image} alt={productToDelete.name} className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className={`text-xs font-bold font-sans truncate ${titleClass}`}>{productToDelete.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold text-[#E4536B]">{productToDelete.price}</span>
                  <span className={`text-[10px] ${subtitleClass}`}>• {productToDelete.category}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-colors ${isDarkMode ? "border-slate-800 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Sí, Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL CREAR / EDITAR BANNER PROMOCIONAL                    */}
      {/* ========================================================= */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => !isSavingBanner && setIsBannerModalOpen(false)}
          />

          <div className={`relative rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 border z-10 space-y-5 ${isDarkMode ? "bg-[#141C2E] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
              <div>
                <h3 className={`text-base font-bold font-sans ${titleClass}`}>
                  {editingBanner ? "Editar Banner Promocional" : "Nuevo Banner Promocional"}
                </h3>
                <p className={`text-[11px] ${subtitleClass}`}>
                  Publica promociones, combos o anuncios especiales en la portada.
                </p>
              </div>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className={`p-1.5 rounded-lg ${isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div className="space-y-1">
                <label className={`text-xs font-bold ${titleClass}`}>Título del Banner / Oferta</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Waffle Bubble Pistacho & Frambuesa"
                  value={bannerFormData.title}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${titleClass}`}>Precio Promocional</label>
                  <input
                    type="text"
                    placeholder="Ej: $12.50 o 2x1"
                    value={bannerFormData.price}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, price: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${titleClass}`}>Etiqueta / Badge</label>
                  <input
                    type="text"
                    placeholder="Ej: EDICIÓN LIMITADA ✦"
                    value={bannerFormData.badge}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, badge: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${titleClass}`}>Enlace de Acción</label>
                  <input
                    type="text"
                    placeholder="Ej: #menu o https://..."
                    value={bannerFormData.link}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, link: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${titleClass}`}>Descripción Breve</label>
                <textarea
                  rows={2}
                  placeholder="Detalla qué incluye la promoción..."
                  value={bannerFormData.subtitle}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                  className={inputClass}
                />
              </div>

              {/* Imagen del Banner Uploader */}
              <div className="space-y-1.5 pt-1">
                <label className={`text-xs font-bold ${titleClass}`}>Imagen del Banner</label>
                <DishImageUploader
                  isDarkMode={isDarkMode}
                  onUploadSuccess={(url) => {
                    setBannerFormData((prev) => ({ ...prev, image: url }));
                  }}
                />
              </div>

              {/* Apariencia y Escala de Imagen del Banner (Estilo WordPress) */}
              <div className={`p-3.5 rounded-2xl border space-y-3 ${isDarkMode ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E4536B]" />
                  <span className={`text-xs font-bold font-sans ${titleClass}`}>
                    Apariencia y Escala de Imagen del Banner (Estilo WordPress)
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className={`text-[11px] font-bold ${subtitleClass}`}>Altura del Banner</label>
                    <select
                      value={bannerFormData.imageSize}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, imageSize: e.target.value as any })}
                      className={inputClass}
                    >
                      <option value="normal">Estándar (140px)</option>
                      <option value="large">Grande (180px)</option>
                      <option value="full">Gigante / Afiche (220px)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[11px] font-bold ${subtitleClass}`}>Zoom de Imagen</label>
                    <select
                      value={bannerFormData.imageScale}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, imageScale: Number(e.target.value) })}
                      className={inputClass}
                    >
                      <option value={1.0}>100% (Normal)</option>
                      <option value={1.15}>115% (Ampliado)</option>
                      <option value={1.3}>130% (Zoom destacado)</option>
                      <option value={1.5}>150% (Zoom máximo)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[11px] font-bold ${subtitleClass}`}>Modo de Encuadre</label>
                    <select
                      value={bannerFormData.imageFit}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, imageFit: e.target.value as any })}
                      className={inputClass}
                    >
                      <option value="contain">Ajustar plato (Sin recortar)</option>
                      <option value="cover">Llenar tarjeta completa (Cover)</option>
                    </select>
                  </div>
                </div>
              </div>

              {bannerFormError && (
                <div className="p-3 bg-rose-950/80 border border-rose-800/60 text-rose-300 text-xs rounded-xl">
                  {bannerFormError}
                </div>
              )}

              <div className={`flex items-center justify-end gap-2.5 pt-3 border-t ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  disabled={isSavingBanner}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold ${isDarkMode ? "border-slate-800 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingBanner}
                  className="px-5 py-2 rounded-xl bg-[#E4536B] text-white text-xs font-bold hover:bg-[#c4455a] flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  {isSavingBanner ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...
                    </>
                  ) : editingBanner ? (
                    "Guardar Cambios"
                  ) : (
                    "Crear Banner"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
