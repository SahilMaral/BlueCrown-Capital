import React from 'react';
import './AnimatedIcons.css';

const SearchIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Search Ring Fill */}
      <circle cx="11" cy="11" r="8" className="icon-fill" />
      
      {/* High-Fidelity Outlines */}
      <circle cx="11" cy="11" r="8" className="icon-stroke draw-on-hover" pathLength="100" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" className="icon-stroke-accent draw-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default SearchIcon;
