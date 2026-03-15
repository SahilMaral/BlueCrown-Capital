import React from 'react';
import './AnimatedIcons.css';

const PaymentIcon = ({ className = "", style = {} }) => (
  <span className={`animated-icon breathe ${className}`} style={style}>
    <svg viewBox="0 0 24 24">
      {/* Card Fill */}
      <rect x="2" y="5" width="20" height="14" rx="2" className="icon-fill" />
      <rect x="5" y="10" width="4" height="3" rx="1" className="icon-fill-accent" />
      
      {/* High-Fidelity Outlines */}
      <rect x="2" y="5" width="20" height="14" rx="2" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M2 9h20" className="icon-stroke draw-on-hover" pathLength="100" />
      <rect x="5" y="10" width="4" height="3" rx="1" className="icon-stroke-accent pop-on-hover" pathLength="100" />
      <path d="M15 15h4" className="icon-stroke-accent draw-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default PaymentIcon;
