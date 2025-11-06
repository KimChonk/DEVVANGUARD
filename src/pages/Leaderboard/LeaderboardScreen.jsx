import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../../hooks/useUser';
import { userService } from '../../services/apiClient';
import LoadingScreen from '../../components/LoadingScreen';
import '../../assets/CSS/leaderboard.css';

export default function LeaderboardScreen() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch leaderboard data from API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📊 Fetching leaderboard data...');
        
        // Create a new method in userService or use direct apiCall
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5131'}/api/user/leaderboard/top?limit=10`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'omit'
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          console.log('✅ Leaderboard fetched:', result.data);
          // Ensure we have exactly 10 slots, fill empty ones with "Anonymous"
          const leaderboardArray = Array.isArray(result.data) ? result.data : [];
          while (leaderboardArray.length < 10) {
            leaderboardArray.push(null); // null represents anonymous slot
          }
          setLeaderboardData(leaderboardArray);
        } else {
          console.error('❌ Failed to fetch leaderboard:', result.message);
          setError(result.message || 'Failed to load leaderboard');
        }
      } catch (err) {
        console.error('❌ Error fetching leaderboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <LoadingScreen isVisible={true} message="Đang tải bảng xếp hạng..." />;
  }

  return (
    <div className="leaderboard-page">
      {/* Header */}
      <header className="leaderboard-header">
        <div className="leaderboard-header-content">
          <button className="back-btn" onClick={() => navigate("/main-menu")}>
            ← Back
          </button>
          <div className="header-title">
            <h1>🏆 Leaderboard</h1>
            <p>Top 10 Knights by Experience</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="leaderboard-container">
        {error ? (
          <div className="error-container">
            <p className="error-message">❌ {error}</p>
            <button onClick={() => navigate("/main-menu")}>Return to Menu</button>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="no-data">
            <p>No leaderboard data available</p>
          </div>
        ) : (
          <ul className="leaderboard-list">
            {leaderboardData.map((user, index) => (
              <li 
                key={index} 
                className={`leaderboard-item ${user && profile?.user_id === user.userId ? 'current-user' : ''} ${!user ? 'anonymous' : ''}`}
              >
                {/* Rank with Medal */}
                <div className="rank-section">
                  <span className="rank-number">#{index + 1}</span>
                  {index < 3 && user && (
                    <span className="medal">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="user-info-section">
                  {user ? (
                    <>
                      <img 
                        src={`/images/avatars/${user.avatarName || 'default-avatar.jpg'}`}
                        alt={user.fullName}
                        className="user-avatar"
                        onError={(e) => {
                          e.target.src = '/images/avatars/default-avatar.jpg';
                        }}
                      />
                      <h3 className="user-name">
                        {user.fullName || 'Knight'}
                      </h3>
                    </>
                  ) : (
                    <>
                      <div className="user-avatar anonymous-avatar">?</div>
                      <h3 className="user-name anonymous-name">Vẫn đang ẩn danh</h3>
                    </>
                  )}
                </div>

                {/* Stats */}
                {user ? (
                  <>
                    <div className="stat">
                      <div className="stat-value">{user.xp || 0}</div>
                      <div className="stat-label">XP</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">{user.totalLessonsCompleted || 0}</div>
                      <div className="stat-label">Lessons</div>
                    </div>
                    <div className="stat">
                      <span className="rank-badge">{user.rankTitle || 'Newbie'}</span>
                      <div className="stat-label">Level</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="stat">
                      <div className="stat-value">-</div>
                      <div className="stat-label">XP</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">-</div>
                      <div className="stat-label">Lessons</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">-</div>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}