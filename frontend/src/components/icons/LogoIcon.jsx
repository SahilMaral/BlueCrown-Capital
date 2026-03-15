import React from 'react';

const LogoIcon = ({ className = "" }) => (
  <svg 
    className={`logo-icon ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Base of the Crown */}
    <path 
      d="M4 16H20L18 19H6L4 16Z" 
      fill="#1E3A8A" 
    />
    
    {/* Center Point/Diamond */}
    <path 
      d="M12 4L16 11L12 16L8 11L12 4Z" 
      fill="url(#crown-grad-center)" 
    />
    
    {/* Left Wing */}
    <path 
      d="M3 8L8 11L7 16H4L3 8Z" 
      fill="url(#crown-grad-left)" 
    />
    
    {/* Right Wing */}
    <path 
      d="M21 8L16 11L17 16H20L21 8Z" 
      fill="url(#crown-grad-right)" 
    />

    {/* Connecting Facets for 3D look */}
    <path d="M12 4L8 11H16L12 4Z" fill="#60A5FA" fillOpacity="0.3" stroke="#2563EB" strokeWidth="0.2"/>
    <path d="M8 11L12 16L4 16L8 11Z" fill="#1D4ED8" fillOpacity="0.2" stroke="#2563EB" strokeWidth="0.2"/>
    <path d="M16 11L12 16L20 16L16 11Z" fill="#1D4ED8" fillOpacity="0.2" stroke="#2563EB" strokeWidth="0.2"/>

    {/* Top Small Diamond */}
    <path 
      d="M12 0L13.5 2.5L12 5L10.5 2.5L12 0Z" 
      fill="#60A5FA" 
    />

    <defs>
      <linearGradient id="crown-grad-center" x1="12" y1="4" x2="12" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B82F6"/>
        <stop offset="1" stopColor="#1E40AF"/>
      </linearGradient>
      <linearGradient id="crown-grad-left" x1="3" y1="8" x2="8" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB"/>
        <stop offset="1" stopColor="#1E3A8A"/>
      </linearGradient>
      <linearGradient id="crown-grad-right" x1="21" y1="8" x2="16" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB"/>
        <stop offset="1" stopColor="#1E3A8A"/>
      </linearGradient>
    </defs>
  </svg>
);

export default LogoIcon;
