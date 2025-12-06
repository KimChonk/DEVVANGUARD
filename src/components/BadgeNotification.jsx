import React, { useEffect } from 'react';
import '../assets/CSS/badgeNotification.css';

const BadgeNotification = ({ isVisible, badge, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible || !badge) return null;

  const rawDesc = badge.description || badge.Description || "You have earned a new badge!";
  const cleanDesc = rawDesc.split(/How to earn/i)[0].trim();

  const displayName = badge.name || badge.Name || badge.badgeName || badge.BadgeName || badge.title || "Unknown Badge";
  
  const rawIcon = badge.iconUrl || badge.IconUrl || badge.badgeImg || badge.BadgeImg || "default-badge.png";
  
  let displayImage = "/Badges/default-badge.png"; 

  if (rawIcon) {
    if (rawIcon.startsWith("http") || rawIcon.startsWith("/")) {
       displayImage = rawIcon;
    } else {
       displayImage = `/Badges/${rawIcon}`; 
    }
  }

  return (
    <div className="badge-notification-overlay">
      <div className="badge-notification-card">
        <div className="badge-shine"></div>
        <div className="badge-header">
          <span>You just unlocked new Badges!</span>
          <button onClick={onClose} className="badge-close-btn">×</button>
        </div>
        
        <div className="badge-body">
          <div className="badge-icon-container">
            <img 
              src={displayImage}
              alt={displayName}
              className="badge-img" 
              onError={(e) => {e.target.src = "/Badges/default-badge.png"}}
            />
          </div>
          <div className="badge-info">
            <h3 className="badge-title">{displayName}</h3>
            <p className="badge-desc">{cleanDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeNotification;