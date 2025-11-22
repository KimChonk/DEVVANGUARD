import { useState, useCallback, useEffect } from "react";
import { pvpProblemService, pvpMatchService } from "../services/apiClient";

export const usePvP = () => {
  const [problems, setProblems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [activeMatch, setActiveMatch] = useState(null);
  const [searchingMatches, setSearchingMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all problems
  const loadProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await pvpProblemService.getAllProblems();
      if (result.success) {
        setProblems(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get random problem
  const getRandomProblem = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await pvpProblemService.getRandomProblem();
      if (result.success) {
        return result.data;
      } else {
        setError(result.message);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get problem by ID
  const getProblemById = useCallback(async (problemId) => {
    console.log('[usePvP] getProblemById called:', problemId);
    setLoading(true);
    setError(null);
    try {
      const result = await pvpProblemService.getProblemById(problemId);
      console.log('[usePvP] getProblemById result:', result);
      
      if (result.success) {
        console.log('[usePvP] Problem loaded successfully:', result.data);
        return result.data;
      } else {
        console.error('[usePvP] getProblemById failed:', result.message);
        setError(result.message);
        return null;
      }
    } catch (err) {
      console.error('[usePvP] getProblemById error:', err.message);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user matches (non-state version)
  const getUserMatches = useCallback(async () => {
    try {
      const result = await pvpMatchService.getUserMatches();
      if (result.success) {
        return result.data;
      } else {
        setError(result.message);
        return [];
      }
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  // Load user matches
  const loadUserMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await pvpMatchService.getUserMatches();
      if (result.success) {
        setMatches(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user matches by status
  const loadUserMatchesByStatus = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const result = await pvpMatchService.getUserMatchesByStatus(status);
      if (result.success) {
        return result.data;
      } else {
        setError(result.message);
        return [];
      }
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user active match
  const loadActiveMatch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await pvpMatchService.getUserActiveMatch();
      if (result.success) {
        setActiveMatch(result.data);
        return result.data;
      } else {
        setActiveMatch(null);
        return null;
      }
    } catch (err) {
      setError(err.message);
      setActiveMatch(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load searching matches (for matchmaking)
  const loadSearchingMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await pvpMatchService.getSearchingMatches();
      if (result.success) {
        setSearchingMatches(result.data);
        return result.data;
      } else {
        setError(result.message);
        return [];
      }
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get searching matches (non-state version for polling)
  const getSearchingMatches = useCallback(async () => {
    try {
      const result = await pvpMatchService.getSearchingMatches();
      if (result.success) {
        return result.data;
      } else {
        setError(result.message);
        return [];
      }
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  // Get match by ID
  const getMatchById = useCallback(async (matchId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await pvpMatchService.getMatchById(matchId);
      console.log('[usePvP] getMatchById result:', result);
      
      if (result.success) {
        console.log('[usePvP] Match loaded successfully:', result.data);
        setCurrentMatch(result.data);
        return { success: true, data: result.data };
      } else {
        console.error('[usePvP] getMatchById failed:', result.message);
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      console.error('[usePvP] getMatchById error:', err.message);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get match by ID (for polling - doesn't set state to avoid re-renders)
  const getMatchByIdForPolling = useCallback(async (matchId) => {
    try {
      const result = await pvpMatchService.getMatchById(matchId);
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  // Create match and join queue
  const createMatch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await pvpMatchService.createMatch();
      if (result.success) {
        setCurrentMatch(result.data);
        return result.data;
      } else {
        setError(result.message);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Join queue (auto-match with XP range)
  const joinQueue = useCallback(async () => {
    console.log('[usePvP] joinQueue called');
    setLoading(true);
    setError(null);
    try {
      console.log('[usePvP] Calling pvpMatchService.joinQueue()');
      const result = await pvpMatchService.joinQueue();
      console.log('[usePvP] joinQueue result:', result);
      
      if (result.success && result.data) {
        console.log('[usePvP] Setting currentMatch:', result.data);
        setCurrentMatch(result.data);
        // Return the match data directly (not wrapped)
        return result.data;
      } else if (result.matchId) {
        // If service returns match directly (not wrapped in success/data)
        console.log('[usePvP] Got match directly:', result);
        setCurrentMatch(result);
        return result;
      } else {
        console.error('[usePvP] joinQueue failed:', result.message);
        setError(result.message);
        return null;
      }
    } catch (err) {
      console.error('[usePvP] joinQueue error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Join match (deprecated, use joinQueue instead)
  const joinMatch = useCallback(async (matchId) => {
    return joinQueue(matchId);
  }, [joinQueue]);

  // Submit code
  const submitCode = useCallback(async (matchId, code) => {
    console.log('[usePvP] submitCode called with:', { matchId, codeLength: code?.length });
    setLoading(true);
    setError(null);
    try {
      const result = await pvpMatchService.submitCode(matchId, code);
      console.log('[usePvP] submitCode result:', result);
      
      if (result.success) {
        return result; // Return full result with success and message
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      console.error('[usePvP] submitCode error:', err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Complete match
  const completeMatch = useCallback(async (matchId, winnerId, xpChangeP1, xpChangeP2) => {
    setLoading(true);
    setError(null);
    try {
      const result = await pvpMatchService.completeMatch(matchId, winnerId, xpChangeP1, xpChangeP2);
      if (result.success) {
        setCurrentMatch(result.data);
        return result.data;
      } else {
        setError(result.message);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel match
  const cancelMatch = useCallback(async (matchId) => {
    console.log('[usePvP] cancelMatch called with:', matchId);
    setLoading(true);
    setError(null);
    try {
      const result = await pvpMatchService.cancelMatch(matchId);
      console.log('[usePvP] cancelMatch result:', result);
      
      if (result.success) {
        setCurrentMatch(null);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      console.error('[usePvP] cancelMatch error:', err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle player disconnect
  const playerDisconnect = useCallback(async (matchId) => {
    console.log('[usePvP] playerDisconnect called with:', matchId);
    setLoading(true);
    setError(null);
    try {
      const result = await pvpMatchService.playerDisconnect(matchId);
      console.log('[usePvP] playerDisconnect result:', result);
      
      if (result.success) {
        setCurrentMatch(null);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      console.error('[usePvP] playerDisconnect error:', err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    problems,
    matches,
    currentMatch,
    activeMatch,
    searchingMatches,
    loading,
    error,

    // Problem operations
    loadProblems,
    getRandomProblem,
    getProblemById,

    // Match operations
    loadUserMatches,
    getUserMatches,
    loadUserMatchesByStatus,
    loadActiveMatch,
    loadSearchingMatches,
    getSearchingMatches,
    getMatchById,
    getMatchByIdForPolling,
    createMatch,
    joinQueue,
    joinMatch,
    submitCode,
    completeMatch,
    cancelMatch,
    playerDisconnect,

    // Utilities
    clearError,
  };
};
