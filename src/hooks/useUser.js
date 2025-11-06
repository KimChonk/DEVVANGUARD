import { useState, useEffect } from "react";
import { userService, userStatsService, userProgressService } from "../services/apiClient";
import { supabase } from "../services/supabaseClient";

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await userService.getMyProfile();
        if (result.success) {
          setProfile(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = async (email, fullName) => {
    try {
      setError(null);
      const result = await userService.updateMyProfile(email, fullName);
      if (result.success) {
        setProfile(result.data);
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  return { profile, loading, error, updateProfile };
};

export const useUserStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await userStatsService.getMyStats();
        if (result.success) {
          setStats(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const updateStats = async (totalLessonsCompleted, totalTimeSpent, xp) => {
    try {
      setError(null);
      const result = await userStatsService.updateStats(
        totalLessonsCompleted,
        totalTimeSpent,
        xp
      );
      if (result.success) {
        setStats(result.data);
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  return { stats, loading, error, updateStats };
};

export const useUserProgress = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await userProgressService.getMyProgress();
        if (result.success) {
          setProgress(Array.isArray(result.data) ? result.data : [result.data]);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const updateProgress = async (progressId, lessonId, status) => {
    try {
      setError(null);
      const result = await userProgressService.updateProgress(
        progressId,
        lessonId,
        status
      );
      if (result.success) {
        // Update local progress
        setProgress(
          progress.map((p) => (p.progressId === progressId ? result.data : p))
        );
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  return { progress, loading, error, updateProgress };
};

export const useUserRank = () => {
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRank = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user from Supabase Auth
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        // Fetch from user_profile_ranks view
        const { data, error: fetchError } = await supabase
          .from("user_profile_ranks")
          .select("user_id, full_name, xp, total_lessons_completed, total_time_spent, rank_title")
          .eq("user_id", user.id)
          .single();

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setRankData(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRank();
  }, []);

  return { rankData, loading, error };
};
