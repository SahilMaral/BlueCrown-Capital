import React from 'react';
import './AnimatedIcons.css';

const ReceiptIcon = ({ className = "", style = {} }) => (
  <span className={`animated-icon breathe ${className}`} style={style}>
    <svg viewBox="0 0 24 24">
      {/* Receipt Body Fill */}
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" className="icon-fill" />
      
      {/* High-Fidelity Outlines */}
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M8 10h8" className="icon-stroke-accent draw-on-hover" pathLength="100" />
      <path d="M8 14h8" className="icon-stroke-accent draw-on-hover" style={{ animationDelay: '0.1s' }} pathLength="100" />
      <path d="M8 18h5" className="icon-stroke-accent draw-on-hover" style={{ animationDelay: '0.2s' }} pathLength="100" />
    </svg>
  </span>
);

export default ReceiptIcon;
