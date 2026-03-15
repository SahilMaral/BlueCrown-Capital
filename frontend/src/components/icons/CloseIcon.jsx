import React from 'react';
import './AnimatedIcons.css';

const CloseIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Background Circle Fill for Depth */}
      <circle cx="12" cy="12" r="10" className="icon-fill" style={{ opacity: 0.05 }} />
      
      {/* High-Fidelity Outlines */}
      <line x1="18" y1="6" x2="6" y2="18" className="icon-stroke draw-on-hover" pathLength="100" />
      <line x1="6" y1="6" x2="18" y2="18" className="icon-stroke-accent draw-on-hover" pathLength="100" style={{ animationDelay: '0.1s' }} />
    </svg>
  </span>
);

export default CloseIcon;
