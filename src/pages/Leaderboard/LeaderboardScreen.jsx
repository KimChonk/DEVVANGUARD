// src/pages/Leaderboard/LeaderboardScreen.jsx

import React, { useState } from 'react';
import Navbar from '../../components/navbar.jsx';
import '../../assets/CSS/leaderboardscreen.css'; 
import '../../assets/CSS/mainmenu.css';


export default function LeaderboardScreen() {
  // State để quản lý tab "Weekly" và "All Time"
  const [activeTab, setActiveTab] = useState('all-time');

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
    </>
  );
}