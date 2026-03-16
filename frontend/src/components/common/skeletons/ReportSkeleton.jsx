import React from 'react';
import Skeleton from '../Skeleton';
import '../../../pages/Dashboard/Dashboard.css';

const ReportSkeleton = ({ hasSummaryGrid = true, rows = 5 }) => {
  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <Skeleton width="300px" height="36px" style={{ marginBottom: '8px' }} borderRadius="10px" />
          <Skeleton width="450px" height="18px" />
        </div>
      </header>

      <section className="content-section content-section-elite">
        {/* Filter Card Skeleton */}
        <div className="filter-card-elite" style={{ padding: '32px', marginBottom: '40px' }}>
          <div className="filter-grid-elite">
            {[1, 2, 3].map(i => (
              <div key={i} className="auth-input-group">
                <Skeleton width="100px" height="12px" style={{ marginBottom: '12px' }} />
                <Skeleton height="48px" borderRadius="14px" />
              </div>
            ))}
            <div className="filter-actions-elite">
               <Skeleton width="160px" height="48px" borderRadius="16px" />
            </div>
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        {hasSummaryGrid && (
          <div className="summary-cards-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="summary-card-elite">
                <Skeleton width="120px" height="12px" style={{ marginBottom: '16px' }} />
                <Skeleton width="180px" height="32px" borderRadius="8px" />
              </div>
            ))}
          </div>
        )}

        {/* Multi-line Table Section Header */}
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <Skeleton width="200px" height="24px" />
        </div>

        {/* Table Skeleton */}
        <div className="elite-table-container shadow">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} width="15%" height="16px" />
              ))}
            </div>
            {[...Array(rows)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                <Skeleton height="56px" borderRadius="14px" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ReportSkeleton;
