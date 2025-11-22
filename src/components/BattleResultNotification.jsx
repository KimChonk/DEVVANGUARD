import React, { useEffect, useState } from 'react';
import '../assets/CSS/battleresultnotification.css';

const BattleResultNotification = ({ 
  isVisible, 
  message, 
  isVictory = false,
  xpChange = 0,
  onClose,
  duration = 5000 
}) => {
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
    <div className={`battle-result-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`battle-result-card ${isVictory ? 'victory' : 'defeat'} ${isClosing ? 'closing' : ''}`}>
        <div className="battle-result-content">
          <div className={`battle-result-icon ${isVictory ? 'victory' : 'defeat'}`}>
            {isVictory ? '⚔' : '💔'}
          </div>
          <h2 className="battle-result-title">
            {isVictory ? 'VICTORY!' : 'DEFEAT'}
          </h2>
          <p className="battle-result-message">{message}</p>
          <div className={`battle-result-xp ${isVictory ? 'positive' : 'negative'}`}>
            <span className="xp-label">XP:</span>
            <span className="xp-value">{isVictory ? '+' : ''}{xpChange}</span>
          </div>
        </div>
        <div className="battle-result-glow"></div>
      </div>
    </div>
  );
};

export default BattleResultNotification;
