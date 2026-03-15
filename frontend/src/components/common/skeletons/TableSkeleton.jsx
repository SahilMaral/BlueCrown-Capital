import React from 'react';
import Skeleton from '../Skeleton';
import '../../../pages/Dashboard/Dashboard.css';

const TableSkeleton = () => {
  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-section">
          <Skeleton width="250px" height="32px" style={{ marginBottom: '12px' }} borderRadius="8px" />
          <Skeleton width="350px" height="16px" />
        </div>
      </header>
      <section className="content-section" style={{ padding: 0 }}>
        <div className="section-header" style={{ padding: '32px 32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width="150px" height="28px" borderRadius="8px" />
          <Skeleton width="240px" height="44px" borderRadius="12px" />
        </div>
        <div className="elite-table-container">
          <table className="elite-table">
            <thead>
              <tr>
                {[...Array(6)].map((_, i) => (
                  <th key={i}><Skeleton width="80px" height="16px" /></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan="6" style={{ padding: '8px 32px' }}>
                     <Skeleton height="60px" borderRadius="12px" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default TableSkeleton;
