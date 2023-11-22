import React from 'react'

interface ConfirmationModalProps {
  isOpen: boolean; // Whether the modal is open
  onConfirm: () => void; // Function to call when "Remove" is clicked
  onCancel: () => void; // Function to call when "Cancel" is clicked
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) {
    return null; // Don't render the modal if it's not open
  }

  const modalStyle = {
    display: isOpen ? 'block' : 'none', // Show or hide the modal
  };

  return (
    <div className="modal" style={modalStyle}>
      <div className="modal-content">
        <span className="close-button" onClick={onCancel}>&times;</span>
        <p>Are you sure you want to remove this item from the list?</p>
        <div className="modal-footer">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm}>Remove</button>
        </div>
      </div>
    </div>
  );
};
