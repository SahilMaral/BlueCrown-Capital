import React from 'react';
import './AnimatedIcons.css';

const LoanIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Document Fill */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" className="icon-fill" />
      <path d="M14 2L20 8" className="icon-fill-accent" />
      
      {/* High-Fidelity Outlines */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M14 2v6h6" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M8 13h8" className="icon-stroke-accent draw-on-hover" pathLength="100" />
      <path d="M8 17h8" className="icon-stroke-accent draw-on-hover" style={{ animationDelay: '0.1s' }} pathLength="100" />
    </svg>
  </span>
);

export default LoanIcon;
