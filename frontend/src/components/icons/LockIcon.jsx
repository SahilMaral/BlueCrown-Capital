import React from 'react';
import './AnimatedIcons.css';

const LockIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Lock Body Fill */}
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" className="icon-fill" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" className="icon-fill-accent" />
      
      {/* High-Fidelity Outlines */}
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" className="icon-stroke draw-on-hover" pathLength="100" />
      <circle cx="12" cy="16" r="1.5" className="icon-stroke-accent pop-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default LockIcon;
