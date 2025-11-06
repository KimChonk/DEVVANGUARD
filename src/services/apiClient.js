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
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      } catch (parseError) {
        // Response không phải JSON (có thể là HTML exception page)
        const errorText = await response.text();
        console.error("❌ Error Response Text:", errorText.substring(0, 200));
        throw new Error(`API error: ${response.status} - ${errorText.substring(0, 100)}`);
      }
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
      // Map C# PascalCase to camelCase for frontend
      const mappedCourses = Array.isArray(courses) ? courses.map(course => ({
        id: course.courseId,
        courseId: course.courseId,
        name: course.name,
        language: course.language,
        description: course.description,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        lessons: course.lessons
      })) : [];
      return { success: true, data: mappedCourses };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Lấy course theo ID (kèm lessons)
  async getCourseById(courseId) {
    try {
      const course = await apiCall(`/course/${courseId}`);
      // Map C# PascalCase to camelCase
      const mapped = {
        id: course.courseId,
        courseId: course.courseId,
        name: course.name,
        language: course.language,
        description: course.description,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        lessons: course.lessons?.map(lesson => ({
          id: lesson.lessonId,
          lessonId: lesson.lessonId,
          courseId: lesson.courseId,
          lessonTitle: lesson.lessonTitle,
          lessonOrder: lesson.lessonOrder,
          problemDescription: lesson.problemDescription,
          solutionTemplate: lesson.solutionTemplate,
          testCases: lesson.testCases,
          createdAt: lesson.createdAt,
          updatedAt: lesson.updatedAt
        })) || []
      };
      
      return { success: true, data: mapped };
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
  // Lấy tất cả lessons (admin dashboard)
  async getAllLessons() {
    try {
      const lessons = await apiCall(`/lesson`);
      // Map C# PascalCase to camelCase
      const mappedLessons = Array.isArray(lessons) ? lessons.map(lesson => ({
        id: lesson.lessonId,
        lessonId: lesson.lessonId,
        courseId: lesson.courseId,
        lessonTitle: lesson.lessonTitle,
        lessonOrder: lesson.lessonOrder,
        problemDescription: lesson.problemDescription,
        solutionTemplate: lesson.solutionTemplate,
        testCases: lesson.testCases,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt
      })) : [];
      return { success: true, data: mappedLessons };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Lấy lesson theo ID
  async getLessonById(lessonId) {
    try {
      const lesson = await apiCall(`/lesson/${lessonId}`);
      
      // Fetch course to get language
      let courseLanguage = null;
      if (lesson.courseId) {
        try {
          const course = await apiCall(`/course/${lesson.courseId}`);
          courseLanguage = course.language || null;
          console.log(`✅ Course language fetched: ${courseLanguage}`);
        } catch (err) {
          console.warn("Could not fetch course language:", err);
        }
      }
      
      // Map C# PascalCase to camelCase
      const mapped = {
        id: lesson.lessonId,
        lessonId: lesson.lessonId,
        courseId: lesson.courseId,
        lessonTitle: lesson.lessonTitle,
        lessonOrder: lesson.lessonOrder,
        problemDescription: lesson.problemDescription,
        solutionTemplate: lesson.solutionTemplate,
        testCases: lesson.testCases,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
        course: {
          language: courseLanguage
        }
      };
      return { success: true, data: mapped };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Lấy lessons theo course ID
  async getLessonsByCourseId(courseId) {
    try {
      const lessons = await apiCall(`/lesson/course/${courseId}`);
      // Map C# PascalCase to camelCase
      const mappedLessons = Array.isArray(lessons) ? lessons.map(lesson => ({
        id: lesson.lessonId,
        lessonId: lesson.lessonId,
        courseId: lesson.courseId,
        lessonTitle: lesson.lessonTitle,
        lessonOrder: lesson.lessonOrder,
        problemDescription: lesson.problemDescription,
        solutionTemplate: lesson.solutionTemplate,
        testCases: lesson.testCases,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt
      })) : [];
      return { success: true, data: mappedLessons };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Tạo lesson mới
  async createLesson(courseId, lessonTitle, lessonOrder, problemDescription, solutionTemplate, testCases) {
    try {
      const lesson = await apiCall("/lesson", "POST", {
        courseId,
        lessonTitle,
        lessonOrder,
        problemDescription: problemDescription || null,
        solutionTemplate: solutionTemplate || null,
        testCases: testCases || null,
      });
      return { success: true, data: lesson };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Cập nhật lesson
  async updateLesson(lessonId, lessonTitle, lessonOrder, problemDescription, solutionTemplate, testCases) {
    try {
      const lesson = await apiCall(`/lesson/${lessonId}`, "PUT", {
        lessonTitle,
        lessonOrder,
        problemDescription: problemDescription || null,
        solutionTemplate: solutionTemplate || null,
        testCases: testCases || null,
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
  // Get all users (for admin dashboard)
  async getAllUsers() {
    try {
      const users = await apiCall("/user");
      // Map C# PascalCase to camelCase
      const mappedUsers = Array.isArray(users) ? users.map(user => ({
        id: user.userId,
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })) : [];
      return { success: true, data: mappedUsers };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Lấy profile của user hiện tại
  async getMyProfile() {
    try {
      const user = await apiCall("/user/me");
      return { success: true, data: user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Lấy profile của user theo ID (cho việc fetch role)
  async getUserProfile(userId) {
    try {
      const user = await apiCall(`/user/${userId}`);
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

  // Cập nhật profile với fullName và avatarName
  async updateProfile(data) {
    try {
      const user = await apiCall("/user/me", "PUT", {
        fullName: data.fullName,
        avatarName: data.avatarName,
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

  // Submit lesson (hoàn thành bài học và nhận XP reward)
  async submitLesson(lessonId) {
    try {
      const result = await apiCall("/userprogress/submit-lesson", "POST", {
        lessonId,
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Lấy progress của user cho một bài học cụ thể
  async getUserProgressByLessonId(lessonId) {
    try {
      const progress = await apiCall(`/userprogress/lesson/${lessonId}`);
      return { success: true, data: progress };
    } catch (error) {
      // Không có progress cho bài này, return empty
      return { success: false, data: null, message: error.message };
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
