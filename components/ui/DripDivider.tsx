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
  position?: "top" | "bottom" | "overlap-top" | "overlap-bottom" | "bottom-inside";
  opacity?: number;
}

export function DripDivider({ color = "var(--background)", position = "bottom", opacity = 1 }: DripDividerProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    gsap.to(".drip-path", {
      scrollTrigger: {
        trigger: container.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
      scaleY: position === "bottom-inside" || position === "overlap-top" ? 0.6 : 1.5,
      transformOrigin: position === "overlap-top" ? "bottom" : "top",
      ease: "power1.inOut"
    });
  }, { scope: container });

  const pathData = "M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z";

  return (
    <div 
      ref={container} 
      className={`absolute left-0 w-full overflow-hidden leading-none z-10 ${
        position === 'bottom-inside' ? '-bottom-[1px] rotate-180' : 
        position === 'bottom' ? 'bottom-[1px] translate-y-full' :
        position === 'top' ? 'top-[1px] -translate-y-full rotate-180' :
        position === 'overlap-top' ? 'top-[1px] -translate-y-full' :
        position === 'overlap-bottom' ? 'bottom-[1px] translate-y-full' : ''
      }`}
      style={{ opacity }}
    >
      <svg 
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none"
        fill={color}
        className="block w-[calc(100%+1.3px)] h-[clamp(60px,10vw,120px)]"
      >
        <path 
          className="drip-path"
          d={pathData}
        />
      </svg>
    </div>
  );
}

export function MeltingCreamDivider({
  color = "#F4EBDC",
  flip = false,
  height = "h-12 sm:h-20"
}: {
  color?: string;
  flip?: boolean;
  height?: string;
}) {
  return (
    <div className={`absolute left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none ${
      flip ? "top-0 -translate-y-px rotate-180" : "bottom-0 translate-y-px"
    }`}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className={`relative block w-full ${height}`}
        style={{ fill: color }}
      >
        <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,60 L1200,120 L0,120 Z" />
      </svg>
    </div>
  );
}
