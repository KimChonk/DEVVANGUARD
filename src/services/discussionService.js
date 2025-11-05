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

    const options = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(fullUrl, options);

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const errorText = await response.text();
          console.error("❌ Error Response Text:", errorText.substring(0, 200));
          errorMessage = `${errorMessage} - ${errorText.substring(0, 100)}`;
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }
      throw new Error(errorMessage);
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

/**
 * Discussion/Forum API Service
 */
export const discussionService = {
  // ============ FORUM POSTS ============

  /**
   * Get a post by ID
   * @param {string} postId - Post UUID
   * @returns {Promise} Forum post object
   */
  getPostById: async (postId) => {
    try {
      return await apiCall(`/forumpost/${postId}`);
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  },

  /**
   * Get all posts for a lesson
   * @param {string} lessonId - Lesson UUID
   * @returns {Promise} Array of forum posts
   */
  getPostsByLessonId: async (lessonId) => {
    try {
      return await apiCall(`/forumpost/lesson/${lessonId}`);
    } catch (error) {
      console.error('Error fetching posts by lesson:', error);
      throw error;
    }
  },

  /**
   * Create a new post
   * @param {Object} postData - { lessonId, title, content }
   * @returns {Promise} Created forum post object
   */
  createPost: async (postData) => {
    try {
      return await apiCall('/forumpost', 'POST', postData);
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  /**
   * Update a post
   * @param {string} postId - Post UUID
   * @param {Object} postData - { title, content }
   * @returns {Promise} Updated forum post object
   */
  updatePost: async (postId, postData) => {
    try {
      return await apiCall(`/forumpost/${postId}`, 'PUT', postData);
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  /**
   * Delete a post
   * @param {string} postId - Post UUID
   * @returns {Promise} Response with status
   */
  deletePost: async (postId) => {
    try {
      return await apiCall(`/forumpost/${postId}`, 'DELETE');
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // ============ FORUM COMMENTS ============

  /**
   * Get a comment by ID
   * @param {string} commentId - Comment UUID
   * @returns {Promise} Forum comment object
   */
  getCommentById: async (commentId) => {
    try {
      return await apiCall(`/forumcomment/${commentId}`);
    } catch (error) {
      console.error('Error fetching comment:', error);
      throw error;
    }
  },

  /**
   * Get all comments for a post
   * @param {string} postId - Post UUID
   * @returns {Promise} Array of forum comments
   */
  getCommentsByPostId: async (postId) => {
    try {
      return await apiCall(`/forumcomment/post/${postId}`);
    } catch (error) {
      console.error('Error fetching comments by post:', error);
      throw error;
    }
  },

  /**
   * Create a new comment
   * @param {Object} commentData - { postId, content }
   * @returns {Promise} Created forum comment object
   */
  createComment: async (commentData) => {
    try {
      return await apiCall('/forumcomment', 'POST', commentData);
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  /**
   * Update a comment
   * @param {string} commentId - Comment UUID
   * @param {Object} commentData - { content }
   * @returns {Promise} Updated forum comment object
   */
  updateComment: async (commentId, commentData) => {
    try {
      return await apiCall(`/forumcomment/${commentId}`, 'PUT', commentData);
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  /**
   * Delete a comment
   * @param {string} commentId - Comment UUID
   * @returns {Promise} Response with status
   */
  deleteComment: async (commentId) => {
    try {
      return await apiCall(`/forumcomment/${commentId}`, 'DELETE');
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // ============ UPVOTES ============

  /**
   * Upvote or remove upvote from a post
   * @param {string} postId - Post UUID
   * @param {boolean} remove - True to remove upvote, false to add
   * @returns {Promise} Response with upvote confirmation
   */
  upvotePost: async (postId, remove = false) => {
    try {
      return await apiCall(`/forumpost/${postId}/upvote?remove=${remove}`, 'PATCH');
    } catch (error) {
      console.error('Error upvoting post:', error);
      throw error;
    }
  },

  /**
   * Upvote or remove upvote from a comment
   * @param {string} commentId - Comment UUID
   * @param {boolean} remove - True to remove upvote, false to add
   * @returns {Promise} Response with upvote confirmation
   */
  upvoteComment: async (commentId, remove = false) => {
    try {
      return await apiCall(`/forumcomment/${commentId}/upvote?remove=${remove}`, 'PATCH');
    } catch (error) {
      console.error('Error upvoting comment:', error);
      throw error;
    }
  },
};

export default discussionService;
