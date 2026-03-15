import React from 'react';
import './AnimatedIcons.css';

const MailIcon = ({ className = "", style = {} }) => (
  <span className={`animated-icon breathe ${className}`} style={style}>
    <svg viewBox="0 0 24 24">
      {/* Envelope Body Fill */}
      <rect x="2" y="4" width="20" height="16" rx="2" className="icon-fill" />
      
      {/* High-Fidelity Outlines */}
      <rect x="2" y="4" width="20" height="16" rx="2" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M22 4l-10 8L2 4" className="icon-stroke-accent draw-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default MailIcon;
