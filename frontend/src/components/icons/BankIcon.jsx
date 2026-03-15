import React from 'react';
import './AnimatedIcons.css';

const BankIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Bank Building Fill */}
      <path d="M3 21h18" className="icon-fill" />
      <path d="M3 10h18l-9-7-9 7z" className="icon-fill-accent" />
      
      {/* High-Fidelity Outlines */}
      <path d="M3 21h18" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M3 10h18l-9-7-9 7z" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M5 21V10" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M19 21V10" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M9 21v-4a3 3 0 0 1 6 0v4" className="icon-stroke-accent pop-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default BankIcon;
