// src/pages/Leaderboard/LeaderboardScreen.jsx

import React, { useState } from 'react';
import '../../assets/CSS/leaderboardscreen.css'; // Chúng ta sẽ tạo file này ở bước 2

export default function LeaderboardScreen() {
  // State để quản lý tab "Weekly" và "All Time"
  const [activeTab, setActiveTab] = useState('all-time');

  // Dữ liệu mẫu cho bảng xếp hạng
  const leaderboardData = [
    { rank: 1, name: 'AI_HACKER_OF_CODE_X', handle: '@SebastianL121', xp: 8600, avatar: '/images/avatars/default.png', isVerified: false },
    { rank: 2, name: 'Ezardio', handle: '@Ezardio74', xp: 8125, avatar: '/images/avatars/avatar2.png', isVerified: true },
    { rank: 3, name: 'Saipriyank', handle: '@Saipriyank', xp: 8095, avatar: '/images/avatars/avatar3.png', isVerified: true },
    { rank: 4, name: 'Jakub Sova', handle: '@owljacob', xp: 7405, avatar: '/images/avatars/avatar4.png', isVerified: false },
    { rank: 5, name: 'Mer', handle: '@M3R14M', xp: 7070, avatar: '/images/avatars/avatar5.png', isVerified: false },
    { rank: 6, name: 'L. Kolberg', handle: '@Rdbr', xp: 6610, avatar: '/images/avatars/avatar6.png', isVerified: true },
    { rank: 7, name: 'Valérie', handle: '@adorkababe', xp: 6605, avatar: '/images/avatars/avatar7.png', isVerified: true },
    { rank: 8, name: 'Alex', handle: '@Roboticist', xp: 6605, avatar: '/images/avatars/avatar8.png', isVerified: true },
  ];

  return (
    <div className="leaderboard-container">
      <header className="leaderboard-header">
        <img src="/icons/trophy-icon.png" alt="Trophy" className="trophy-icon" />
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
                {user.isVerified && <i className="fas fa-shield-alt verified-badge"></i>}
              </h3>
              <p className="user-handle">{user.handle}</p>
            </div>
            <span className="xp">{user.xp} XP</span>
          </li>
        ))}
      </ol>
    </div>
  );
}