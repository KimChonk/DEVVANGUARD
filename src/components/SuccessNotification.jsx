import React, { useEffect, useState } from 'react';
import '../assets/CSS/successnotification.css';

const SuccessNotification = ({ isVisible, message, xpReward, onClose, duration = 3000 }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsClosing(false);
      const timer = setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => {
          onClose();
        }, 600);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible && !isClosing) return null;

  return (
    <div className={`success-notification-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`success-bubble ${isClosing ? 'closing' : ''}`}>
        {/* Star particles background */}
        <div className="particles">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`particle particle-${i}`}></div>
          ))}
        </div>

        {/* Congratulation GIF */}
        <div className="congrat-gif-container">
          <img src="/UX/congrat.gif" alt="Congratulations" className="congrat-gif" />
        </div>

        {/* Success Message */}
        <div className="success-content">
          <h2 className="success-title">Wohoo~! You did it</h2>
          <p className="success-message">{message}</p>

          {/* XP Reward Display */}
          {xpReward > 0 && (
            <div className="xp-reward-container">
              <div className="xp-reward-badge">
                <span className="xp-icon">⭐</span>
                <span className="xp-text">+{xpReward} XP</span>
                <span className="xp-icon">⭐</span>
              </div>
              <div className="xp-glow"></div>
            </div>
          )}

          {/* Motivational Quote */}
          <p className="motivational-text">Keep learning to be stronger!</p>
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

export default SuccessNotification;
