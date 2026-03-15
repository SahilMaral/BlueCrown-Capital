import React from 'react';
import './AnimatedIcons.css';

const KeyIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Key Head Fill */}
      <path d="M7 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" className="icon-fill" />
      <path d="M21 7l-1.4 1.4L18 7l-1.4 1.4-1.6-1.6H11" className="icon-fill-accent" />
      
      {/* High-Fidelity Outlines */}
      <circle cx="7" cy="7" r="4" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M11 7h10M21 7l-2 2M17 7l-2 2" className="icon-stroke draw-on-hover" pathLength="100" />
      <circle cx="7" cy="7" r="1.5" className="icon-stroke-accent pop-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default KeyIcon;
