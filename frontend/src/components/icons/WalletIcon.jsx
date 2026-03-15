import React from 'react';
import './AnimatedIcons.css';

const WalletIcon = ({ className = "", style = {} }) => (
  <span className={`animated-icon breathe ${className}`} style={style}>
    <svg viewBox="0 0 24 24">
      {/* Wallet Body Fill */}
      <path d="M20 12V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" className="icon-fill" />
      <rect x="16" y="12" width="6" height="4" rx="1" className="icon-fill-accent" />
      
      {/* High-Fidelity Outlines */}
      <path d="M20 12V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" className="icon-stroke draw-on-hover" pathLength="100" />
      <rect x="16" y="12" width="6" height="4" rx="1" className="icon-stroke-accent pop-on-hover" pathLength="100" />
      <circle cx="19" cy="14" r="0.5" className="icon-stroke-accent bounce-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default WalletIcon;
