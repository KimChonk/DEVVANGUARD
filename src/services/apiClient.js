// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5131";

// Lấy access token từ Supabase session
const getAuthHeader = async () => {
  try {
    const { supabase } = await import("./supabaseClient");
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log('[getAuthHeader] Session:', session?.user?.id);

    if (!session?.access_token) {
      console.error('[getAuthHeader] No access token found');
      throw new Error("No authentication token found");
    }

    const header = {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    };
    
    console.log('[getAuthHeader] Token present, length:', session.access_token.length);
    return header;
  } catch (err) {
    console.error('[getAuthHeader] Error:', err);
    throw err;
  }
};

// Generic API call function
const apiCall = async (endpoint, method = "GET", data = null) => {
  try {
    const headers = await getAuthHeader();
    const fullUrl = `${API_BASE_URL}/api${endpoint}`;

    console.log(`[apiCall] ${method} ${fullUrl}`);
    console.log(`[apiCall] API Base URL: ${API_BASE_URL}`);
    console.log(`[apiCall] Auth header present:`, !!headers?.Authorization);

    const options = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
      console.log(`[apiCall] Body:`, data);
    }

    const response = await fetch(fullUrl, options);

    console.log(`[apiCall] Response Status: ${response.status}`);

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      } catch (parseError) {
        // Response không phải JSON (có thể là HTML exception page)
        const errorText = await response.text();
        console.error("[apiCall] Error Response Text:", errorText.substring(0, 200));
        throw new Error(`API error: ${response.status} - ${errorText.substring(0, 100)}`);
      }
    }

    if (response.status === 204) {
      return { success: true, message: "Deleted successfully" };
    }

    return await response.json();
  } catch (error) {
    console.error(`[apiCall] error [${method} ${endpoint}]:`, error);
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
        courseImage: course.courseImage,
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
        courseImage: course.courseImage,
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
        xpReward: lesson.xpReward || 0,
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
          console.log(`Course language fetched: ${courseLanguage}`);
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
        xpReward: lesson.xpReward || 0,
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
        xpReward: lesson.xpReward || 0,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt
      })) : [];
      return { success: true, data: mappedLessons };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Tạo lesson mới
  async createLesson(courseId, lessonTitle, lessonOrder, problemDescription, solutionTemplate, testCases, xpReward = 0) {
    try {
      const lesson = await apiCall("/lesson", "POST", {
        courseId,
        lessonTitle,
        lessonOrder,
        problemDescription: problemDescription || null,
        solutionTemplate: solutionTemplate || null,
        testCases: testCases || null,
        xpReward: xpReward || 0,
      });
      return { success: true, data: lesson };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Cập nhật lesson
  async updateLesson(lessonId, lessonTitle, lessonOrder, problemDescription, solutionTemplate, testCases, xpReward = 0) {
    try {
      const lesson = await apiCall(`/lesson/${lessonId}`, "PUT", {
        lessonTitle,
        lessonOrder,
        problemDescription: problemDescription || null,
        solutionTemplate: solutionTemplate || null,
        testCases: testCases || null,
        xpReward: xpReward || 0,
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
        avatarName: user.avatarName,
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

  // Lấy tất cả progress records của một user
  async getUserProgressByUserId(userId) {
    try {
      const progressList = await apiCall(`/userprogress/user/${userId}`);
      // Map C# PascalCase to camelCase
      const mappedProgress = Array.isArray(progressList) ? progressList.map(p => ({
        progressId: p.progressId,
        userId: p.userId,
        lessonId: p.lessonId,
        status: p.status,
        lastAccessed: p.lastAccessed,
        user: p.user
      })) : [];
      return { success: true, data: mappedProgress };
    } catch (error) {
      return { success: false, data: [], message: error.message };
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

// ========== LESSON HINT SERVICES ==========
export const lessonHintService = {
  // Lấy tất cả hints
  async getAllHints() {
    try {
      const hints = await apiCall("/lessonhint");
      const mappedHints = Array.isArray(hints) ? hints.map(hint => ({
        hintId: hint.hintId,
        lessonId: hint.lessonId,
        title: hint.title,
        content: hint.content,
        createdAt: hint.createdAt,
        updatedAt: hint.updatedAt
      })) : [];
      return { success: true, data: mappedHints };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Lấy hints theo lesson ID
  async getHintsByLessonId(lessonId) {
    try {
      const hints = await apiCall(`/lessonhint/lesson/${lessonId}`);
      const mappedHints = Array.isArray(hints) ? hints.map(hint => ({
        hintId: hint.hintId,
        lessonId: hint.lessonId,
        title: hint.title,
        content: hint.content,
        createdAt: hint.createdAt,
        updatedAt: hint.updatedAt
      })) : [];
      return { success: true, data: mappedHints };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Tạo hint mới
  async createHint(lessonId, title, content) {
    try {
      const hint = await apiCall("/lessonhint", "POST", {
        lessonId,
        title,
        content
      });
      return { success: true, data: hint };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Cập nhật hint
  async updateHint(hintId, title, content) {
    try {
      const hint = await apiCall(`/lessonhint/${hintId}`, "PUT", {
        title,
        content
      });
      return { success: true, data: hint };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Xóa hint
  async deleteHint(hintId) {
    try {
      await apiCall(`/lessonhint/${hintId}`, "DELETE");
      return { success: true, message: "Hint deleted successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ========== PvP PROBLEMS SERVICES ==========
export const pvpProblemService = {
  // Get all PvP problems
  async getAllProblems() {
    try {
      const problems = await apiCall("/pvpproblem");
      const mappedProblems = Array.isArray(problems) ? problems.map(p => ({
        problemId: p.problemId,
        title: p.title,
        problemDescription: p.problemDescription,
        solutionTemplate: p.solutionTemplate,
        testCases: p.testCases,
        xpReward: p.xpReward,
        createdAt: p.createdAt
      })) : [];
      return { success: true, data: mappedProblems };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get PvP problem by ID from Supabase
  async getProblemById(problemId) {
    try {
      console.log('[pvpProblemService] Getting problem:', problemId);
      const { supabase } = await import("./supabaseClient");
      
      const { data, error } = await supabase
        .from('pvp_problems')
        .select('*')
        .eq('problem_id', problemId)
        .single();

      if (error) {
        console.error('[pvpProblemService] getProblemById error:', error);
        throw error;
      }

      console.log('[pvpProblemService] Problem data:', data);
      
      const mapped = {
        problemId: data.problem_id,
        title: data.title,
        problemDescription: data.problem_description,
        solutionTemplate: data.solution_template,
        testCases: data.test_cases,
        xpReward: data.xp_reward,
        createdAt: data.created_at,
      };
      
      return { success: true, data: mapped };
    } catch (error) {
      console.error('[pvpProblemService] getProblemById error:', error);
      return { success: false, message: error.message };
    }
  },

  // Get random PvP problem
  async getRandomProblem() {
    try {
      const problem = await apiCall("/pvpproblem/random/problem");
      return { success: true, data: problem };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Create PvP problem (admin only)
  async createProblem(title, problemDescription, solutionTemplate, testCases, xpReward = 20) {
    try {
      const problem = await apiCall("/pvpproblem", "POST", {
        title,
        problemDescription,
        solutionTemplate,
        testCases,
        xpReward
      });
      return { success: true, data: problem };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Update PvP problem (admin only)
  async updateProblem(problemId, title, problemDescription, solutionTemplate, testCases, xpReward) {
    try {
      const problem = await apiCall(`/pvpproblem/${problemId}`, "PUT", {
        title,
        problemDescription,
        solutionTemplate,
        testCases,
        xpReward
      });
      return { success: true, data: problem };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Delete PvP problem (admin only)
  async deleteProblem(problemId) {
    try {
      await apiCall(`/pvpproblem/${problemId}`, "DELETE");
      return { success: true, message: "Problem deleted successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ========== PvP MATCHES SERVICES ==========
export const pvpMatchService = {
  // Get match by ID from Supabase
  async getMatchById(matchId) {
    try {
      const { supabase } = await import("./supabaseClient");
      
      const { data, error } = await supabase
        .from('pvp_matches')
        .select('*')
        .eq('match_id', matchId);

      if (error) {
        throw error;
      }

      // Match was deleted
      if (!data || data.length === 0) {
        return { success: false, message: 'Match not found' };
      }
      
      const match = data[0];
      const mapped = {
        matchId: match.match_id,
        problemId: match.problem_id,
        status: match.status,
        player1Id: match.player1_id,
        player2Id: match.player2_id,
        winnerId: match.winner_id,
        xpChangeP1: match.xp_change_p1,
        xpChangeP2: match.xp_change_p2,
        player1Code: match.player1_code,
        player2Code: match.player2_code,
        createdAt: match.created_at,
        startedAt: match.started_at,
        completedAt: match.completed_at,
      };
      
      return { success: true, data: mapped };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get all user matches
  async getUserMatches() {
    try {
      const matches = await apiCall("/pvpmatch/user/all");
      const mappedMatches = Array.isArray(matches) ? matches.map(m => ({
        matchId: m.matchId,
        problemId: m.problemId,
        status: m.status,
        player1Id: m.player1Id,
        player2Id: m.player2Id,
        winnerId: m.winnerId,
        player1Code: m.player1Code,
        player2Code: m.player2Code,
        xpChangeP1: m.xpChangeP1,
        xpChangeP2: m.xpChangeP2,
        createdAt: m.createdAt,
        startedAt: m.startedAt,
        completedAt: m.completedAt
      })) : [];
      return { success: true, data: mappedMatches };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get user matches by status
  async getUserMatchesByStatus(status) {
    try {
      const validStatuses = ["searching", "in_progress", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
      }
      const matches = await apiCall(`/pvpmatch/user/status/${status}`);
      const mappedMatches = Array.isArray(matches) ? matches.map(m => ({
        matchId: m.matchId,
        problemId: m.problemId,
        status: m.status,
        player1Id: m.player1Id,
        player2Id: m.player2Id,
        winnerId: m.winnerId,
        player1Code: m.player1Code,
        player2Code: m.player2Code,
        xpChangeP1: m.xpChangeP1,
        xpChangeP2: m.xpChangeP2,
        createdAt: m.createdAt,
        startedAt: m.startedAt,
        completedAt: m.completedAt
      })) : [];
      return { success: true, data: mappedMatches };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get user active match
  async getUserActiveMatch() {
    try {
      const match = await apiCall("/pvpmatch/user/active");
      return { success: true, data: match };
    } catch (error) {
      return { success: false, data: null, message: error.message };
    }
  },

  // Get all searching matches (for matchmaking)
  async getSearchingMatches() {
    try {
      const matches = await apiCall("/pvpmatch/search/available");
      const mappedMatches = Array.isArray(matches) ? matches.map(m => ({
        matchId: m.matchId,
        problemId: m.problemId,
        status: m.status,
        player1Id: m.player1Id,
        player2Id: m.player2Id,
        winnerId: m.winnerId,
        createdAt: m.createdAt,
        startedAt: m.startedAt
      })) : [];
      return { success: true, data: mappedMatches };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Join matchmaking queue - call Supabase find_match function
  async joinQueue() {
    try {
      console.log('[pvpMatchService] Calling find_match function...');
      const { supabase } = await import("./supabaseClient");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      console.log('[pvpMatchService] Session user ID:', session.user.id);
      
      const { data, error } = await supabase.rpc('find_match', {
        p_player_id: session.user.id
      });

      console.log('[pvpMatchService] RPC response - data:', data, 'error:', error);

      if (error) {
        console.error('[pvpMatchService] find_match RPC error:', error);
        // Return a more helpful error message
        if (error.message?.includes('ambiguous')) {
          throw new Error("Matchmaking system temporarily unavailable. Please try again in a few seconds.");
        }
        throw new Error(error.message || 'find_match RPC call failed');
      }

      if (!data) {
        throw new Error("find_match returned no data");
      }

      // RPC response can be array or object
      const matchArray = Array.isArray(data) ? data : [data];
      
      if (matchArray.length === 0) {
        throw new Error("No match data in RPC response");
      }

      const match = matchArray[0];
      console.log('[pvpMatchService] Match from RPC:', match);
      
      if (!match.match_id) {
        throw new Error("Match ID is missing from response");
      }
      
      const mappedMatch = {
        matchId: match.match_id,
        problemId: match.problem_id || null, // problem_id can be null
        status: match.status || 'searching',
      };
      
      console.log('[pvpMatchService] Mapped match:', mappedMatch);
      return { success: true, data: mappedMatch };
    } catch (error) {
      console.error('[pvpMatchService] joinQueue error:', error.message || error);
      return { success: false, message: error.message || 'Failed to join queue' };
    }
  },

  // Create a new match (player1 joins queue)
  async createMatch() {
    try {
      const match = await apiCall("/pvpmatch/create", "POST");
      return { success: true, data: match };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Join a searching match (player2 joins)
  async joinMatch(matchId) {
    try {
      const match = await apiCall(`/pvpmatch/${matchId}/join`, "POST");
      return { success: true, data: match };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Submit player code - call Supabase submit_pvp_win function
  async submitCode(matchId, code) {
    try {
      console.log('[pvpMatchService] Submitting PvP code...', { matchId, codeLength: code?.length });
      const { supabase } = await import("./supabaseClient");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.rpc('submit_pvp_win', {
        p_match_id: matchId,
        p_winner_id: session.user.id,
        p_code: code
      });

      if (error) {
        console.error('[pvpMatchService] submit_pvp_win error:', error);
        throw error;
      }

      console.log('[pvpMatchService] PvP code submitted successfully');
      return { success: true, message: "Code submitted, you won!" };
    } catch (error) {
      console.error('[pvpMatchService] submitCode error:', error);
      return { success: false, message: error.message };
    }
  },

  // Get match result and update user XP
  async getMatchResult(matchId, currentUserId) {
    try {
      console.log('[pvpMatchService] Getting match result:', matchId);
      const { supabase } = await import("./supabaseClient");
      
      const { data, error } = await supabase
        .from('pvp_matches')
        .select('*')
        .eq('match_id', matchId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return { success: false, message: 'Match not found' };
      }

      const isPlayer1 = data.player1_id === currentUserId;
      const isWinner = data.winner_id === currentUserId;
      const xpChange = isPlayer1 ? data.xp_change_p1 : data.xp_change_p2;

      // Update user stats with XP change
      if (data.status === 'completed' && xpChange) {
        const { data: stats } = await supabase
          .from('user_stats')
          .select('xp')
          .eq('user_id', currentUserId)
          .single();

        if (stats) {
          const currentXP = parseInt(stats.xp || 0);
          const newXP = (currentXP + xpChange).toString();

          await supabase
            .from('user_stats')
            .update({ xp: newXP })
            .eq('user_id', currentUserId);
        }
      }

      return {
        success: true,
        data: {
          matchId: data.match_id,
          status: data.status,
          winnerId: data.winner_id,
          isWinner,
          xpChange,
          opponentId: isPlayer1 ? data.player2_id : data.player1_id,
          player1Code: data.player1_code,
          player2Code: data.player2_code,
          completedAt: data.completed_at
        }
      };
    } catch (error) {
      console.error('[pvpMatchService] getMatchResult error:', error);
      return { success: false, message: error.message };
    }
  },

  // Complete match with winner and XP changes
  async completeMatch(matchId, winnerId, xpChangeP1, xpChangeP2) {
    try {
      const match = await apiCall(`/pvpmatch/${matchId}/complete`, "POST", {
        winnerId,
        xpChangeP1,
        xpChangeP2
      });
      return { success: true, data: match };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Cancel match - delete from Supabase
  async cancelMatch(matchId) {
    try {
      console.log('[pvpMatchService] Cancelling match:', matchId);
      const { supabase } = await import("./supabaseClient");
      
      const { error } = await supabase
        .from('pvp_matches')
        .delete()
        .eq('match_id', matchId);

      if (error) {
        console.error('[pvpMatchService] cancelMatch error:', error);
        throw error;
      }

      console.log('[pvpMatchService] Match cancelled successfully');
      return { success: true, message: "Match cancelled successfully" };
    } catch (error) {
      console.error('[pvpMatchService] cancelMatch error:', error);
      return { success: false, message: error.message };
    }
  },

  // Delete match (admin only)
  async deleteMatch(matchId) {
    try {
      await apiCall(`/pvpmatch/${matchId}`, "DELETE");
      return { success: true, message: "Match deleted successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};
