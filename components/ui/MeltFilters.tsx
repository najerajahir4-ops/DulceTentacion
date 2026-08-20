export function MeltFilters() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
      <defs>
        {/* Dynamic filter for cards (GSAP will animate the scale attribute) */}
        <filter id="melt-dynamic" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" result="warp" />
          <feDisplacementMap 
            id="melt-displacement" 
            in="SourceGraphic" 
            in2="warp" 
            scale="0" 
            xChannelSelector="R" 
            yChannelSelector="G" 
          />
        </filter>

        {/* Slow loop filter for Hero title */}
        <filter id="melt-hero" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence id="hero-turbulence" type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        
        {/* Subtle hover filter for icons */}
        <filter id="melt-hover" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" result="warp" />
          <feDisplacementMap className="hover-displacement" in="SourceGraphic" in2="warp" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
