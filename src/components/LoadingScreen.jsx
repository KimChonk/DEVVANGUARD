import React from 'react';
import '../assets/CSS/loadingscreen.css';

const LoadingScreen = ({ isVisible, message = 'Loading...' }) => {
  if (!isVisible) return null;

  return (
    <div className="loading-screen-overlay">
      <div className="loading-screen-content">
        <img 
          src="/UX/zombie-walking-loading.gif" 
          alt="Loading" 
          className="loading-gif"
        />
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
