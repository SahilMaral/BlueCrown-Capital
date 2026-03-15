import React from 'react';
import './Skeleton.css';

const Skeleton = ({ 
  width, 
  height, 
  borderRadius, 
  circle, 
  className = '', 
  style = {} 
}) => {
  const customStyle = {
    width: width || '100%',
    height: height || '20px',
    borderRadius: circle ? '50%' : (borderRadius || '4px'),
    ...style
  };

  return (
    <div 
      className={`skeleton-base ${className}`} 
      style={customStyle}
    />
  );
};

export default Skeleton;
