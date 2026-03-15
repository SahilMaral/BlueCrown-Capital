import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../../pages/Dashboard/Dashboard.css';

import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-wrapper">
        <Outlet />
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
