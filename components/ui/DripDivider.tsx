"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface DripDividerProps {
  color?: string;
  position?: "top" | "bottom" | "overlap-top" | "overlap-bottom";
  opacity?: number;
}

export function DripDivider({ color = "var(--background)", position = "bottom", opacity = 1 }: DripDividerProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Reduced motion check
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    gsap.to(".drip-path", {
      scrollTrigger: {
        trigger: container.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
      scaleY: 1.5,
      transformOrigin: position.includes("overlap") ? "bottom" : "top",
      ease: "power1.inOut"
    });
  }, { scope: container });

  // If we are overlapping to mask a complex background, we use the inverted path (solid at bottom, wavy at top)
  const isOverlap = position.includes("overlap");
  const pathData = isOverlap
    ? "M0,120V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120Z"
    : "M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z";

  return (
    <div 
      ref={container} 
      className={`drip-divider-container drip-divider-${position}`}
      style={{ opacity }}
    >
      <svg 
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none"
        fill={color}
      >
        <path 
          className="drip-path"
          d={pathData}
        />
      </svg>
    </div>
  );
}
