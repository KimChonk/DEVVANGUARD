import React, { useEffect, useState } from 'react';
import '../assets/CSS/alertnotification.css';

const AlertNotification = ({ isVisible, message, onClose, onClosedComplete, duration = 3000 }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsClosing(false);
      const timer = setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => {
          onClose();
          // Call the callback after animation completes
          if (onClosedComplete) {
            onClosedComplete();
          }
        }, 600);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, onClosedComplete, duration]);

  if (!isVisible && !isClosing) return null;

  return (
    <div className={`alert-notification-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`alert-bubble ${isClosing ? 'closing' : ''}`}>
        {/* Star particles background */}
        <div className="particles">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`particle particle-${i}`}></div>
          ))}
        </div>

        {/* Alert Content */}
        <div className="alert-content">
          <div className="alert-icon"></div>
          <h2 className="alert-title">You already completed this lesson</h2>
          <p className="alert-message">{message}</p>
          
          {/* Action Hint */}
          <p className="alert-hint">Try other lessons to improve your skills!</p>
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

export default AlertNotification;
