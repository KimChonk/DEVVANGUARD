// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5131";

// Lấy access token từ Supabase session
const getAuthHeader = async () => {
  const { supabase } = await import("./supabaseClient");
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No authentication token found");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
};

// Generic API call function
const apiCall = async (endpoint, method = "GET", data = null) => {
  try {
    const headers = await getAuthHeader();
    const fullUrl = `${API_BASE_URL}/api${endpoint}`;

    console.log(`🚀 API Call: ${method} ${fullUrl}`);
    console.log(`📌 API Base URL: ${API_BASE_URL}`);
    console.log(`📋 Headers:`, headers);

    const options = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
      console.log(`📦 Body:`, data);
    }

    const response = await fetch(fullUrl, options);

    console.log(`✅ Response Status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    if (response.status === 204) {
      return { success: true, message: "Deleted successfully" };
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ API call error [${method} ${endpoint}]:`, error);
    throw error;
  }
};

// ========== COURSE SERVICES ==========
export const courseService = {
  // Lấy tất cả courses
  async getAllCourses() {
    try {
      const courses = await apiCall("/course");
      return { success: true, data: courses };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Lấy course theo ID (kèm lessons)
  async getCourseById(courseId) {
    try {
      const course = await apiCall(`/course/${courseId}`);
      return { success: true, data: course };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Tạo course mới
  async createCourse(name, language, description) {
    try {
      const course = await apiCall("/course", "POST", {
        name,
        language,
        description,
      });
      return { success: true, data: course };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Cập nhật course
  async updateCourse(courseId, name, language, description) {
    try {
      const course = await apiCall(`/course/${courseId}`, "PUT", {
        name,
        language,
        description,
      });
      return { success: true, data: course };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Xóa course
  async deleteCourse(courseId) {
    try {
      await apiCall(`/course/${courseId}`, "DELETE");
      return { success: true, message: "Course deleted successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

// ========== LESSON SERVICES ==========
export const lessonService = {
  // Lấy lesson theo ID
  async getLessonById(lessonId) {
    try {
      const lesson = await apiCall(`/lesson/${lessonId}`);
      return { success: true, data: lesson };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Lấy lessons theo course ID
  async getLessonsByCourseId(courseId) {
    try {
      const lessons = await apiCall(`/lesson/course/${courseId}`);
      return { success: true, data: lessons };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Tạo lesson mới
  async createLesson(courseId, lessonTitle, lessonOrder) {
    try {
      const lesson = await apiCall("/lesson", "POST", {
        courseId,
        lessonTitle,
        lessonOrder,
      });
      return { success: true, data: lesson };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Cập nhật lesson
  async updateLesson(lessonId, lessonTitle, lessonOrder) {
    try {
      const lesson = await apiCall(`/lesson/${lessonId}`, "PUT", {
        lessonTitle,
        lessonOrder,
      });
      return { success: true, data: lesson };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Xóa lesson
  async deleteLesson(lessonId) {
    try {
      await apiCall(`/lesson/${lessonId}`, "DELETE");
      return { success: true, message: "Lesson deleted successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

// ========== USER SERVICES ==========
export const userService = {
  // Lấy profile của user hiện tại
  async getMyProfile() {
    try {
      const user = await apiCall("/user/me");
      return { success: true, data: user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Tạo profile cho user hiện tại
  async createMyProfile(email, fullName) {
    try {
      const user = await apiCall("/user/me", "POST", {
        email,
        fullName,
      });
      return { success: true, data: user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Cập nhật profile của user hiện tại
  async updateMyProfile(email, fullName) {
    try {
      const user = await apiCall("/user/me", "PUT", {
        email,
        fullName,
      });
      return { success: true, data: user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Lấy user theo ID
  async getUserById(userId) {
    try {
      const user = await apiCall(`/user/${userId}`);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Lấy user theo email
  async getUserByEmail(email) {
    try {
      const user = await apiCall(`/user/email/${email}`);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Xóa user
  async deleteUser(userId) {
    try {
      await apiCall(`/user/${userId}`, "DELETE");
      return { success: true, message: "User deleted successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

// ========== USER PROGRESS SERVICES ==========
export const userProgressService = {
  // Lấy progress của user hiện tại
  async getMyProgress() {
    try {
      const progress = await apiCall("/userprogress/me");
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Tạo progress mới
  async createProgress(lessonId, status = "not_started") {
    try {
      const progress = await apiCall("/userprogress/me", "POST", {
        lessonId,
        status,
      });
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Cập nhật progress
  async updateProgress(progressId, lessonId, status) {
    try {
      const progress = await apiCall(`/userprogress/${progressId}`, "PUT", {
        lessonId,
        status,
      });
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Lấy progress theo ID
  async getProgressById(progressId) {
    try {
      const progress = await apiCall(`/userprogress/${progressId}`);
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Xóa progress
  async deleteProgress(progressId) {
    try {
      await apiCall(`/userprogress/${progressId}`, "DELETE");
      return { success: true, message: "Progress deleted successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

// ========== USER STATS SERVICES ==========
export const userStatsService = {
  // Lấy stats của user hiện tại
  async getMyStats() {
    try {
      const stats = await apiCall("/userstats/me");
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Tạo stats mới
  async createStats(
    totalLessonsCompleted = 0,
    totalTimeSpent = 0,
    xp = "0"
  ) {
    try {
      const stats = await apiCall("/userstats/me", "POST", {
        totalLessonsCompleted,
        totalTimeSpent,
        xp,
      });
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Cập nhật stats
  async updateStats(totalLessonsCompleted, totalTimeSpent, xp) {
    try {
      const stats = await apiCall("/userstats/me", "PUT", {
        totalLessonsCompleted,
        totalTimeSpent,
        xp,
      });
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Lấy stats theo ID
  async getStatsById(statId) {
    try {
      const stats = await apiCall(`/userstats/${statId}`);
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Xóa stats
  async deleteStats(statId) {
    try {
      await apiCall(`/userstats/${statId}`, "DELETE");
      return { success: true, message: "Stats deleted successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};
