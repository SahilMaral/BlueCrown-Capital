import React from 'react';
import './AnimatedIcons.css';

const CompanyIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Factory/Office Fill */}
      <path d="M3 21h18" className="icon-fill" />
      <path d="M3 7V21h18V7l-4-3-5 3-4-3-5 3z" className="icon-fill-accent" />
      
      {/* High-Fidelity Outlines */}
      <path d="M3 21h18" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M3 7V21h18V7l-4-3-5 3-4-3-5 3z" className="icon-stroke draw-on-hover" pathLength="100" />
      <rect x="7" y="10" width="2" height="2" className="icon-stroke-accent pop-on-hover" pathLength="100" />
      <rect x="11" y="10" width="2" height="2" className="icon-stroke-accent pop-on-hover" style={{ animationDelay: '0.1s' }} pathLength="100" />
      <rect x="15" y="10" width="2" height="2" className="icon-stroke-accent pop-on-hover" style={{ animationDelay: '0.2s' }} pathLength="100" />
    </svg>
  </span>
);

export default CompanyIcon;
