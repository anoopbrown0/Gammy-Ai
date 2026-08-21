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
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Background Squircle Gradient */}
          <radialGradient id="gammyAppBgGrad" cx="50%" cy="30%" r="70%" fx="50%" fy="15%">
            <stop offset="0%" stopColor="#0A74FF" />
            <stop offset="45%" stopColor="#0051E8" />
            <stop offset="85%" stopColor="#0035B8" />
            <stop offset="100%" stopColor="#00258A" />
          </radialGradient>

          {/* Glossy Dome Highlight Overlay */}
          <linearGradient id="gammyAppGlossGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="70%" stopColor="#0047E0" stopOpacity="0" />
            <stop offset="100%" stopColor="#001866" stopOpacity="0.3" />
          </linearGradient>

          {/* Outer Rim Glow */}
          <linearGradient id="gammyAppRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#70B4FF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0A66FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#002699" stopOpacity="0.6" />
          </linearGradient>

          {/* Top White Frosted Facets */}
          <linearGradient id="gammyAppTopRoofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F0F6FF" />
            <stop offset="100%" stopColor="#D6E5FA" />
          </linearGradient>

          <linearGradient id="gammyAppTopFlapGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#E2EEFC" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="gammyAppTopFrontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E5F0FC" />
          </linearGradient>

          {/* Bottom Blue Box Facets */}
          <linearGradient id="gammyAppBotLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0062E6" />
            <stop offset="100%" stopColor="#0048B8" />
          </linearGradient>

          <linearGradient id="gammyAppBotRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E88FF" />
            <stop offset="100%" stopColor="#0066F0" />
          </linearGradient>

          <linearGradient id="gammyAppBotFloorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0041A8" />
            <stop offset="100%" stopColor="#002773" />
          </linearGradient>

          <linearGradient id="gammyAppBotInnerPanelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0052CC" />
            <stop offset="100%" stopColor="#003594" />
          </linearGradient>

          {/* Drop Shadow Filter */}
          <filter id="gammyAppCubeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#001552" floodOpacity="0.55" />
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#002A9E" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Squircle Base */}
        <rect x="16" y="16" width="480" height="480" rx="140" fill="url(#gammyAppBgGrad)" />

        {/* Glass Highlight Overlay on Squircle */}
        <rect x="16" y="16" width="480" height="480" rx="140" fill="url(#gammyAppGlossGrad)" />

        {/* Outer Rim Stroke */}
        <rect x="17" y="17" width="478" height="478" rx="139" stroke="url(#gammyAppRimGrad)" strokeWidth="3.5" fill="none" />

        {/* Inner Soft Bevel Glow */}
        <rect x="24" y="24" width="464" height="464" rx="132" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="1.5" fill="none" />

        {/* Central Isometric 3D Gammy Box */}
        <g filter="url(#gammyAppCubeShadow)">
          {/* Inside Floor */}
          <path d="M 256,316 L 376,246 L 256,176 L 136,246 Z" fill="url(#gammyAppBotFloorGrad)" />
          
          {/* Inside Back Walls */}
          <path d="M 136,246 L 256,176 L 256,236 L 136,306 Z" fill="url(#gammyAppBotInnerPanelGrad)" opacity="0.8" />
          <path d="M 376,246 L 256,176 L 256,236 L 376,306 Z" fill="url(#gammyAppBotInnerPanelGrad)" opacity="0.6" />

          {/* Lower Left Outer Face */}
          <path d="M 136,246 L 256,316 L 256,436 L 136,366 Z" fill="url(#gammyAppBotLeftGrad)" />

          {/* Lower Right Outer Face */}
          <path d="M 256,316 L 376,246 L 376,366 L 256,436 Z" fill="url(#gammyAppBotRightGrad)" />

          {/* Inner Fold Accent on Lower Left */}
          <path d="M 144,358 L 256,424 L 256,322 L 144,256 Z" fill="#0050D6" opacity="0.35" />
          <path d="M 148,354 L 256,322 L 256,420 Z" fill="#003B9E" opacity="0.45" />

          {/* Upper Frosted White Crystal Box Structure */}
          <path d="M 136,176 L 256,246 L 256,316 L 136,246 Z" fill="url(#gammyAppTopFrontGrad)" fillOpacity="0.96" />
          <path d="M 256,246 L 376,176 L 376,246 L 256,316 Z" fill="url(#gammyAppTopFrontGrad)" fillOpacity="0.92" />

          {/* Top Isometric Roof Diamond */}
          <path d="M 256,106 L 376,176 L 256,246 L 136,176 Z" fill="url(#gammyAppTopRoofGrad)" />

          {/* Isometric Box Top Flap */}
          <path d="M 176,176 L 276,118 L 346,158 L 246,216 Z" fill="url(#gammyAppTopFlapGrad)" />
          <path d="M 176,176 L 246,216 L 216,234 L 146,194 Z" fill="#FFFFFF" fillOpacity="0.75" />

          {/* Crisp Specular Highlights and Edge Lines */}
          <path d="M 256,106 L 376,176" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <path d="M 256,106 L 136,176" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          
          {/* Top Flap Glint Accent */}
          <path d="M 326,146 L 350,160" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />

          {/* Center Vertical Seam */}
          <path d="M 256,106 L 256,246" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
          <path d="M 136,176 L 256,246 L 376,176" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
          
          {/* Horizontal White-to-Blue Transition Seam */}
          <path d="M 136,246 L 256,316 L 376,246" stroke="#D8E8FF" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
          
          {/* Bottom Vertical Spine Highlight */}
          <path d="M 256,316 L 256,436" stroke="#52A5FF" strokeWidth="2" opacity="0.7" />
          <path d="M 376,246 L 376,366" stroke="#75B8FF" strokeWidth="1.5" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
};

