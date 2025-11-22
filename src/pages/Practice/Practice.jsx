import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile, useUserStats, useUserRank } from '../../hooks/useUser';
import SharedNavbar from '../../components/SharedNavbar';
import '../../assets/CSS/practice.css';

const Practice = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const { stats, loading: statsLoading } = useUserStats();
  const { rankData, loading: rankLoading } = useUserRank();

  const [user, setUser] = useState({
    name: 'Knight Coder',
    avatar: '/images/avatars/default-avatar.jpg',
    level: 'Beginner',
    currentXP: 850,
    totalLessonsCompleted: 0,
  });

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showLearnDropdown, setShowLearnDropdown] = useState(false);

  // Sample lesson data
  const allLessons = [
    { id: 1, title: 'Introduction to Arrays', difficulty: 'Easy', acceptance: '45.2%', solved: true, xpBonus: 10 },
    { id: 2, title: 'Binary Search', difficulty: 'Medium', acceptance: '32.1%', solved: true, xpBonus: 20 },
    { id: 3, title: 'Dynamic Programming', difficulty: 'Hard', acceptance: '18.5%', solved: false, xpBonus: 30 },
    { id: 4, title: 'Recursion Basics', difficulty: 'Easy', acceptance: '52.3%', solved: true, xpBonus: 10 },
    { id: 5, title: 'Graph Algorithms', difficulty: 'Hard', acceptance: '22.1%', solved: false, xpBonus: 30 },
    { id: 6, title: 'String Manipulation', difficulty: 'Medium', acceptance: '38.7%', solved: false, xpBonus: 20 },
    { id: 7, title: 'Hash Tables', difficulty: 'Medium', acceptance: '41.2%', solved: true, xpBonus: 20 },
    { id: 8, title: 'Trees and BST', difficulty: 'Hard', acceptance: '25.6%', solved: false, xpBonus: 30 },
  ];

  useEffect(() => {
    if (profile) {
      setUser((prev) => ({
        ...prev,
        name: profile.fullName || profile.email || prev.name,
        avatar: profile.avatarName 
          ? `/images/avatars/${profile.avatarName}` 
          : `/images/avatars/default-avatar.jpg`,
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (stats) {
      setUser((prev) => ({
        ...prev,
        currentXP: parseInt(stats.xp) || 0,
      }));
    }
  }, [stats]);

  useEffect(() => {
    if (rankData) {
      setUser((prev) => ({
        ...prev,
        level: rankData.rank_title || prev.level,
        currentXP: rankData.xp || 0,
        totalLessonsCompleted: rankData.total_lessons_completed || 0,
      }));
    }
  }, [rankData]);

  const filteredLessons = selectedFilter === 'all' 
    ? allLessons 
    : allLessons.filter(lesson => lesson.difficulty.toLowerCase() === selectedFilter);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '#52c41a';
      case 'medium':
        return '#faad14';
      case 'hard':
        return '#f5222d';
      default:
        return '#1890ff';
    }
  };

  const handleLessonClick = (lessonId) => {
    navigate(`/practice/${lessonId}`);
  };

  return (
    <div className="practice-page">
      {/* Navbar */}
      <SharedNavbar />

      {/* Main Content */}
      <div className="practice-content-wrapper">
        {/* Left Section - Lesson List */}
        <div className="practice-left-section">
          <div className="practice-header">
            <h1 className="practice-title">
              Practice Problems
            </h1>
            <p className="practice-subtitle">Improve your coding skills</p>
          </div>

          {/* Filters */}
          <div className="practice-filters">
            <button
              className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('all')}
            >
              All ({allLessons.length})
            </button>
            <button
              className={`filter-btn ${selectedFilter === 'easy' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('easy')}
            >
              Easy
            </button>
            <button
              className={`filter-btn ${selectedFilter === 'medium' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('medium')}
            >
              Medium
            </button>
            <button
              className={`filter-btn ${selectedFilter === 'hard' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('hard')}
            >
              Hard
            </button>
          </div>

          {/* Lesson Table */}
          <div className="practice-lesson-list">
            <div className="lesson-table-header">
              <div className="column status-col">Status</div>
              <div className="column title-col">Title</div>
              <div className="column difficulty-col">Difficulty</div>
              <div className="column acceptance-col">Acceptance</div>
              <div className="column xp-col">XP Bonus</div>
            </div>

            {filteredLessons.map((lesson) => (
              <div 
                key={lesson.id} 
                className="lesson-table-row"
                onClick={() => handleLessonClick(lesson.id)}
              >
                <div className="column status-col">
                  {lesson.solved ? (
                    <span className="solved-badge">✓</span>
                  ) : (
                    <span className="unsolved-badge">○</span>
                  )}
                </div>
                <div className="column title-col">
                  <span className="lesson-num">#{lesson.id}</span>
                  <span className="lesson-title-text">{lesson.title}</span>
                </div>
                <div className="column difficulty-col">
                  <span 
                    className="difficulty-badge"
                    style={{ color: getDifficultyColor(lesson.difficulty) }}
                  >
                    {lesson.difficulty}
                  </span>
                </div>
                <div className="column acceptance-col">
                  {lesson.acceptance}
                </div>
                <div className="column xp-col">
                  <span className={lesson.solved ? 'xp-earned' : 'xp-locked'}>
                    {lesson.solved ? `+${lesson.xpBonus} XP` : `+${lesson.xpBonus} XP`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - User Info Panel */}
        <div className="practice-right-section">
          <div className="practice-user-panel">
            <div className="profile-header">
              <img 
                src={user.avatar} 
                alt="Avatar" 
                className="profile-avatar"
                onError={(e) => {
                  e.target.src = "/icons/knight_icon.png";
                }}
              />
              <div className="profile-info">
                <h2 className="profile-name">{user.name}</h2>
                <p className="profile-level">{user.level}</p>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <img src="/icons/xp-icon.png" alt="XP" className="stat-icon-img" />
                <div className="stat-content">
                  <span className="stat-value">{user.currentXP}</span>
                  <span className="stat-label">Total XP</span>
                </div>
              </div>

              <div className="stat-item">
                <img src="/icons/level-icon.png" alt="Level" className="stat-icon-img" />
                <div className="stat-content">
                  <span className="stat-value">{user.level}</span>
                  <span className="stat-label">Level</span>
                </div>
              </div>

              <div className="stat-item">
                <img src="/icons/streak.png" alt="Lessons" className="stat-icon-img" />
                <div className="stat-content">
                  <span className="stat-value">{user.totalLessonsCompleted}</span>
                  <span className="stat-label">Problems Solved</span>
                </div>
              </div>
            </div>

            <button className="practice-view-profile-btn" onClick={() => navigate('/profile')}>
              View profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;