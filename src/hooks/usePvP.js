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
    setLoading(true);
    setError(null);
    try {
      const result = await pvpProblemService.getProblemById(problemId);
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

  // Join queue (create new match in queue, not join existing)
  const joinQueue = useCallback(async () => {
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

  // Join match (deprecated, use joinQueue instead)
  const joinMatch = useCallback(async (matchId) => {
    return joinQueue(matchId);
  }, [joinQueue]);

  // Submit code
  const submitCode = useCallback(async (matchId, code) => {
    setLoading(true);
    setError(null);
    try {
      const result = await pvpMatchService.submitCode(matchId, code);
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
    setLoading(true);
    setError(null);
    try {
      const result = await pvpMatchService.cancelMatch(matchId);
      if (result.success) {
        setCurrentMatch(null);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
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
    createMatch,
    joinQueue,
    joinMatch,
    submitCode,
    completeMatch,
    cancelMatch,

    // Utilities
    clearError,
  };
};
