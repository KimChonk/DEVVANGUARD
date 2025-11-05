import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/navbar';
import LoadingScreen from '../../components/LoadingScreen';
import '../../assets/CSS/leaderboard.css';

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all-time');

  // Fetch leaderboard data from API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📊 Fetching leaderboard data...');
        
        // Fetch từ API
        const response = await fetch('http://localhost:5131/api/users/leaderboard?limit=100');
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log('✅ Leaderboard fetched:', result.data);
          setLeaderboardData(result.data);
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
  }, [activeTab]);

  if (loading) {
    return (
      <div className="leaderboard-screen">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>⏳ Đang tải bảng xếp hạng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-screen">
        <Navbar />
        <div className="error-container">
          <h2>❌ Lỗi</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-screen">
      <Navbar />

      <div className="leaderboard-container">
        {/* Header */}
        <header className="leaderboard-header">
          <div className="header-icon">
            🏆
          </div>
          <div className="header-text">
            <h1 className="leaderboard-title">Bảng Xếp Hạng</h1>
            <p className="leaderboard-subtitle">Cạnh tranh với các Knight khác và chinh phục đỉnh cao! ⚔️</p>
          </div>
        </header>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            Tuần Này
          </button>
          <button 
            className={`tab ${activeTab === 'all-time' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-time')}
          >
            Toàn Thời Gian
          </button>
        </div>

        {/* Leaderboard List */}
        <div className="leaderboard-content">
          {leaderboardData.length === 0 ? (
            <div className="no-data">
              <p>Không có dữ liệu xếp hạng</p>
            </div>
          ) : (
            <ol className="leaderboard-list">
              {leaderboardData.map((userData, index) => (
                <li key={userData.user_id || index} className={`leaderboard-item ${user?.id === userData.user_id ? 'current-user' : ''}`}>
                  <div className="rank-section">
                    <span className="rank">#{index + 1}</span>
                    {index < 3 && (
                      <div className="medal">
                        {index === 0 && <span className="medal-icon gold">🥇</span>}
                        {index === 1 && <span className="medal-icon silver">🥈</span>}
                        {index === 2 && <span className="medal-icon bronze">🥉</span>}
                      </div>
                    )}
                  </div>
                  
                  <div className="avatar-section">
                    <img 
                      src={userData.avatar_url || '/icons/knight_icon.png'} 
                      alt={userData.full_name}
                      className="avatar"
                      onError={(e) => {
                        e.target.src = '/icons/knight_icon.png';
                      }}
                    />
                  </div>
                  
                  <div className="user-info">
                    <h3 className="user-name">
                      {userData.full_name || 'Knight'}
                      {userData.role === 'admin' && <span className="admin-badge">👑</span>}
                      {user?.id === userData.user_id && <span className="you-badge">(You)</span>}
                    </h3>
                    <p className="user-email">{userData.email}</p>
                  </div>

                  <div className="stats-section">
                    <div className="stat">
                      <span className="stat-label">XP</span>
                      <span className="stat-value">{userData.total_xp || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Hoàn Thành</span>
                      <span className="stat-value">{userData.lessons_completed || 0}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}