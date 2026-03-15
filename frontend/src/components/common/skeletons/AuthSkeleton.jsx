import React from 'react';
import Skeleton from '../Skeleton';

const AuthSkeleton = () => {
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'white',
        borderRadius: '32px',
        padding: '48px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.05)'
      }}>
        {/* Logo area */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <Skeleton width="64px" height="64px" borderRadius="16px" />
        </div>
        
        {/* Title and subtitle */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Skeleton width="220px" height="32px" style={{ marginBottom: '12px' }} />
          <Skeleton width="180px" height="16px" />
        </div>

        {/* Form fields */}
        <div style={{ marginBottom: '24px' }}>
          <Skeleton width="80px" height="12px" style={{ marginBottom: '8px' }} />
          <Skeleton height="56px" borderRadius="16px" />
        </div>
        <div style={{ marginBottom: '32px' }}>
          <Skeleton width="80px" height="12px" style={{ marginBottom: '8px' }} />
          <Skeleton height="56px" borderRadius="16px" />
        </div>

        {/* Button */}
        <Skeleton height="56px" borderRadius="16px" style={{ marginBottom: '24px' }} />

        {/* Link area */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton width="150px" height="14px" />
        </div>
      </div>
    </div>
  );
};

export default AuthSkeleton;
