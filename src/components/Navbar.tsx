import React, { useState, useRef } from 'react'
import '../styles/Navbar.css'

interface NavbarProps {
  saveJson: () => void;
  loadExample: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ saveJson, loadExample }) => {
  const [isFileMenuOpen, setFileMenuOpen] = useState(false);

  const toggleFileMenu = () => {
    setFileMenuOpen(!isFileMenuOpen);
  };

  return (
    <div id='navbar'>
      <h3 className='brand-name'>Chatbot Creator Tool</h3>
      <div className='menu-bar'>
        <div className='menu-item' onClick={toggleFileMenu}>
          <p>File</p>
          {isFileMenuOpen && (
            <div className='dropdown-content'>
              <button className='menu-button' onClick={saveJson}>Save JSON File</button>
              <button className='menu-button' onClick={loadExample}>Load Example</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

