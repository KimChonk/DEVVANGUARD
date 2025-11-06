import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile, useUserStats, useUserRank } from "../../hooks/useUser";
import { userService } from "../../services/apiClient";
import LoadingScreen from "../../components/LoadingScreen";
import "../../assets/CSS/profilescreen.css";

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const { stats } = useUserStats();
  const { rankData } = useUserRank();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang tải...");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    avatarName: "default-avatar.jpg",
  });

  // Available avatars
  const availableAvatars = [
    "default-avatar.jpg",
    "avatar1.png",
    "avatar2.png",
    "avatar3.png",
    "avatar4.png",
  ];

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setEditFormData({
        fullName: profile.fullName || "",
        avatarName: profile.avatarName || "default-avatar.jpg",
      });
    }
  }, [profile]);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (profile) {
      setEditFormData({
        fullName: profile.fullName || "",
        avatarName: profile.avatarName || "default-avatar.jpg",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarSelect = (avatarName) => {
    setEditFormData((prev) => ({
      ...prev,
      avatarName,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage("Đang lưu thay đổi...");

      const response = await userService.updateProfile({
        fullName: editFormData.fullName,
        avatarName: editFormData.avatarName,
      });

      if (response.success) {
        // Update local editFormData with response data
        if (response.data) {
          setEditFormData({
            fullName: response.data.fullName || editFormData.fullName,
            avatarName: response.data.avatarName || editFormData.avatarName,
          });
        }
        setIsEditMode(false);
        setIsLoading(false);
        // Reload page to refresh all profile data from API
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        alert("Lỗi: " + response.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Có lỗi xảy ra khi cập nhật hồ sơ");
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoading(true);
    setLoadingMessage("Đang đăng xuất...");
    setTimeout(() => {
      navigate("/login");
      setIsLoading(false);
    }, 1000);
  };

  if (profileLoading) {
    return <LoadingScreen isVisible={true} message="Đang tải hồ sơ..." />;
  }

  const currentAvatar = editFormData.avatarName || "default-avatar.jpg";
  const displayName = editFormData.fullName || "Knight Coder";

  return (
    <>
      <LoadingScreen isVisible={isLoading} message={loadingMessage} />

      <div className="profile-page">
        {/* Header */}
        <header className="profile-header">
          <div className="profile-header-content">
            <button className="back-btn" onClick={() => navigate("/main-menu")}>
              ← Back
            </button>
            <h1>Profile</h1>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="profile-main-content">
          {/* Profile Card */}
          <div className="profile-card">
            {/* Avatar Section */}
            <div className="avatar-section">
              <img
                src={`/images/avatars/${currentAvatar}`}
                alt="Profile Avatar"
                className="profile-avatar"
              />
              <div className="profile-basic-info">
                <h2 className="profile-name">{displayName}</h2>
                <div className="profile-rank">
                  <span className="rank-badge">{rankData?.rank_title || "Newbie"}</span>
                  <span className="xp-text">
                    {rankData?.xp || 0} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Edit/Save Buttons */}
            <div className="profile-actions">
              {!isEditMode ? (
                <button className="btn-edit" onClick={handleEditClick}>
                  Edit Profile
                </button>
              ) : (
                <div className="action-buttons">
                  <button className="btn-save" onClick={handleSaveProfile}>
                    Save Changes
                  </button>
                  <button className="btn-cancel" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Edit Mode */}
            {isEditMode && (
              <div className="edit-form">
                {/* Full Name Input */}
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={editFormData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="form-input"
                  />
                </div>

                {/* Avatar Selector */}
                <div className="form-group">
                  <label>Select Avatar</label>
                  <div className="avatar-selector">
                    {availableAvatars.map((avatar) => (
                      <div
                        key={avatar}
                        className={`avatar-option ${
                          editFormData.avatarName === avatar ? "selected" : ""
                        }`}
                        onClick={() => handleAvatarSelect(avatar)}
                      >
                        <img
                          src={`/images/avatars/${avatar}`}
                          alt={avatar}
                          className="avatar-thumbnail"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-value">{rankData?.xp || 0}</div>
                <div className="stat-label">Total XP</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{rankData?.total_lessons_completed || 0}</div>
                <div className="stat-label">Lessons Completed</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{rankData?.rank_title || "Newbie"}</div>
                <div className="stat-label">Current Rank</div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="info-section">
            <div className="info-card">
              <h3>Account Information</h3>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{profile?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since:</span>
                <span className="info-value">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Role:</span>
                <span className="info-value">
                  <span className="role-badge">
                    {profile?.role === "admin" ? "Administrator" : "User"}
                  </span>
                </span>
              </div>
            </div>

            <div className="info-card">
              <h3>Rank Progress</h3>
              <div className="rank-info">
                <div className="rank-current">
                  <strong>{rankData?.rank_title || "Newbie"}</strong>
                </div>
                <div className="xp-progress">
                  <div className="xp-bar">
                    <div
                      className="xp-fill"
                      style={{ width: `${Math.min((rankData?.xp || 0) / 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="xp-text">{rankData?.xp || 0} XP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}