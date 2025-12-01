import React, { useEffect, useState } from 'react';
import BadgeNotification from './BadgeNotification';
import { useLocation } from 'react-router-dom';
import { badgeService, userService } from '../services/apiClient';

const GlobalBadgeListener = () => {
  const [badgeQueue, setBadgeQueue] = useState([]); 
  const location = useLocation();

  const handleClose = () => {
    setBadgeQueue((prevQueue) => prevQueue.slice(1));
  };

  useEffect(() => {
    const checkForBadges = async () => {
      const shouldCheck = localStorage.getItem('SHOULD_CHECK_BADGE');
      
      if (shouldCheck === 'true') {
        localStorage.removeItem('SHOULD_CHECK_BADGE');

        const preLessonBadgesRaw = localStorage.getItem('PRE_LESSON_BADGES');
        const preLessonBadgeIds = preLessonBadgesRaw ? new Set(JSON.parse(preLessonBadgesRaw)) : new Set();
        localStorage.removeItem('PRE_LESSON_BADGES');

        try {
          const userRes = await userService.getMyProfile();
          if (!userRes.success) return;
          const userId = userRes.data.userId || userRes.data.UserId || userRes.data.id;

          await badgeService.checkAndGrantBadges();

          const currentBadgesRes = await badgeService.getUserBadges(userId);
          
          if (currentBadgesRes.success) {
            const currentBadges = currentBadgesRes.data;
            
            const newEarnedBadges = currentBadges.filter(b => {
                const id = b.badgeId || b.BadgeId || b.id;
                return !preLessonBadgeIds.has(id);
            });

            if (newEarnedBadges.length > 0) {
              setBadgeQueue(prev => [...prev, ...newEarnedBadges]);
            }
          }
        } catch (error) {
        }
      }
    };

    checkForBadges();
  }, [location]);

  return (
    <BadgeNotification 
      isVisible={badgeQueue.length > 0} 
      badge={badgeQueue[0] || null} 
      onClose={handleClose} 
    />
  );
};

export default GlobalBadgeListener;