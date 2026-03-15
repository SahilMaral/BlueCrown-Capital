import React from 'react';
import './AnimatedIcons.css';

const ClientIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Group Fill */}
      <circle cx="12" cy="7" r="4" className="icon-fill" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87" className="icon-fill-accent" />
      <path d="M4 21v-2a4 4 0 0 1 3-3.87" className="icon-fill-accent" />
      
      {/* High-Fidelity Outlines */}
      <circle cx="12" cy="7" r="4" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" className="icon-stroke draw-on-hover" pathLength="100" />
      <circle cx="6" cy="11" r="3" className="icon-stroke-accent pop-on-hover" pathLength="100" />
      <circle cx="18" cy="11" r="3" className="icon-stroke-accent pop-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default ClientIcon;
