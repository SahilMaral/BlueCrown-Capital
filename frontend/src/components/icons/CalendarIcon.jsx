import React from 'react';
import './AnimatedIcons.css';

const CalendarIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Calendar Grid Fill */}
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" className="icon-fill" />
      
      {/* High-Fidelity Outlines */}
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" className="icon-stroke draw-on-hover" pathLength="100" />
      <line x1="16" y1="2" x2="16" y2="6" className="icon-stroke-accent draw-on-hover" pathLength="100" />
      <line x1="8" y1="2" x2="8" y2="6" className="icon-stroke-accent draw-on-hover" pathLength="100" />
      <line x1="3" y1="10" x2="21" y2="10" className="icon-stroke draw-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default CalendarIcon;
