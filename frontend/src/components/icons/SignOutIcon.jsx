import React from 'react';
import './AnimatedIcons.css';

const SignOutIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" className="icon-stroke draw-on-hover" pathLength="100" />
      <polyline points="16 17 21 12 16 7" className="icon-stroke-accent draw-on-hover" pathLength="100" />
      <line x1="21" y1="12" x2="9" y2="12" className="icon-stroke-accent draw-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default SignOutIcon;
