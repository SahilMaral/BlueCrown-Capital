import React from 'react';
import './AnimatedIcons.css';

const TrashIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Bin Fill */}
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" className="icon-fill" />
      
      {/* High-Fidelity Outlines */}
      <polyline points="3 6 5 6 21 6" className="icon-stroke draw-on-hover" pathLength="100" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" className="icon-stroke draw-on-hover" pathLength="100" />
      <line x1="10" y1="11" x2="10" y2="17" className="icon-stroke-accent draw-on-hover" pathLength="100" />
      <line x1="14" y1="11" x2="14" y2="17" className="icon-stroke-accent draw-on-hover" style={{ animationDelay: '0.1s' }} pathLength="100" />
    </svg>
  </span>
);

export default TrashIcon;
