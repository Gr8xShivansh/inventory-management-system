import React from 'react';

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <div className="error-message" style={{ marginBottom: '16px' }}>
      <strong>Error:</strong> {message}
    </div>
  );
};

export default ErrorMessage;