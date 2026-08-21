import React from "react";

interface GammyLogoProps {
  className?: string;
  size?: number;
}

export const GammyLogo: React.FC<GammyLogoProps> = ({ className = "", size = 32 }) => {
  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-md shadow-blue-600/25 group-hover:scale-105 transition-all duration-300 ring-1 ring-white/30 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Background Royal Blue Gradient */}
          <linearGradient id="gammyBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0047FF" />
            <stop offset="45%" stopColor="#0035E6" />
            <stop offset="100%" stopColor="#001B99" />
          </linearGradient>

          {/* White Front Facet */}
          <linearGradient id="whiteFacet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F2F6FF" />
            <stop offset="100%" stopColor="#E1EBFF" />
          </linearGradient>

          {/* Left Dark Blue Facet */}
          <linearGradient id="leftFacet" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0D51FF" />
            <stop offset="100%" stopColor="#0033BD" />
          </linearGradient>

          {/* Right Light Blue Facet */}
          <linearGradient id="rightFacet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3882FF" />
            <stop offset="100%" stopColor="#1651EA" />
          </linearGradient>

          {/* Inner Shadow Wall */}
          <linearGradient id="innerWall" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#002BB5" />
            <stop offset="100%" stopColor="#001880" />
          </linearGradient>

          {/* Drop Shadow Filter */}
          <filter id="dropShadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000E50" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Outer Background Container */}
        <rect width="200" height="200" rx="44" fill="url(#gammyBgGrad)" />

        {/* Soft Ambient Inner Glow Edge */}
        <rect x="2" y="2" width="196" height="196" rx="42" stroke="white" strokeOpacity="0.25" strokeWidth="2.5" fill="none" />

        {/* 3D Isometric "G" Cube Object */}
        <g filter="url(#dropShadow)" transform="translate(100, 100)">
          {/* Outer Left Spine (Deep Blue 3D Depth) */}
          <path
            d="M -54,-14 L -8,-41 L -8,44 L -54,70 Z"
            fill="url(#leftFacet)"
          />
          
          {/* Outer Bottom Right Base (Electric Blue 3D Depth) */}
          <path
            d="M -54,70 L 2,102 L 52,72 L -4,40 Z"
            fill="url(#rightFacet)"
          />

          {/* Outer Right Spine (Light Blue 3D Depth) */}
          <path
            d="M 52,72 L 52,22 L 2,52 L 2,102 Z"
            fill="url(#rightFacet)"
          />

          {/* Inner Channel Walls */}
          <path
            d="M 52,22 L 12,46 L 12,18 L 52,-6 Z"
            fill="url(#innerWall)"
          />
          <path
            d="M 12,18 L 12,46 L -16,30 L -16,2 Z"
            fill="url(#innerWall)"
          />

          {/* White Front Face forming the 3D 'G' Letter */}
          {/* Top Bar of G */}
          <path
            d="M -54,-14 L -8,-41 L 38,-14 L -8,12 Z"
            fill="url(#whiteFacet)"
          />
          {/* Left Vertical Spine of G */}
          <path
            d="M -54,-14 L -8,12 L -8,44 L -54,18 Z"
            fill="url(#whiteFacet)"
          />
          {/* Bottom Bar of G */}
          <path
            d="M -54,18 L -8,44 L 52,10 L 6,-16 Z"
            fill="url(#whiteFacet)"
          />
          {/* Right Upward Hook of G */}
          <path
            d="M 52,10 L 6,-16 L 6,-38 L 52,-12 Z"
            fill="url(#whiteFacet)"
          />
          {/* Inward Horizontal Bar of G */}
          <path
            d="M 6,-38 L 52,-12 L 26,2 L -20,-24 Z"
            fill="url(#whiteFacet)"
          />

          {/* Highlights & Gloss Overlay */}
          <path
            d="M -54,-14 L -8,-41 L 38,-14"
            stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"
          />
          <path
            d="M -54,-14 L -54,18 L -54,70"
            stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6"
          />
          <path
            d="M 52,-12 L 52,10 L 52,72"
            stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"
          />
        </g>
      </svg>
    </div>
  );
};
