import React from 'react';
import { Menu, X } from 'lucide-react';
import './MobileHeader.css';

const MobileHeader = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <header className="mobile-header">
      <div className="mobile-header-content">
        <button className="menu-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="mobile-header-logo">
          <span className="logo-icon">💠</span>
          <span className="logo-text">BlueCrown</span>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
