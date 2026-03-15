import React from 'react';
import './AnimatedIcons.css';

const InvestmentIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Chart Fill */}
      <circle cx="12" cy="12" r="9" className="icon-fill" />
      <circle cx="12" cy="12" r="3" className="icon-fill-accent" />
      
      {/* High-Fidelity Outlines */}
      <circle cx="12" cy="12" r="9" className="icon-stroke draw-on-hover" pathLength="100" />
      <circle cx="12" cy="12" r="3" className="icon-stroke-accent pop-on-hover" pathLength="100" />
      <path d="M12 3v6" className="icon-stroke-accent draw-on-hover" pathLength="100" />
      <path d="M21 12h-6" className="icon-stroke-accent draw-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default InvestmentIcon;
