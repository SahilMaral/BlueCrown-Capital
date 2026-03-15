import React from 'react';
import './AnimatedIcons.css';

const PiggyBankIcon = ({ className = "" }) => (
  <span className={`animated-icon breathe ${className}`}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Piggy Body */}
      <path 
        d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2 .5-.5.7-1 .7-2 0-2.5-2.2-5-4.7-5z" 
        className="icon-fill" 
      />
      <path 
        d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2 .5-.5.7-1 .7-2 0-2.5-2.2-5-4.7-5z" 
        className="icon-stroke draw-on-hover" 
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        pathLength="100" 
      />
      
      {/* Eye */}
      <circle cx="7.5" cy="11.5" r="1" className="icon-fill-accent" />
      
      {/* Coin Slot */}
      <path 
        d="M11 2h2v4h-2V2z" 
        className="icon-fill-accent" 
      />
      <path 
        d="M11 2h2v4h-2V2z" 
        className="icon-stroke-accent draw-on-hover" 
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
        pathLength="100" 
      />
    </svg>
  </span>
);

export default PiggyBankIcon;
