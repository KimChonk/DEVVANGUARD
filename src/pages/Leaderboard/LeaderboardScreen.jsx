// src/pages/Leaderboard/LeaderboardScreen.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/CSS/leaderboardscreen.css'; // Chúng ta sẽ tạo file này ở bước 2
import Navbar from '../../components/navbar.jsx';
import '../../assets/CSS/leaderboardscreen.css'; 
import '../../assets/CSS/mainmenu.css';


export default function LeaderboardScreen() {
  const navigate = useNavigate();
  // State để quản lý tab "Weekly" và "All Time"
  const [activeTab, setActiveTab] = useState('all-time');
  
  // User info for navigation
  const [user] = useState({
    name: "Knight Coder",
    avatar: "/icons/knight_icon.png"
  });

  // Dữ liệu mẫu cho bảng xếp hạng - sử dụng avatar mặc định
  const leaderboardData = [
    { rank: 1, name: 'AI_HACKER_OF_CODE_X', handle: '@SebastianL121', xp: 8600, avatar: '/icons/knight_icon.png', isVerified: false },
    { rank: 2, name: 'Ezardio', handle: '@Ezardio74', xp: 8125, avatar: '/icons/knight_icon.png', isVerified: true },
    { rank: 3, name: 'Saipriyank', handle: '@Saipriyank', xp: 8095, avatar: '/icons/knight_icon.png', isVerified: true },
    { rank: 4, name: 'Jakub Sova', handle: '@owljacob', xp: 7405, avatar: '/icons/knight_icon.png', isVerified: false },
    { rank: 5, name: 'Mer', handle: '@M3R14M', xp: 7070, avatar: '/icons/knight_icon.png', isVerified: false },
    { rank: 6, name: 'L. Kolberg', handle: '@Rdbr', xp: 6610, avatar: '/icons/knight_icon.png', isVerified: true },
    { rank: 7, name: 'Valérie', handle: '@adorkababe', xp: 6605, avatar: '/icons/knight_icon.png', isVerified: true },
    { rank: 8, name: 'Alex', handle: '@Roboticist', xp: 6605, avatar: '/icons/knight_icon.png', isVerified: true },
    { rank: 9, name: 'Knight Coder', handle: '@you', xp: 850, avatar: '/icons/knight_icon.png', isVerified: false, isCurrentUser: true },
  ];

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-background"></div>

      {/* Navigation Header */}
      <nav className="leaderboard-navbar">
        <div className="nav-container">
          <div className="nav-left">
            <div className="nav-logo" onClick={() => navigate("/main-menu")}>
              <img
                src="/icons/knight_icon.png"
                alt="Knight Icon"
                className="logo-icon"
              />
              <span className="logo-text">
                Dev <span className="highlight">Vanguard</span>
              </span>
            </div>
            
            <ul className="nav-links">
              <li><a onClick={() => navigate("/main-menu")}>Courses</a></li>
              <li><a onClick={() => navigate("/dashboard")}>Dashboard</a></li>
              <li><a onClick={() => navigate("/leaderboards")} className="active">Leaderboards</a></li>
            </ul>
          </div>
          
          <div className="nav-right">
            <button className="avatar-btn" onClick={() => navigate("/profile")}>
              <img 
                src={user.avatar} 
                alt="User Avatar" 
                className="user-avatar"
                onError={(e) => {
                  e.target.src = "/icons/knight_icon.png";
                }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <header className="leaderboard-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="fas fa-trophy"></i>
          </div>
          <div className="header-text">
            <h1 className="leaderboard-title">Leaderboards</h1>
            <p className="leaderboard-subtitle">Compete with other code knights and rise to the top! ⚔️</p>
          </div>
  // --- TOÀN BỘ STATE VÀ HÀM CỦA NAVBAR ĐÃ BỊ XÓA KHỎI ĐÂY ---
  // (isLearnMenuOpen, isMobileMenuOpen, toggleMobileMenu, handleLogout, v.v.)

  // Dữ liệu mẫu cho bảng xếp hạng (Giữ nguyên)
  const leaderboardData = [
    { rank: 1, name: 'Lập Trình Viên Dạo', handle: '@laptrinhviendao', xp: 8600, avatar: '/images/avatars/avatar1.png', isVerified: false },
    { rank: 2, name: 'Nguyễn Minh Anh', handle: '@minhanh_99', xp: 8125, avatar: '/images/avatars/avatar2.png', isVerified: true },
    { rank: 3, name: 'Trần Quốc Hùng', handle: '@hung_tran_coder', xp: 8095, avatar: '/images/avatars/avatar3.png', isVerified: true },
    { rank: 4, name: 'Lê Thị Thảo Linh', handle: '@thaolinh_le', xp: 7405, avatar: '/images/avatars/avatar4.png', isVerified: false },
    { rank: 5, name: 'Gấu Béo', handle: '@gaubeo_it', xp: 7070, avatar: '/images/avatars/avatar5.png', isVerified: false },
    { rank: 6, name: 'Phạm Gia Bảo', handle: '@baopham_dev', xp: 6610, avatar: '/images/avatars/avatar6.png', isVerified: true },
    { rank: 7, name: 'Vy Vy', handle: '@vyvy_xinh', xp: 6605, avatar: '/images/avatars/avatar7.png', isVerified: true },
    { rank: 8, name: 'Hoàng Tuấn', handle: '@tuanhoang_247', xp: 6605, avatar: '/images/avatars/avatar8.png', isVerified: true }
  ];

  return (
    <>
      <Navbar />
    

      <div className="leaderboard-container">
        <header className="leaderboard-header">
          <img src="/images/cup_leaderboard.png" alt="Trophy" className="trophy-icon" />
          <div className="header-text">
            <h1 className="leaderboard-title">Leaderboards</h1>
            <p className="leaderboard-subtitle">Compete with other users and rise to the top ٩(｡•́‿•̀｡)۶</p>
          </div>
        </header>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`tab ${activeTab === 'all-time' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-time')}
          >
            All Time
          </button>
        </div>

        <ol className="leaderboard-list">
          {leaderboardData.map((user, index) => (
            <li key={index} className="leaderboard-item">
              <span className="rank">{index + 1}</span>
              <img src={user.avatar} alt={`${user.name}'s avatar`} className="avatar" />
              <div className="user-info">
                <h3 className="user-name">
                  {user.name}
                </h3>
                <p className="user-handle">{user.handle}</p>
              </div>
              <span className="xp">{user.xp} XP</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="leaderboard-content">
        <ol className="leaderboard-list">
          {leaderboardData.map((player, index) => (
            <li key={index} className={`leaderboard-item ${player.isCurrentUser ? 'current-user' : ''}`}>
              <div className="rank-section">
                <span className="rank">#{player.rank}</span>
                {player.rank <= 3 && (
                  <div className="medal">
                    {player.rank === 1 && <i className="fas fa-crown gold"></i>}
                    {player.rank === 2 && <i className="fas fa-medal silver"></i>}
                    {player.rank === 3 && <i className="fas fa-medal bronze"></i>}
                  </div>
                )}
              </div>
              
              <div className="avatar-section">
                <img 
                  src={player.avatar} 
                  alt={`${player.name}'s avatar`} 
                  className="avatar"
                  onError={(e) => {
                    e.target.src = "/icons/knight_icon.png";
                  }}
                />
              </div>
              
              <div className="user-info">
                <h3 className="user-name">
                  {player.name}
                  {player.isVerified && <i className="fas fa-shield-alt verified-badge"></i>}
                  {player.isCurrentUser && <span className="you-label">(You)</span>}
                </h3>
                <p className="user-handle">{player.handle}</p>
              </div>
              
              <div className="xp-section">
                <span className="xp">{player.xp.toLocaleString()}</span>
                <span className="xp-label">XP</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
    </>
  );
}