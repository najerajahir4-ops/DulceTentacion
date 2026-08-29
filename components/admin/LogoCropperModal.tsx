"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Sparkles, ZoomIn, Move, Upload, Loader2, Check, RotateCcw } from "lucide-react";

interface LogoCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCrop: (croppedFile: File, previewUrl: string) => Promise<void>;
  isDarkMode?: boolean;
}

export function LogoCropperModal({
  isOpen,
  onClose,
  onConfirmCrop,
  isDarkMode = false,
}: LogoCropperModalProps) {
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>("logo.png");
  const [zoom, setZoom] = useState<number>(1.0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedImageSrc(null);
      setZoom(1.0);
      setPosition({ x: 0, y: 0 });
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string);
      setZoom(1.0);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedImageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1.0);
    setPosition({ x: 0, y: 0 });
  };

  const handleCropAndSave = async () => {
    if (!selectedImageSrc || !imageRef.current) return;
    setIsUploading(true);
    setError(null);

    try {
      // Use HTML5 Canvas to crop the circle area
      const canvas = document.createElement("canvas");
      const canvasSize = 500; // Output canvas size 500x500
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("No se pudo iniciar el canvas.");

      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const img = imageRef.current;
      const viewportSize = 240; // Size of circular viewport in modal (px)
      const scaleFactor = canvasSize / viewportSize;

      // Calculate base fitted dimensions inside viewport (object-contain)
      const naturalW = img.naturalWidth || 500;
      const naturalH = img.naturalHeight || 500;
      const aspectRatio = naturalW / naturalH;

      let baseW = viewportSize;
      let baseH = viewportSize;

      if (aspectRatio > 1) {
        baseH = viewportSize / aspectRatio;
      } else {
        baseW = viewportSize * aspectRatio;
      }

      // Scaled dimensions on canvas
      const drawWidth = baseW * zoom * scaleFactor;
      const drawHeight = baseH * zoom * scaleFactor;

      // Calculate center offset on canvas
      const centerX = canvasSize / 2 + position.x * scaleFactor;
      const centerY = canvasSize / 2 + position.y * scaleFactor;

      ctx.drawImage(
        img,
        centerX - drawWidth / 2,
        centerY - drawHeight / 2,
        drawWidth,
        drawHeight
      );

      // Convert canvas to Blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError("Error al procesar el recorte.");
          setIsUploading(false);
          return;
        }

        const croppedFile = new File([blob], `logo_${Date.now()}.png`, {
          type: "image/png",
        });

        const previewUrl = URL.createObjectURL(blob);
        await onConfirmCrop(croppedFile, previewUrl);
        setIsUploading(false);
        onClose();
      }, "image/png");
    } catch (err: any) {
      setError(err.message || "Error al procesar el logo.");
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border font-sans ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#C81D31]/15 text-[#C81D31] flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif leading-tight">
                Cambiar Logo de la Marca
              </h3>
              <p className={`text-[11px] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Ajusta y mueve la foto dentro del visor circular
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${
              isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-200 text-slate-600"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {!selectedImageSrc ? (
            /* Upload State */
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950/50 hover:border-[#C81D31] hover:bg-slate-900"
                  : "border-slate-300 bg-slate-50 hover:border-[#C81D31] hover:bg-rose-50/50"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#C81D31]/10 text-[#C81D31] flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold mb-1">
                Selecciona la nueva foto de tu Logo
              </h4>
              <p className={`text-[11px] mb-3 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                PNG o JPG (Se recortará en círculo)
              </p>
              <button
                type="button"
                className="px-4 py-1.5 bg-[#C81D31] text-white text-xs font-bold font-sans rounded-xl shadow-xs hover:bg-[#A31627] transition-all"
              >
                Buscar Imagen
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            /* Interactive Circular Cropper State */
            <div className="space-y-4">
              {/* Circular Viewport */}
              <div className="flex justify-center">
                <div
                  ref={viewportRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="relative w-[240px] h-[240px] rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-600 shadow-2xl cursor-grab active:cursor-grabbing bg-white select-none group flex items-center justify-center p-2"
                >
                  {/* Image fitted inside viewport (object-contain base) */}
                  <img
                    ref={imageRef}
                    src={selectedImageSrc}
                    alt="Recorte Logo"
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none transition-transform duration-75"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    }}
                  />

                  {/* Circular Overlay Help Indicator */}
                  <div className="absolute inset-0 border-2 border-dashed border-[#C81D31]/40 rounded-full pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <Move className="w-3 h-3" /> Arrastra para mover
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-3 px-2">
                {/* Zoom slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5 text-[#C81D31]" />
                      Zoom / Escala
                    </span>
                    <span className="text-[#C81D31]">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-[#C81D31] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleReset}
                    className={`text-[11px] font-bold flex items-center gap-1 transition-colors ${
                      isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Centrar Imagen (100%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImageSrc(null)}
                    className="text-[11px] font-bold text-[#C81D31] hover:underline"
                  >
                    Cambiar Foto
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {selectedImageSrc && (
          <div
            className={`px-5 py-3.5 border-t flex items-center justify-end gap-2 ${
              isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-bold transition-colors ${
                isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isUploading}
              onClick={handleCropAndSave}
              className="px-5 py-2 bg-[#C81D31] text-white text-xs font-bold font-sans rounded-xl shadow-xs hover:bg-[#A31627] flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" /> Aplicar y Guardar Logo
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
