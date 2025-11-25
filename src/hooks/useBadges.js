import { useState, useEffect, useCallback } from "react";
import { badgeService } from "../services/apiClient";

export const useBadges = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await badgeService.getAllBadges();
        if (result.success) {
          setBadges(Array.isArray(result.data) ? result.data : [result.data]);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  return { badges, loading, error };
};

export const useUserBadges = (userId) => {
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBadges, setNewBadges] = useState([]);

  const fetchUserBadges = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await badgeService.getUserBadges(userId);
      if (result.success) {
        const badgesArray = Array.isArray(result.data) ? result.data : [result.data];
        setUserBadges(badgesArray);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserBadges();
  }, [fetchUserBadges]);

  // Check and grant badges after stats update
  const checkAndGrantBadges = useCallback(async () => {
    try {
      const result = await badgeService.checkAndGrantBadges();
      
      // Fetch updated badges after check
      if (result.success) {
        await fetchUserBadges();
      }
      
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, [fetchUserBadges]);

  // Check if user has earned a specific badge
  const hasBadge = useCallback(async (badgeId) => {
    if (!userId) return false;
    
    try {
      const result = await badgeService.hasUserEarnedBadge(userId, badgeId);
      return result.success ? result.data.hasEarned : false;
    } catch (err) {
      console.error("Error checking badge:", err);
      return false;
    }
  }, [userId]);

  return {
    userBadges,
    loading,
    error,
    checkAndGrantBadges,
    hasBadge,
    refetchBadges: fetchUserBadges,
    newBadges,
    setNewBadges
  };
};

export const useCheckBadgesAfterUpdate = (userId, shouldCheck) => {
  const { checkAndGrantBadges, newBadges, setNewBadges } = useUserBadges(userId);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkBadges = async () => {
      if (!shouldCheck || !userId) return;

      setChecking(true);
      try {
        // Get badges before
        const beforeResult = await badgeService.getUserBadges(userId);
        const badgesBefore = Array.isArray(beforeResult.data) ? beforeResult.data : [];

        // Trigger badge check
        await checkAndGrantBadges();

        // Get badges after
        const afterResult = await badgeService.getUserBadges(userId);
        const badgesAfter = Array.isArray(afterResult.data) ? afterResult.data : [];

        // Find new badges
        const newBadgesList = badgesAfter.filter(
          (badge) =>
            !badgesBefore.some((b) => b.badgeId === badge.badgeId)
        );

        if (newBadgesList.length > 0) {
          setNewBadges(newBadgesList);
        }
      } catch (err) {
        console.error("Error checking badges:", err);
      } finally {
        setChecking(false);
      }
    };

    checkBadges();
  }, [shouldCheck, userId, checkAndGrantBadges]);

  return { checking, newBadges, setNewBadges };
};
