"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Save, Loader2, ZoomIn, Maximize2, Layers, Pencil, Check, Image as ImageIcon } from "lucide-react";
import { DishImageUploader } from "./DishImageUploader";

interface LiveEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: "banner" | "product" | "hero";
  item: any | null;
  onChangeRealtime: (updatedItem: any) => void;
  onSaveSuccess: (savedItem?: any, type?: string) => void;
}

export function LiveEditorDrawer({
  isOpen,
  onClose,
  type,
  item,
  onChangeRealtime,
  onSaveSuccess,
}: LiveEditorDrawerProps) {
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      setFormData({ ...item });
    }
  }, [isOpen, item]);

  if (!isOpen || !item || !formData) return null;

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    // Realtime visual feedback on the live page!
    onChangeRealtime(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (type === "hero") {
        const payload = {
          heroImageUrl: formData.heroImageUrl,
          heroImagePublicId: formData.heroImagePublicId,
          heroImageScale: formData.heroImageScale,
          heroImageFit: formData.heroImageFit,
          heroTitle: formData.heroTitle !== undefined ? formData.heroTitle : "Una Dulce Tentación",
          heroSubtitle: formData.heroSubtitle !== undefined ? formData.heroSubtitle : "Hecha Arte",
          heroDescription: formData.heroDescription !== undefined ? formData.heroDescription : "",
        };

        const res = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Fallo al guardar portada en vivo.");
        }
        onSaveSuccess(json.data || payload, "hero");
        onClose();
        return;
      }

      const endpoint = type === "banner" ? "/api/banners" : "/api/menu";
      const method = "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Fallo al guardar cambios en vivo.");
      }

      onSaveSuccess(json.data || formData, type);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 w-full max-w-sm bg-[#FAF4EC] border-2 border-[#D49B4B]/40 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-4 bg-[#F4EBDC] border-b border-[#E5D5C0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#C81D31] text-white rounded-xl shadow-xs">
            <Pencil className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-serif text-[#2C1A14] leading-tight">
              {type === "hero" ? "Editar Portada Principal (Hero)" : type === "banner" ? "Ajustar Banner" : "Ajustar Producto"}
            </h4>
            <p className="text-[11px] text-[#D49B4B] font-medium">
              Previsualización visual en vivo
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-[#2C1A14]/60 hover:text-[#2C1A14] hover:bg-[#E5D5C0] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Controls */}
      <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
        {type === "hero" ? (
          <>
            {/* Hero Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2C1A14]">Título Principal</label>
              <input
                type="text"
                value={formData.heroTitle ?? "Una Dulce Tentación"}
                onChange={(e) => handleChange("heroTitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#E5D5C0] rounded-xl text-[#2C1A14] font-bold focus:outline-none focus:ring-2 focus:ring-[#C81D31] transition-all"
              />
            </div>

            {/* Hero Subtitle */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2C1A14]">Subtítulo Enfatizado (Serif / Rojo)</label>
              <input
                type="text"
                value={formData.heroSubtitle ?? "Hecha Arte"}
                onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#E5D5C0] rounded-xl text-[#2C1A14] font-bold focus:outline-none focus:ring-2 focus:ring-[#C81D31] transition-all"
              />
            </div>

            {/* Hero Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2C1A14]">Texto de Descripción</label>
              <textarea
                rows={2}
                value={formData.heroDescription ?? ""}
                onChange={(e) => handleChange("heroDescription", e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#E5D5C0] rounded-xl text-[#2C1A14] font-medium focus:outline-none focus:ring-2 focus:ring-[#C81D31] transition-all"
              />
            </div>

            {/* Hero Dish Photo Uploader with IA background removal */}
            <div className="space-y-2 pt-2 border-t border-[#E5D5C0]">
              <label className="text-xs font-bold text-[#2C1A14] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#C81D31]" />
                Foto del Plato (Con Eliminador de Fondo IA)
              </label>
              <DishImageUploader
                onUploadSuccess={(url, publicId) => {
                  const updated = {
                    ...formData,
                    heroImageUrl: url,
                    heroImagePublicId: publicId,
                  };
                  setFormData(updated);
                  onChangeRealtime(updated);
                }}
              />
            </div>

            {/* Zoom / Scale selector for Hero Image */}
            <div className="space-y-1.5 pt-2 border-t border-[#E5D5C0]">
              <label className="text-xs font-bold text-[#2C1A14] flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-[#C81D31]" />
                Zoom / Escala de la Foto
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { val: 1.0, label: "100%" },
                  { val: 1.15, label: "115%" },
                  { val: 1.3, label: "130%" },
                  { val: 1.5, label: "150%" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => handleChange("heroImageScale", opt.val)}
                    className={`py-1.5 text-[10px] font-bold rounded-xl border transition-all ${
                      (formData.heroImageScale || 1.0) === opt.val
                        ? "bg-[#C81D31] border-[#C81D31] text-white shadow-sm scale-[1.02]"
                        : "bg-white border-[#E5D5C0] text-[#2C1A14]/80 hover:bg-[#F4EBDC]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Fit selector for Hero Image */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C1A14] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#C81D31]" />
                Modo de Encuadre
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "contain", label: "Ajustar Plato (contain)" },
                  { id: "cover", label: "Llenar Marco (cover)" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChange("heroImageFit", opt.id)}
                    className={`py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                      (formData.heroImageFit || "contain") === opt.id
                        ? "bg-[#C81D31] border-[#C81D31] text-white shadow-sm scale-[1.02]"
                        : "bg-white border-[#E5D5C0] text-[#2C1A14]/80 hover:bg-[#F4EBDC]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Title / Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2C1A14]">
                {type === "banner" ? "Título de la Oferta" : "Nombre del Producto"}
              </label>
              <input
                type="text"
                value={type === "banner" ? (formData.title ?? "") : (formData.name ?? "")}
                onChange={(e) =>
                  handleChange(type === "banner" ? "title" : "name", e.target.value)
                }
                placeholder={type === "banner" ? "Ej: COMBO SIN CULPA" : "Ej: Crepe Goloso"}
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#E5D5C0] rounded-xl text-[#2C1A14] font-bold focus:outline-none focus:ring-2 focus:ring-[#C81D31] transition-all"
              />
            </div>

            {/* Subtitle / Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2C1A14]">
                {type === "banner" ? "Subtítulo / Descripción Corta" : "Descripción del Plato"}
              </label>
              <input
                type="text"
                value={type === "banner" ? (formData.subtitle ?? "") : (formData.description ?? "")}
                onChange={(e) =>
                  handleChange(type === "banner" ? "subtitle" : "description", e.target.value)
                }
                placeholder={type === "banner" ? "Ej: 1 Crepe + 1 Milkshake" : "Ej: Crepe relleno de Nutella"}
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#E5D5C0] rounded-xl text-[#2C1A14] font-medium focus:outline-none focus:ring-2 focus:ring-[#C81D31] transition-all"
              />
            </div>

            {/* Badge (Banner only) */}
            {type === "banner" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2C1A14]">Etiqueta Destacada (Badge)</label>
                <input
                  type="text"
                  value={formData.badge ?? ""}
                  onChange={(e) => handleChange("badge", e.target.value)}
                  placeholder="Ej: OFERTA ESPECIAL ✦"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#E5D5C0] rounded-xl text-[#2C1A14] font-medium focus:outline-none focus:ring-2 focus:ring-[#C81D31] transition-all"
                />
              </div>
            )}

            {/* Price */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2C1A14]">
                {type === "banner" ? "Precio Promocional ($)" : "Precio ($)"}
              </label>
              <input
                type="text"
                value={formData.price ?? ""}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="Ej: 6.50"
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#E5D5C0] rounded-xl text-[#2C1A14] font-bold focus:outline-none focus:ring-2 focus:ring-[#C81D31] transition-all"
              />
            </div>

            {/* Size / Height selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C1A14] flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-[#C81D31]" />
                Tamaño Visual de Tarjeta
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "normal", label: "Normal" },
                  { id: "large", label: "Grande" },
                  { id: type === "banner" ? "full" : "extra", label: type === "banner" ? "Afiche" : "Gigante" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChange("imageSize", opt.id)}
                    className={`py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                      (formData.imageSize || "normal") === opt.id
                        ? "bg-[#C81D31] border-[#C81D31] text-white shadow-sm scale-[1.02]"
                        : "bg-white border-[#E5D5C0] text-[#2C1A14]/80 hover:bg-[#F4EBDC]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom / Scale selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C1A14] flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-[#C81D31]" />
                Zoom de Imagen
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { val: 1.0, label: "100%" },
                  { val: 1.15, label: "115%" },
                  { val: 1.3, label: "130%" },
                  { val: 1.5, label: "150%" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => handleChange("imageScale", opt.val)}
                    className={`py-1.5 text-[10px] font-bold rounded-xl border transition-all ${
                      (formData.imageScale || 1.0) === opt.val
                        ? "bg-[#C81D31] border-[#C81D31] text-white shadow-sm scale-[1.02]"
                        : "bg-white border-[#E5D5C0] text-[#2C1A14]/80 hover:bg-[#F4EBDC]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5D5C0]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#2C1A14]/60 hover:text-[#2C1A14]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#C81D31] text-white text-xs font-bold rounded-full hover:bg-[#E02B43] flex items-center gap-1.5 shadow-md shadow-[#C81D31]/30 disabled:opacity-50 transition-all hover:scale-105"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
