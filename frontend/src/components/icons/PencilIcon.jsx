import React from 'react';
import './AnimatedIcons.css';

const PencilIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Pencil Fill */}
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" className="icon-fill-accent" style={{ opacity: 0.15 }} />
      
      {/* High-Fidelity Outlines */}
      <path d="M17 3l4 4L7.5 20.5 2 22l1.5-5.5L17 3z" className="icon-stroke draw-on-hover" pathLength="100" />
      <line x1="15" y1="5" x2="19" y2="9" className="icon-stroke-accent draw-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default PencilIcon;
