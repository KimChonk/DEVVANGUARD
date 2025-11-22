import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePvP } from '../../hooks/usePvP';
import { useUserProfile, useUserStats } from '../../hooks/useUser';
import { useCourses } from '../../hooks/useCourses';
import SuccessNotification from '../../components/SuccessNotification';
import AlertNotification from '../../components/AlertNotification';
import LoadingScreen from '../../components/LoadingScreen';
import '../../assets/CSS/pvplobby.css';
import '../../assets/CSS/mainmenu.css';

const POLL_INTERVAL = 2000;
const COUNTDOWN_TIME = 5;
const SEARCH_TIMEOUT = 60000;

export default function PvPLobby() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const { stats, loading: statsLoading } = useUserStats();
  const { courses, loading: coursesLoading } = useCourses();
  const {
    joinQueue,
    getMatchByIdForPolling,
    getUserMatches,
    cancelMatch,
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
  const [showLearnDropdown, setShowLearnDropdown] = useState(false);

  useEffect(() => {
    if (profile) {
      console.log('[PvPLobby] Profile received:', profile);
      setUser((prev) => ({
        ...prev,
        name: profile.fullName || profile.full_name || profile.email || 'Player',
        avatar: (profile.avatarName || profile.avatar_name)
          ? `/images/avatars/${profile.avatarName || profile.avatar_name}`
          : '/images/avatars/default-avatar.jpg',
        userId: profile.userId || profile.user_id || profile.id
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
    if (!currentMatchId || !isSearching) return;

    const pollInterval = setInterval(async () => {
      try {
        const result = await getMatchByIdForPolling(currentMatchId);
        if (result && result.success) {
          const match = result.data;
          
          if (match.status === 'in_progress' && match.player2Id) {
            console.log('[PvPLobby] Opponent found! Match status: in_progress');
            setIsSearching(false);
            setShowMatchFound(true);
            setCountdown(COUNTDOWN_TIME);
            
            const isPlayer1 = match.player1Id === user.userId;
            const opponent = isPlayer1 ? match.player2Id : match.player1Id;
            
            setOpponentInfo({
              name: 'Opponent',
              userId: opponent
            });
          }
        }
      } catch (err) {
        // Silently fail on poll errors
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [isSearching, currentMatchId, getMatchByIdForPolling, user.userId]);

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
    try {
      console.log('[PvP] handleFindMatch started');
      
      if (!user.userId) {
        console.log('[PvP] User not loaded:', user);
        setErrorMessage('User not loaded. Please refresh the page.');
        setShowErrorNotif(true);
        return;
      }

      console.log('[PvP] Setting isSearching=true');
      setIsSearching(true);
      setSuccessMessage('');
      setShowSuccessNotif(false);
      
      console.log('[PvP] Starting matchmaking request...', { userId: user.userId, xp: user.xp });
      
      // Call joinQueue
      const response = await joinQueue();
      console.log('[PvP] Matchmaking response:', response);

      // FIX: Check if has matchId instead of checking .success
      if (response && response.matchId) {
        // SUCCESS - Got a match!
        console.log('[PvP] Got match with ID:', response.matchId);
        
        setCurrentMatchId(response.matchId);
        
        // If waiting for opponent
        if (response.status === 'searching') {
          console.log('[PvP] Status: searching, waiting for opponent...');
          // Polling will handle finding opponent
        } 
        // If found opponent immediately
        else if (response.status === 'in_progress') {
          console.log('[PvP] Status: in_progress, opponent found!');
          setShowMatchFound(true);
          setCountdown(COUNTDOWN_TIME);
          setSuccessMessage('Match found! Entering battle...');
          setShowSuccessNotif(true);
        }
      } else {
        // NO matchId - this is an error
        throw new Error('Failed to join queue: No match ID returned');
      }

    } catch (error) {
      console.error('[PvP] Matchmaking error caught:', error);
      console.error('[PvP] Error message:', error?.message);
      setErrorMessage(error?.message || 'Failed to find match');
      setShowErrorNotif(true);
      setIsSearching(false);
    }
  };

  const handleCancelSearch = async () => {
    try {
      console.log('[PvP] Cancelling search...');
      
      const matchIdToCancel = currentMatchId;
      
      // Stop polling immediately by clearing state
      setIsSearching(false);
      setCurrentMatchId(null);
      setShowMatchFound(false);
      
      // Then delete the match from database
      if (matchIdToCancel) {
        console.log('[PvP] Deleting match:', matchIdToCancel);
        await cancelMatch(matchIdToCancel);
      }
      
      console.log('[PvP] Search cancelled successfully');
      setCountdown(COUNTDOWN_TIME);
      setSuccessMessage('');
      setErrorMessage('');
      setShowErrorNotif(false);
    } catch (err) {
      console.error('[PvP] Cancel search error:', err);
      setErrorMessage('Failed to cancel search: ' + (err?.message || 'Unknown error'));
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

  const handleCourseClick = (courseId, courseName) => {
    navigate(`/course/${courseId}`, { state: { courseName } });
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
    <div className="pvp-lobby-page-container">
      <LoadingScreen isVisible={isNavigating} message="Loading..." />
      
      {/* Navigation */}
      <nav className="main-navbar">
        <div className="main-nav-container">
          <div className="main-nav-left">
            <a className="logo-link" onClick={() => navigate("/main-menu")}>
              <div className="main-nav-logo">
                <img
                  src="/icons/knight_icon.png"
                  alt="Knight Icon"
                  className="main-logo-icon"
                />
                <span className="main-logo-text">
                  Dev <span className="main-highlight">Vanguard</span>
                </span>
              </div>
            </a>

            <ul className="main-nav-links">
              <li 
                className="nav-dropdown"
                onMouseEnter={() => setShowLearnDropdown(true)}
              >
                <a 
                  className="dropdown-toggle"
                >
                  Learn <i className="fas fa-chevron-down"></i>
                </a>
                {showLearnDropdown && (
                  <div 
                    className="dropdown-menu learn-dropdown"
                    onMouseLeave={() => setShowLearnDropdown(false)}
                  >
                    <div className="dropdown-content">
                      <div className="dropdown-left">
                        <h4 className="dropdown-title">Recommended</h4>
                        <div className="recommended-courses">
                          {courses && courses.length > 0 && courses.slice(0, 2).map((course) => (
                            <div 
                              key={course.courseId} 
                              className="recommended-item"
                              onClick={() => {
                                handleCourseClick(course.courseId, course.name);
                                setShowLearnDropdown(false);
                              }}
                            >
                              <div className="recommended-info">
                                <span className="recommended-name">{course.name}</span>
                                <span className="recommended-lang">{course.language}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="dropdown-right">
                        <h4 className="dropdown-title">All Courses</h4>
                        <div className="courses-list">
                          {courses && courses.length > 0 && courses.map((course) => (
                            <a 
                              key={course.courseId}
                              className="course-list-item"
                              onClick={() => {
                                handleCourseClick(course.courseId, course.name);
                                setShowLearnDropdown(false);
                              }}
                            >
                              <span className="course-list-name">{course.name}</span>
                              <span className="course-list-lang">{course.language}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>
              <li>
                <a onClick={() => navigate("/leaderboards")}>
                  Leaderboards
                </a>
              </li>
              <li>
                <a onClick={() => alert("Practice mode coming soon!")}>
                  Practice
                </a>
              </li>
              <li>
                <a className="nav-active">
                  Battle PvP
                </a>
              </li>
            </ul>
          </div>
          <div className="main-nav-right">
            <button className="nav-icon-btn notification-btn" onClick={() => alert("No new notifications")}>
              <i className="fas fa-bell"></i>
              <span className="notification-badge">3</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="pvp-lobby-container">
        {/* Hero Section */}
        <div className="pvp-hero-section" style={{
          backgroundImage: `url('/images/pvp_background.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
          <div className="pvp-hero-overlay"></div>
          <div className="pvp-hero-content">
            <h1 className="pvp-hero-title">The Knight's Duel</h1>
            <p className="pvp-hero-description">
              Challenge other players, test your skills, and climb the rankings!
            </p>
            <button
              className="pvp-hero-cta"
              onClick={() => {
                console.log('[Button] ENTER BATTLE clicked!');
                console.log('[Button] User:', user);
                console.log('[Button] isSearching:', isSearching);
                handleFindMatch();
              }}
              disabled={isSearching || pvpLoading}
            >
              {isSearching ? 'Searching...' : 'Enter Battle'}
            </button>
          </div>
        </div>

        {/* Main Content - Left: Match History, Right: Profile */}
        <div className="pvp-lobby-wrapper">
          {/* Left Section - Match History */}
          <div className="pvp-lobby-left">
            <div className="pvp-history-panel-new">
              <div className="pvp-history-header-new">
                <h3 className="pvp-history-title">Match History</h3>
              </div>
              {matchHistory.length === 0 ? (
                <div className="pvp-empty-history">
                  No matches yet. Start your first battle!
                </div>
              ) : (
                <div className="pvp-history-list-container-new">
                  <div className="pvp-history-list">
                    {matchHistory.map((match) => {
                      const isPlayer1 = match.player1Id === user.userId;
                      const xpChange = isPlayer1 ? match.xpChangeP1 : match.xpChangeP2;
                      const isWin = match.winnerId === user.userId;
                      return (
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
                              <div className={`pvp-result-value ${isWin ? 'positive' : 'negative'}`}>
                                {xpChange || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Profile Card */}
          <div className="pvp-lobby-right">
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

              {isSearching && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #3b82f6'
                }}>
                  <div style={{ fontSize: '14px', color: '#3b82f6', marginBottom: '8px' }}>
                    Searching for opponent...
                  </div>
                  <div style={{ fontSize: '12px', color: '#93c5fd', marginTop: '8px' }}>
                    XP Range: {user.xp - 50} - {user.xp + 50}
                  </div>
                  <button
                    onClick={handleCancelSearch}
                    style={{
                      marginTop: '12px',
                      padding: '8px 16px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Cancel Search
                  </button>
                </div>
              )}

              {!isSearching && (
                <>
                  <button
                    className="pvp-find-button"
                    onClick={handleFindMatch}
                    disabled={pvpLoading}
                    style={{
                      marginTop: '20px'
                    }}
                  >
                    Find Match
                  </button>
                  <button
                    className="view-profile-btn"
                    onClick={() => navigate('/profile')}
                  >
                    View Profile
                  </button>
                </>
              )}
            </div>
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
    </div>
  );
}
