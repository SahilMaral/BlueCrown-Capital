import React from 'react';
import './AnimatedIcons.css';

const UserIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Head and Shoulders Fill */}
      <circle cx="12" cy="8" r="4" className="icon-fill" />
      <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" className="icon-fill-accent" />
      
      {/* High-Fidelity Outlines */}
      <circle cx="12" cy="8" r="4" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" className="icon-stroke draw-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default UserIcon;
