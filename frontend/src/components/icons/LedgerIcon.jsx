import React from 'react';
import './AnimatedIcons.css';

const LedgerIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Ledger Body Fill */}
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" className="icon-fill" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" className="icon-fill-accent" />
      
      {/* High-Fidelity Outlines */}
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" className="icon-stroke-accent draw-on-hover" pathLength="100" />
      <path d="M8 7h8" className="icon-stroke-accent draw-on-hover" pathLength="100" />
      <path d="M8 11h8" className="icon-stroke-accent draw-on-hover" style={{ animationDelay: '0.1s' }} pathLength="100" />
    </svg>
  </span>
);

export default LedgerIcon;
