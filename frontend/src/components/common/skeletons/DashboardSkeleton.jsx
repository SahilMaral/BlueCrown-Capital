import React from 'react';
import Skeleton from '../Skeleton';
import '../../../pages/Dashboard/Dashboard.css';

const DashboardSkeleton = () => {
  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <Skeleton width="250px" height="36px" style={{ marginBottom: '8px' }} borderRadius="8px" />
          <Skeleton width="400px" height="18px" />
        </div>
        <div className="header-actions">
           <Skeleton width="140px" height="44px" borderRadius="12px" />
        </div>
      </header>

      <section className="summary-grid">
        {[1, 2, 3].map((i) => (
          <div key={`sk-card-${i}`} className="summary-card">
            <Skeleton width="56px" height="56px" borderRadius="18px" style={{ marginBottom: '20px' }} />
            <Skeleton width="40%" height="13px" style={{ marginBottom: '12px' }} />
            <Skeleton width="60%" height="34px" style={{ marginBottom: '12px' }} />
            <Skeleton width="50%" height="24px" borderRadius="100px" />
          </div>
        ))}
      </section>

      <section className="content-section">
        <div className="section-header">
          <Skeleton width="150px" height="24px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[1, 2, 3].map((i) => (
            <div key={`sk-action-${i}`} className="stat-card-elite" style={{ padding: '32px' }}>
               <Skeleton width="40px" height="40px" borderRadius="12px" style={{ marginBottom: '16px' }} />
               <Skeleton width="70%" height="18px" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default DashboardSkeleton;
