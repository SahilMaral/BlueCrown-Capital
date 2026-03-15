import React from 'react';
import './AnimatedIcons.css';

const TrendingUpIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* Trending Area Fill */}
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" className="icon-fill-accent opaque" style={{ opacity: 0.1 }} />
      
      {/* High-Fidelity Outlines */}
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" className="icon-stroke draw-on-hover" pathLength="100" />
      <polyline points="17 6 23 6 23 12" className="icon-stroke-accent draw-on-hover" pathLength="100" />
    </svg>
  </span>
);

export default TrendingUpIcon;
