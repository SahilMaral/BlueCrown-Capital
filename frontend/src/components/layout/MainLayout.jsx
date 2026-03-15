import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import '../../pages/Dashboard/Dashboard.css';

import Footer from './Footer';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="dashboard-container">
      <MobileHeader isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="main-wrapper">
        <Outlet />
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
