import React from 'react';
import './AnimatedIcons.css';

const RupeeIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Symbol Background Layer (Static) */}
      <circle cx="12" cy="12" r="9" className="icon-fill-bg" />
      
      {/* Interactive Fill Layer (Breathes on hover) */}
      <circle cx="12" cy="12" r="9" className="icon-fill hover-breathe" />
      
      {/* High-Fidelity Outlines */}
      <circle cx="12" cy="12" r="9" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M12 1L12 23" className="icon-stroke-accent draw-on-hover" pathLength="100" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" className="icon-stroke-accent draw-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default RupeeIcon;
