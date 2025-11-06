// src/pages/Profile/EditProfile.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar.jsx';
import LoadingScreen from '../../components/LoadingScreen';
import '../../assets/CSS/editprofile.css'; // File CSS mới
import '../../assets/CSS/mainmenu.css'; // Dùng chung biến màu

export default function EditProfile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang tải...");

  // === SỬA 1: ĐỌC DỮ LIỆU TỪ LOCALSTORAGE KHI TẢI TRANG ===
  const [formData, setFormData] = useState(() => {
    // 1. Lấy dữ liệu đã lưu (nếu có)
    const storedUser = JSON.parse(localStorage.getItem('devVanguardUser')) || {};
    
    // 2. State mặc định cho skills
    const defaultSkills = {
      html: false, css: false, javascript: false, python: false,
      java: false, cpp: false, sql: false, commandline: false,
      react: false, github: false, numpy: false, typescript: false,
    };

    // 3. Trả về state, ưu tiên dữ liệu đã lưu
    return {
      name: storedUser.name || 'Knight Coder',
      username: storedUser.username || 'knightcoder99',
      avatar: storedUser.avatar || '/images/default-avatar.jpg',
      location: storedUser.location || '',
      work: storedUser.work || '',
      education: storedUser.education || '',
      website: storedUser.website || '',
      bio: storedUser.bio || "You don't have anything in your bio.",
      skills: { ...defaultSkills, ...storedUser.skills }, // Ghi đè skills mặc định
    };
  });

  // Hàm xử lý khi thay đổi input (text, textarea)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hàm xử lý khi check/uncheck skill
  const handleSkillChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [name]: checked,
      },
    }));
  };

  // === SỬA 2: LƯU DỮ LIỆU VÀO LOCALSTORAGE KHI SUBMIT ===
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Đã lưu dữ liệu:', formData);

    // 1. Lấy user data cũ (nếu có)
    const storedUser = JSON.parse(localStorage.getItem('devVanguardUser')) || {};
    
    // 2. Tạo object user mới với dữ liệu đã cập nhật từ form
    const updatedUser = { 
      ...storedUser, // Giữ lại các trường cũ (như joinedDate, level...)
      name: formData.name,
      username: formData.username,
      avatar: formData.avatar,
      bio: formData.bio,
      skills: formData.skills,
      
    };
    
    // 3. Lưu object mới vào local storage
    localStorage.setItem('devVanguardUser', JSON.stringify(updatedUser));

    // 4. Quay lại trang profile với loading
    setIsLoading(true);
    setLoadingMessage("Đang lưu thay đổi...");
    setTimeout(() => {
      navigate('/profile');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      <LoadingScreen isVisible={isLoading} message={loadingMessage} />
      <Navbar />
      {/* Nền xanh đậm giống trang Profile */}
      <div className="profile-background"></div> 
      
      <div className="edit-profile-container">
        <h2>Edit Profile</h2>
        
        <form className="edit-profile-form" onSubmit={handleSubmit}>
          <div className="edit-profile-grid">
            {/* --- CỘT BÊN TRÁI (Avatar, Info) --- */}
            <div className="profile-left-col">
              <div className="avatar-upload-section">
                <img 
                  src={formData.avatar} 
                  alt="Avatar" 
                  className="avatar-preview-edit"
                  onError={(e) => { e.target.src = "/icons/knight_icon.png"; }}
                />
                <div className="avatar-upload-text">
                  {/* Bạn có thể thêm <input type="file" ... /> ở đây */}
                  <p>Recommended ratio 1:1</p>
                  <p>Recommended size: 5 MB</p>
                </div>
              </div>

              

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell us a little about yourself!" rows="5"></textarea>
              </div>
            </div>

            {/* --- CỘT BÊN PHẢI (Name, Username, Skills) --- */}
            <div className="profile-right-col">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label htmlFor="username">Username <span className="required">*</span></label>
                <input type="text" id="username" name="username" value={formData.username} onChange={handleInputChange} />
              </div>

              <div className="form-group skills-section">
                <h3>Skills</h3>
                <div className="skills-grid">
                  {/* Tự động tạo các checkbox từ state */}
                  {Object.keys(formData.skills).map((skill) => (
                    <div className="skill-item" key={skill}>
                      {/* === SỬA 3: SỬA LỖI type_note THÀNH type === */}
                      <input 
                        type="checkbox" 
                        id={skill} 
                        name={skill} 
                        checked={formData.skills[skill]} 
                        onChange={handleSkillChange} 
                      />
                      <label htmlFor={skill}>
                        {/* Tự động viết hoa chữ cái đầu và sửa 'cpp' thành 'C++' */}
                        {skill.charAt(0).toUpperCase() + skill.slice(1).replace('cpp', 'C++').replace('github', 'Git & GitHub')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* --- NÚT SUBMIT --- */}
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={() => {
                setIsLoading(true);
                setLoadingMessage("Đang quay lại...");
                setTimeout(() => {
                  navigate('/profile');
                  setIsLoading(false);
                }, 1000);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="save-btn">Save Changes</button>
          </div>
        </form>
      </div>
    </>
  );
}