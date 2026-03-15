import React from 'react';
import './AnimatedIcons.css';

const BriefcaseIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Briefcase Body Fill */}
      <rect x="2" y="7" width="20" height="14" rx="2" className="icon-fill" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" className="icon-fill-accent" />
      
      {/* High-Fidelity Outlines */}
      <rect x="2" y="7" width="20" height="14" rx="2" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" className="icon-stroke draw-on-hover" pathLength="100" />
      <rect x="11" y="12" width="2" height="3" rx="1" className="icon-stroke pop-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default BriefcaseIcon;
