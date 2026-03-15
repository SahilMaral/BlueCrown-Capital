import React from 'react';
import Skeleton from '../Skeleton';
import '../../../pages/Dashboard/Dashboard.css';

const FormSkeleton = () => {
  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <Skeleton width="250px" height="32px" style={{ marginBottom: '12px' }} borderRadius="8px" />
          <Skeleton width="350px" height="16px" />
        </div>
      </header>
      <section className="content-section" style={{ maxWidth: '800px', margin: '0 32px' }}>
        <div className="elite-form" style={{ background: 'rgba(255, 255, 255, 0.4)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.6)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
             {[...Array(6)].map((_, i) => (
                <div key={i} className="form-group">
                  <Skeleton width="120px" height="16px" style={{ marginBottom: '12px' }} />
                  <Skeleton height="48px" borderRadius="12px" />
                </div>
              ))}
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
             <Skeleton width="150px" height="16px" style={{ marginBottom: '12px' }} />
             <Skeleton height="100px" borderRadius="16px" />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
             <Skeleton width="150px" height="48px" borderRadius="16px" />
             <Skeleton width="120px" height="48px" borderRadius="16px" />
          </div>
        </div>
      </section>
    </main>
  );
};

export default FormSkeleton;
