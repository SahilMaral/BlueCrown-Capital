import React from 'react';
import './AnimatedIcons.css';

const AnalyticsIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Graph Area Fill */}
      <path d="M3 3v18h18" className="icon-fill" />
      <path d="M18 8.1L13 13L9 9l-4 4V21h13V8.1z" className="icon-fill-accent" />
      
      {/* High-Fidelity Outlines */}
      <path d="M3 3v18h18" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M18 8.1L13 13L9 9l-4 4" className="icon-stroke-accent draw-on-hover" pathLength="100" />
      <circle cx="18" cy="8.1" r="2" className="icon-stroke-accent pop-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default AnalyticsIcon;
