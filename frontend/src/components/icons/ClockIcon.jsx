import React from 'react';
import './AnimatedIcons.css';

const ClockIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Clock Face Fill */}
      <circle cx="12" cy="12" r="10" className="icon-fill" />
      
      {/* High-Fidelity Outlines */}
      <circle cx="12" cy="12" r="10" className="icon-stroke draw-on-hover" pathLength="100" />
      <polyline points="12 6 12 12 16 14" className="icon-stroke-accent draw-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default ClockIcon;
