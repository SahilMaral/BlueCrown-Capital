import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="elite-footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>&copy; {currentYear} BlueCrown Capital. All rights reserved.</p>
        </div>
        <div className="footer-right">
          <p>Created with ❤️ by <span className="author-name">Sahil Maral</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
