import React from 'react';
import './AnimatedIcons.css';

const PlusCircleIcon = ({ className = "", size = 24 }) => (
  <span className={`animated-icon breathe ${className}`} style={{ width: size, height: size }}>
    <svg viewBox="0 0 24 24" width={size} height={size}>
      {/* Circle Fill */}
      <circle cx="12" cy="12" r="10" className="icon-fill" />
      
      {/* High-Fidelity Outlines */}
      <circle cx="12" cy="12" r="10" className="icon-stroke draw-on-hover" pathLength="100" />
      <line x1="12" y1="8" x2="12" y2="16" className="icon-stroke-accent draw-on-hover" pathLength="100" />
      <line x1="8" y1="12" x2="16" y2="12" className="icon-stroke-accent draw-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default PlusCircleIcon;
