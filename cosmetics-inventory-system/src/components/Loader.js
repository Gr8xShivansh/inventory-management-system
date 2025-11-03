import React from 'react';

const Loader = ({ text = "Loading..." }) => {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div className="loader"></div>
      <p style={{ color: '#555' }}>{text}</p>
    </div>
  );
};

export default Loader;