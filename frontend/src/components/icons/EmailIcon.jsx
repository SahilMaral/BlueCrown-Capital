import React from 'react';
import './AnimatedIcons.css';

const EmailIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Envelope Body Fill */}
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" className="icon-fill" />
      <polyline points="22,6 12,13 2,6" className="icon-fill-accent" style={{ opacity: 0.2 }} />
      
      {/* High-Fidelity Outlines */}
      <rect x="2" y="4" width="20" height="16" rx="2" className="icon-stroke draw-on-hover" pathLength="100" />
      <polyline points="22,6 12,13 2,6" className="icon-stroke-accent draw-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default EmailIcon;
