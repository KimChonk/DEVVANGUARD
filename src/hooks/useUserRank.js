import { useEffect, useState } from 'react';
import { supabase } from '../services/apiClient';

export const useUserRank = (userId) => {
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRankData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_profile_ranks')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error fetching rank data:', error);
          setError(error.message);
        } else {
          setRankData(data);
        }
      } catch (err) {
        console.error('Error in useUserRank:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRankData();
  }, [userId]);

  return { rankData, loading, error };
};
