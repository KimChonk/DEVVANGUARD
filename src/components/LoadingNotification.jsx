import React, { useEffect, useState } from 'react';
import '../assets/CSS/loadingnotification.css';

const LoadingNotification = ({ isVisible, status = 'connecting', onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible && status === 'completed') {
      // Auto-close after 1.5 seconds when completed
      const timer = setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => {
          onClose();
        }, 600);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, status, onClose]);

  if (!isVisible && !isClosing) return null;

  return (
    <div className={`loading-notification-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`loading-bubble ${isClosing ? 'closing' : ''}`}>
        {/* Loading/Completion GIF */}
        <div className="loading-gif-container">
          {status === 'connecting' && (
            <img 
              src="/UX/connecting-loading.gif" 
              alt="Connecting..." 
              className="loading-gif" 
            />
          )}
          {status === 'completed' && (
            <img 
              src="/UX/completed-loading.gif" 
              alt="Completed" 
              className="loading-gif" 
            />
          )}
        </div>

        {/* Decorative Elements */}
        <div className="decorative-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingNotification;
