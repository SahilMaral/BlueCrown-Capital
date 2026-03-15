import React from 'react';
import './AnimatedIcons.css';

const FileIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24">
      {/* File Body Fill */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" className="icon-fill" />
      
      {/* High-Fidelity Outlines */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" className="icon-stroke draw-on-hover" pathLength="100" />
      <polyline points="14 2 14 8 20 8" className="icon-stroke-accent draw-on-hover" pathLength="100" />
      <line x1="16" y1="13" x2="8" y2="13" className="icon-stroke-accent draw-on-hover" style={{ animationDelay: '0.1s' }} pathLength="100" />
      <line x1="16" y1="17" x2="8" y2="17" className="icon-stroke-accent draw-on-hover" style={{ animationDelay: '0.2s' }} pathLength="100" />
    </svg>
  </span>
);

export default FileIcon;
