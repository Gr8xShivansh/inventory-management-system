import React from 'react';

/**
 * A reusable Modal component.
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to call when modal should close
 * @param {string} props.title - The title of the modal
 * @param {React.ReactNode} props.children - The content of the modal
 * @param {React.ReactNode} props.footer - The footer/actions of the modal
 * @param {string} [props.width="920px"] - Optional width for the modal
 */
function Modal({ isOpen, onClose, title, children, footer, width = "920px" }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="btn-light" style={{ padding: '8px 12px', minWidth: 'auto', border: '1px solid #ddd' }}>
            &times;
          </button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
        
        {footer && (
          <div className="modal-actions">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;