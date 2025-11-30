import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile, useUserStats, useUserRank } from '../../hooks/useUser';
import { pvpProblemService } from '../../services/apiClient';
import SharedNavbar from '../../components/SharedNavbar';
import LoadingScreen from '../../components/LoadingScreen';
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

  const [problems, setProblems] = useState([]);
  const [practiceProgress, setPracticeProgress] = useState({});
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showLearnDropdown, setShowLearnDropdown] = useState(false);
  const [isLoadingProblems, setIsLoadingProblems] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setIsLoadingProblems(true);
        const result = await pvpProblemService.getAllProblems();
        if (result.success && result.data) {
          setProblems(result.data);
        }
      } catch (error) {
        console.error('Failed to load problems:', error);
      } finally {
        setIsLoadingProblems(false);
      }
    };

    fetchProblems();
  }, []);

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

  const filteredProblems = selectedFilter === 'all' 
    ? problems 
    : problems;

  const handleProblemClick = (problemId) => {
    navigate(`/practice/${problemId}`);
  };

  return (
    <div className="practice-page">
      {/* Navbar */}
      <SharedNavbar />

      {/* Hero Section */}
      <div className="practice-hero-section" style={{
        backgroundImage: `url('/images/practice_background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div className="practice-hero-overlay"></div>
        <div className="practice-hero-content">
          <h1 className="practice-hero-title">Master Your Skills</h1>
          <p className="practice-hero-description">
            Solve practice problems and sharpen your coding abilities to become a legendary developer!
          </p>
        </div>
      </div>

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



          {/* Lesson Table */}
          <div className="practice-lesson-list">
            <div className="lesson-table-header">
              <div className="column title-col">Title</div>
              <div className="column xp-col">XP Bonus</div>
            </div>

            {isLoadingProblems ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>Loading problems...</div>
            ) : filteredProblems.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>No problems available</div>
            ) : (
              filteredProblems.map((problem, index) => (
                <div 
                  key={problem.problemId} 
                  className="lesson-table-row"
                  onClick={() => handleProblemClick(problem.problemId)}
                >
                  <div className="column title-col">
                    <span className="lesson-num">#{index + 1}</span>
                    <span className="lesson-title-text">{problem.title}</span>
                  </div>
                  <div className="column xp-col">
                    <span className="xp-locked">+{problem.xpReward || 20} XP</span>
                  </div>
                </div>
              ))
            )}
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