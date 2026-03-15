import React from 'react';
import './AnimatedIcons.css';

const MapPinIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Pin Drop Fill */}
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" className="icon-fill" />
      <circle cx="12" cy="10" r="3" className="icon-fill-accent" />
      
      {/* High-Fidelity Outlines */}
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" className="icon-stroke draw-on-hover" pathLength="100" />
      <circle cx="12" cy="10" r="3" className="icon-stroke-accent draw-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default MapPinIcon;
