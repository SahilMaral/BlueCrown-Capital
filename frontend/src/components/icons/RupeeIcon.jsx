import React from 'react';
import './AnimatedIcons.css';

const RupeeIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* High-Fidelity Outlines */}
      <path d="M7 6h10 M7 11h9.5 M10 6c6 0 6 5 0 5 M10 11l6 8" className="icon-stroke draw-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default RupeeIcon;
