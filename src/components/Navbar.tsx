import React, { useState, useRef } from 'react'
import '../styles/Navbar.css'

interface NavbarProps {
  saveJson: () => void;
  loadExample: () => void;
  exportToDoList: () => void;
  exportModifiedXlsx: () => void;
  saveAll: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ saveJson, loadExample, exportToDoList, exportModifiedXlsx, saveAll }) => {
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
              <button className='menu-button' onClick={saveAll}>SAVE ALL</button>
              <button className='menu-button' onClick={loadExample}>Load Example</button>
              <button className='menu-button' onClick={saveJson}>Export Dialogs/Utterances</button>
              <button className='menu-button' onClick={exportToDoList}>Export To-Do List</button>
              <button className='menu-button' onClick={exportModifiedXlsx}>Export Modified XLSX</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

