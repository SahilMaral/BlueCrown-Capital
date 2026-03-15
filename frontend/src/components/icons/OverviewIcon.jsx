import React from 'react';
import './AnimatedIcons.css';

const OverviewIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Background Fills - High Visibility */}
      <rect x="3" y="3" width="8" height="8" rx="2" className="icon-fill" />
      <rect x="13" y="3" width="8" height="8" rx="2" className="icon-fill-accent" />
      <rect x="3" y="13" width="8" height="8" rx="2" className="icon-fill-accent" />
      <rect x="13" y="13" width="8" height="8" rx="2" className="icon-fill" />
      
      {/* High-Fidelity Outlines with Pop Logic */}
      <rect x="3" y="3" width="8" height="8" rx="2" className="icon-stroke pop-on-hover" pathLength="100" />
      <rect x="13" y="3" width="8" height="8" rx="2" className="icon-stroke-accent pop-on-hover" style={{ animationDelay: '0.1s' }} pathLength="100" />
      <rect x="3" y="13" width="8" height="8" rx="2" className="icon-stroke-accent pop-on-hover" style={{ animationDelay: '0.2s' }} pathLength="100" />
      <rect x="13" y="13" width="8" height="8" rx="2" className="icon-stroke pop-on-hover" style={{ animationDelay: '0.3s' }} pathLength="100" />
    </svg>
  </span>
);

export default OverviewIcon;
