"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { optimizeCloudinaryUrl } from "@/lib/image-utils";

interface GourmetPreloaderProps {
  logoUrl?: string;
  imageUrls: string[];
  onComplete: () => void;
}

export function GourmetPreloader({ logoUrl, imageUrls, onComplete }: GourmetPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const displayLogoUrl = logoUrl ? optimizeCloudinaryUrl(logoUrl, 300) : "/images/logo.webp";

  useEffect(() => {
    // Filter valid image URLs to preload
    const validUrls = Array.from(
      new Set(
        [logoUrl, ...imageUrls].filter(
          (url): url is string => Boolean(url) && typeof url === "string" && (url.startsWith("http") || url.startsWith("data:"))
        )
      )
    ).map((url) => optimizeCloudinaryUrl(url, 600));

    let loadedCount = 0;
    const total = validUrls.length;

    // Smooth linear progress increment
    const intervalTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) return prev + Math.floor(Math.random() * 8) + 4;
        return prev;
      });
    }, 90);

    const finishPreloader = () => {
      clearInterval(intervalTimer);
      setProgress(100);
      setTimeout(() => {
        setIsFinished(true);
        setTimeout(onComplete, 400);
      }, 250);
    };

    if (total === 0) {
      setTimeout(finishPreloader, 1000);
      return () => clearInterval(intervalTimer);
    }

    // Safety fallback timer (max 1.6 seconds)
    const safetyTimer = setTimeout(finishPreloader, 1600);

    validUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = img.onerror = () => {
        loadedCount++;
        const targetPct = Math.round((loadedCount / total) * 100);
        setProgress((prev) => Math.max(prev, targetPct));

        if (loadedCount >= total) {
          clearTimeout(safetyTimer);
          finishPreloader();
        }
      };
    });

    return () => {
      clearInterval(intervalTimer);
      clearTimeout(safetyTimer);
    };
  }, [logoUrl, imageUrls, onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAF4EC] px-6 select-none"
          style={{
            background: "radial-gradient(circle at 50% 45%, #F5E6D3 0%, #FAF4EC 75%)",
          }}
        >
          {/* Minimalist Centered Grid Reticle */}
          <div className="flex flex-col items-center max-w-xs w-full text-center space-y-8">
            
            {/* Pure Silhouette Logo Breathing Directly on Background */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayLogoUrl}
                alt=""
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Single Loading Message */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-1"
            >
              <h2 className="text-lg sm:text-xl font-serif font-medium text-[#2C1A14] tracking-tight">
                Preparando tus Tentaciones...
              </h2>
            </motion.div>

            {/* Sleek 2px Linear Progress Bar (Warm Terracotta Gold Accent) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="w-44 h-[2px] bg-[#E5D5C0] rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-[#D49B4B] rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              />
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
