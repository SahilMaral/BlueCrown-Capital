import React from 'react';
import './AnimatedIcons.css';

const ShieldIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Shield Body Fill */}
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="icon-fill" />
      
      {/* High-Fidelity Outlines */}
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="icon-stroke draw-on-hover" pathLength="100" />
      <polyline points="9 11 12 14 22 4" className="icon-stroke-accent draw-on-hover" pathLength="100" style={{ opacity: 0.5 }} />
    </svg>
  </span>
);

export default ShieldIcon;
