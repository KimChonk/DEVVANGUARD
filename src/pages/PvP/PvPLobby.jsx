import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePvP } from '../../hooks/usePvP';
import { useUserProfile, useUserStats } from '../../hooks/useUser';
import SuccessNotification from '../../components/SuccessNotification';
import AlertNotification from '../../components/AlertNotification';
import LoadingScreen from '../../components/LoadingScreen';
import '../../assets/CSS/pvplobby.css';

const POLL_INTERVAL = 2000;
const COUNTDOWN_TIME = 5;

export default function PvPLobby() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const { stats, loading: statsLoading } = useUserStats();
  const {
    joinQueue,
    getSearchingMatches,
    getUserMatches,
    cancelMatch,
    getMatchById,
    loading: pvpLoading
  } = usePvP();

  const [user, setUser] = useState({
    name: 'Player',
    avatar: '/images/avatars/default-avatar.jpg',
    xp: 0,
    userId: null
  });

  const [isSearching, setIsSearching] = useState(false);
  const [currentMatchId, setCurrentMatchId] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [showMatchFound, setShowMatchFound] = useState(false);
  const [opponentInfo, setOpponentInfo] = useState(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessNotif, setShowSuccessNotif] = useState(false);
  const [showErrorNotif, setShowErrorNotif] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (profile) {
      setUser((prev) => ({
        ...prev,
        name: profile.fullName || profile.email || 'Player',
        avatar: profile.avatarName
          ? `/images/avatars/${profile.avatarName}`
          : '/images/avatars/default-avatar.jpg',
        userId: profile.user_id || profile.id
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (stats) {
      setUser((prev) => ({
        ...prev,
        xp: parseInt(stats.xp) || 0
      }));
    }
  }, [stats]);

  useEffect(() => {
    if (!user.userId) return;

    const loadHistory = async () => {
      try {
        const matches = await getUserMatches();
        if (matches && Array.isArray(matches)) {
          setMatchHistory(
            matches
              .filter(m => m.status === 'completed' || m.status === 'cancelled')
              .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))
              .slice(0, 10)
          );
        }
      } catch (err) {
        console.error('Failed to load match history:', err);
      }
    };
    loadHistory();
  }, [user.userId, getUserMatches]);

  useEffect(() => {
    if (!isSearching) return;

    const pollInterval = setInterval(async () => {
      try {
        const searchingMatches = await getSearchingMatches();
        if (searchingMatches && searchingMatches.length > 0) {
          const matchToJoin = searchingMatches[0];
          
          const result = await joinQueue(matchToJoin.matchId);
          if (result && result.matchId) {
            setCurrentMatchId(result.matchId);
            setIsSearching(false);
            setShowMatchFound(true);
            setCountdown(COUNTDOWN_TIME);

            const isPlayer1 = result.player1Id === user.userId;
            const opponent = isPlayer1 ? result.player2Id : result.player1Id;
            const opponentName = isPlayer1 ? 'Opponent' : 'Opponent';
            
            setOpponentInfo({
              name: opponentName,
              userId: opponent
            });

            setSuccessMessage('');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(pollInterval);
  }, [isSearching, getSearchingMatches, joinQueue, user.userId]);

  useEffect(() => {
    if (!showMatchFound || !currentMatchId) return;

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate(`/pvp/battle/${currentMatchId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [showMatchFound, currentMatchId, navigate]);

  const handleFindMatch = async () => {
    if (!user.userId) {
      setErrorMessage('User not loaded. Please refresh the page.');
      setShowErrorNotif(true);
      return;
    }

    try {
      setIsSearching(true);
      setSuccessMessage('Searching for opponent in your XP range...');
      setShowSuccessNotif(true);
      
      const result = await joinQueue();
      if (result && result.matchId) {
        setCurrentMatchId(result.matchId);
        setSuccessMessage('Created match. Waiting for opponent...');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to search for match');
      setShowErrorNotif(true);
      setIsSearching(false);
    }
  };

  const handleCancelSearch = async () => {
    try {
      if (currentMatchId) {
        await cancelMatch(currentMatchId);
      }
      setIsSearching(false);
      setCurrentMatchId(null);
      setShowMatchFound(false);
      setCountdown(COUNTDOWN_TIME);
      setSuccessMessage('');
    } catch (err) {
      setErrorMessage('Failed to cancel search');
      setShowErrorNotif(true);
    }
  };

  const formatMatchTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getMatchResult = (match) => {
    if (match.status === 'completed') {
      return match.winnerId === user.userId ? 'Won' : 'Lost';
    }
    return match.status?.toUpperCase() || 'UNKNOWN';
  };

  const getStatusClass = (match) => {
    if (match.status === 'completed') {
      return match.winnerId === user.userId ? 'won' : 'lost';
    }
    return match.status || 'unknown';
  };

  if (profileLoading || statsLoading) {
    return <LoadingScreen />;
  }

  if (pvpLoading && isSearching) {
    return <LoadingScreen />;
  }

  if (isNavigating) {
    return <LoadingScreen />;
  }

  const handleBackClick = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate(-1);
    }, 500);
  };

  return (
    <div className="pvp-lobby-container">
      <div className="pvp-lobby-header">
        <button
          className="pvp-back-button"
          onClick={handleBackClick}
          title="Go back"
        >
          &larr; Back
        </button>
        <h1 className="pvp-page-title">Battle PvP</h1>
        <div style={{ width: '100px' }} />
      </div>

      <div className="pvp-lobby-wrapper">
        {/* Left Section - Profile */}
        <div className="pvp-lobby-left">
          <div className="pvp-profile-card">
            <img
              src={user.avatar}
              alt={user.name}
              className="pvp-profile-avatar"
              onError={(e) => {
                e.target.src = '/images/avatars/default-avatar.jpg';
              }}
            />
            <h2 className="pvp-profile-name">{user.name}</h2>
            <p className="pvp-profile-level">Challenger</p>

            <div className="pvp-profile-xp">
              <div className="pvp-xp-item">
                <div className="pvp-xp-value">{user.xp}</div>
                <div className="pvp-xp-label">Total XP</div>
              </div>
              <div className="pvp-xp-item">
                <div className="pvp-xp-value">{matchHistory.length}</div>
                <div className="pvp-xp-label">Matches</div>
              </div>
            </div>

            <button
              className="pvp-find-button"
              onClick={isSearching ? handleCancelSearch : handleFindMatch}
              disabled={pvpLoading}
              style={{
                background: isSearching ? '#ef4444' : undefined,
                marginTop: '20px'
              }}
            >
              {isSearching ? 'Cancel Search' : 'Find Match'}
            </button>
          </div>
        </div>

        {/* Right Section - Match History */}
        <div className="pvp-lobby-right">
          <h3 className="pvp-history-title">Match History</h3>
          {matchHistory.length === 0 ? (
            <div className="pvp-empty-history">
              No matches yet. Start your first battle!
            </div>
          ) : (
            <div className="pvp-history-list">
              {matchHistory.map((match) => (
                <div key={match.matchId} className="pvp-match-card">
                  <div className="pvp-match-header">
                    <span className="pvp-match-date">
                      {formatMatchTime(match.completedAt)}
                    </span>
                    <span className={`pvp-match-status ${getStatusClass(match)}`}>
                      {getMatchResult(match)}
                    </span>
                  </div>
                  <div className="pvp-match-result">
                    <div className="pvp-result-item">
                      <div className="pvp-result-label">XP Change</div>
                      <div className={`pvp-result-value ${match.winnerId === user.userId ? 'positive' : 'negative'}`}>
                        {match.winnerId === user.userId
                          ? `+${match.xpChangeP1 || match.xpChangeP2 || 0}`
                          : `${match.xpChangeP1 || match.xpChangeP2 || 0}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Match Found Modal */}
      {showMatchFound && currentMatchId && (
        <div className="pvp-notification">
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '20px', color: '#ffd700' }}>
              Match Found!
            </h2>
            <div style={{ marginBottom: '24px', color: '#e2e8f0' }}>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                Opponent Found
              </div>
              <div style={{ fontSize: '14px', color: '#a0aec0' }}>
                Entering battle in...
              </div>
            </div>
            <div style={{
              fontSize: '48px',
              fontWeight: '700',
              color: '#00d4ff',
              fontFamily: 'monospace',
              marginBottom: '20px',
              animation: 'pulse 1s ease-in-out infinite'
            }}>
              {countdown}
            </div>
            <button
              onClick={handleCancelSearch}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {showSuccessNotif && (
        <SuccessNotification
          message={successMessage}
          onClose={() => setShowSuccessNotif(false)}
        />
      )}

      {showErrorNotif && (
        <AlertNotification
          message={errorMessage}
          onClose={() => setShowErrorNotif(false)}
        />
      )}
    </div>
  );
}
