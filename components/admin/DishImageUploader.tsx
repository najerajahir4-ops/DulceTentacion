"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, Sparkles } from "lucide-react";

interface DishImageUploaderProps {
  onUploadSuccess?: (url: string, publicId: string) => void;
  folderName?: string;
  isDarkMode?: boolean;
}

export function DishImageUploader({ onUploadSuccess, isDarkMode = false }: DishImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [removeBg, setRemoveBg] = useState(true);
  const [uploadedData, setUploadedData] = useState<{
    url: string;
    public_id: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFileToCloudinary = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (removeBg) {
        formData.append("removeBg", "true");
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Fallo al procesar la imagen.");
      }

      setUploadedData(data.data);
      setPreviewUrl(data.data.url);
      if (onUploadSuccess) {
        onUploadSuccess(data.data.url, data.data.public_id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Ocurrió un error inesperado al subir la foto.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous states
    setErrorMessage(null);
    setUploadedData(null);

    // Client-side validation: 10 MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("La imagen supera el límite de 10 MB.");
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Client-side validation: MIME types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage("Formato no válido. Usa JPG, PNG, WebP o HEIC.");
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    // Automatically upload on selection
    uploadFileToCloudinary(file);
  };

  return (
    <div
      className={`w-full max-w-xl mx-auto p-4 rounded-2xl border shadow-xs space-y-3 transition-colors ${
        isDarkMode
          ? "bg-slate-900/90 border-slate-800 text-slate-100"
          : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      <div className="space-y-0.5 text-center">
        <h3
          className={`text-xs font-bold font-sans flex items-center justify-center gap-1.5 ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          <ImageIcon className="w-4 h-4 text-[#E4536B]" />
          Foto del Plato
        </h3>
        <p className={`text-[11px] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          Selecciona una foto. Se optimizará automáticamente en alta definición.
        </p>
      </div>

      {/* Recuadro / Checkbox: Quitar fondo automáticamente */}
      <div
        className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
          isDarkMode ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
        }`}
      >
        <label className="flex items-center gap-2.5 text-xs font-bold cursor-pointer select-none">
          <input
            type="checkbox"
            checked={removeBg}
            onChange={(e) => setRemoveBg(e.target.checked)}
            className="w-4 h-4 rounded text-[#E4536B] focus:ring-[#E4536B] border-slate-300 cursor-pointer"
          />
          <Sparkles className="w-4 h-4 text-[#E4536B]" />
          <span className={isDarkMode ? "text-slate-200" : "text-slate-800"}>
            Quitar fondo automáticamente (PNG transparente)
          </span>
        </label>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
            removeBg
              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
              : isDarkMode
              ? "bg-slate-800 text-slate-400"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          {removeBg ? "IA Activa" : "Desactivado"}
        </span>
      </div>

      {/* Upload Dropzone / Trigger */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer ${
          isUploading
            ? "border-[#E4536B]/40 bg-[#E4536B]/5 opacity-80 cursor-wait"
            : isDarkMode
            ? "border-slate-800 bg-slate-950/60 hover:border-[#E4536B] hover:bg-slate-950"
            : "border-slate-200 bg-slate-50 hover:border-[#E4536B] hover:bg-slate-100/80"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/jpg"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {previewUrl ? (
          <div
            className={`relative w-full max-w-md min-h-[160px] max-h-[280px] rounded-xl overflow-hidden shadow-xs flex items-center justify-center p-2 transition-all ${
              isDarkMode 
                ? "bg-slate-950/80 border border-slate-800" 
                : "bg-slate-100/80 border border-slate-200"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={previewUrl} 
              alt="Previsualización" 
              className="w-auto h-auto max-w-full max-h-[250px] object-contain rounded-lg drop-shadow-md" 
            />
            {isUploading && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 p-3 text-center z-10">
                <Loader2 className="w-7 h-7 animate-spin text-[#E4536B]" />
                <span className="text-xs font-bold tracking-wide">
                  {removeBg ? "Quitando fondo con IA..." : "Optimizando e instalando..."}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-2 py-2">
            <div className="w-10 h-10 rounded-full bg-[#E4536B]/10 flex items-center justify-center text-[#E4536B]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-xs font-bold ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
                Haz clic o arrastra para seleccionar la foto del plato
              </p>
              <p className={`text-[10px] mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                PNG, JPG, WebP o HEIC
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Auto-uploading Status indicator */}
      {isUploading && (
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#E4536B]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>
            {removeBg ? "Eliminando fondo con Inteligencia Artificial..." : "Optimizando foto..."}
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 bg-rose-950/80 border border-rose-800/60 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {uploadedData && !isUploading && (
        <div
          className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 ${
            isDarkMode
              ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-xs font-bold">
            {removeBg
              ? "Foto sin fondo cargada correctamente (PNG Transparente)"
              : "Foto cargada y optimizada correctamente"}
          </span>
        </div>
      )}
    </div>
  );
}
