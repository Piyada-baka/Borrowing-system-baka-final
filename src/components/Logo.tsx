import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-10 h-10', size }) => {
  return (
    <div 
      className={`inline-flex items-center justify-center shrink-0 ${className}`} 
      style={size ? { width: size, height: size } : undefined}
    >
      <svg 
        viewBox="0 0 512 512" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
      >
        {/* Left Spiral Ring */}
        <path d="M 175 45 C 130 45, 125 115, 170 120 C 190 122, 205 105, 200 85 C 195 65, 185 45, 175 45 Z" fill="#3D3A68"/>
        <circle cx="170" cy="80" r="18" fill="#FDFCF9"/>
        
        {/* Right Spiral Ring */}
        <path d="M 335 45 C 290 45, 285 115, 330 120 C 350 122, 365 105, 360 85 C 355 65, 345 45, 335 45 Z" fill="#3D3A68"/>
        <circle cx="330" cy="80" r="18" fill="#FDFCF9"/>

        {/* Back Curled Pages */}
        <path d="M 125 460 L 90 445 L 140 135 L 435 155 L 405 465 L 125 460 Z" fill="#DDD9E4"/>
        <path d="M 105 435 L 75 420 L 135 130 L 440 150 L 415 440 L 105 435 Z" fill="#ECE9F0"/>

        {/* Front Calendar Card Body */}
        <path 
          d="M 140 115 L 445 138 C 445 138, 470 330, 415 490 C 320 480, 200 480, 65 410 C 105 330, 130 200, 140 115 Z" 
          fill="#FFFFFF"
          stroke="#EAE6EE" 
          strokeWidth="4"
        />

        {/* Calendar Pink Header Band with angle */}
        <path d="M 140 115 L 445 138 L 435 210 L 132 188 Z" fill="#FC82A8"/>

        {/* Calendar Page Soft Accent Curve */}
        <path d="M 132 188 L 435 210 L 420 270 C 360 260, 250 245, 130 235 Z" fill="#FFF5F8" opacity="0.6"/>

        {/* Cherry Blossom (Sakura / Hanami) Flower */}
        <g transform="translate(255, 335)">
          {/* Petal Top */}
          <path d="M 0 -8 C -22 -25, -28 -75, -5 -85 C 10 -90, 25 -70, 15 -25 Z" fill="#FFB7CC"/>
          <path d="M 0 -8 C -15 -25, -18 -65, -2 -75 C 6 -80, 15 -60, 10 -20 Z" fill="#FFA5BE" opacity="0.6"/>

          {/* Petal Top-Right */}
          <path d="M 5 -2 C 20 -15, 75 -25, 82 2 C 86 18, 62 30, 22 15 Z" fill="#FFB7CC"/>
          <path d="M 5 -2 C 18 -10, 65 -18, 70 2 C 74 12, 52 22, 18 10 Z" fill="#FFA5BE" opacity="0.6"/>

          {/* Petal Bottom-Right */}
          <path d="M 4 5 C 18 15, 55 60, 40 78 C 28 88, 5 72, -5 22 Z" fill="#FFB7CC"/>
          <path d="M 4 5 C 14 12, 45 50, 32 65 C 22 72, 3 60, -3 18 Z" fill="#FFA5BE" opacity="0.6"/>

          {/* Petal Bottom-Left */}
          <path d="M -5 5 C -15 20, -55 58, -72 40 C -82 28, -65 2, -22 -2 Z" fill="#FFB7CC"/>
          <path d="M -5 5 C -12 15, -45 46, -60 32 C -68 22, -52 2, -18 -1 Z" fill="#FFA5BE" opacity="0.6"/>

          {/* Petal Top-Left */}
          <path d="M -6 -4 C -22 -12, -72 -2, -68 -22 C -65 -35, -40 -38, -12 -18 Z" fill="#FFB7CC"/>
          <path d="M -6 -4 C -18 -10, -58 -2, -55 -18 C -52 -28, -32 -30, -10 -14 Z" fill="#FFA5BE" opacity="0.6"/>

          {/* Center Pistil & Stamens */}
          <path d="M 0 0 C 2 -15, 6 -32, 8 -42" stroke="#3D3A68" strokeWidth="4.5" strokeLinecap="round"/>
          <path d="M 0 0 C -12 -8, -25 -18, -32 -24" stroke="#3D3A68" strokeWidth="4" strokeLinecap="round"/>
          <path d="M 0 0 C 8 8, 18 18, 25 24" stroke="#3D3A68" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="8" cy="-44" r="3" fill="#3D3A68"/>
          <circle cx="-34" cy="-25" r="2.5" fill="#3D3A68"/>
          <circle cx="27" cy="25" r="2.5" fill="#3D3A68"/>
        </g>

        {/* Page Curl Shadow */}
        <path d="M 65 410 C 130 445, 230 475, 415 490 C 350 495, 220 485, 75 425 Z" fill="#E6E0ED"/>
      </svg>
    </div>
  );
};
