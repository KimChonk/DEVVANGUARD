import { useState, useEffect } from 'react';
import discussionService from '../services/discussionService';

/**
 * Custom hook for managing forum posts and discussion data
 * @param {string} lessonId - Lesson UUID
 * @returns {Object} Forum posts, loading state, error state, and helper functions
 */
export const useDiscussion = (lessonId) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all posts for the lesson
  useEffect(() => {
    if (!lessonId) return;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await discussionService.getPostsByLessonId(lessonId);
        setPosts(data);
      } catch (err) {
        setError(err.message || 'Failed to load posts');
        console.error('Error loading posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [lessonId]);

  // Create new post
  const createPost = async (title, content) => {
    try {
      const newPost = await discussionService.createPost({
        lessonId,
        title,
        content,
      });
      setPosts([newPost, ...posts]);
      return newPost;
    } catch (err) {
      setError(err.message || 'Failed to create post');
      throw err;
    }
  };

  // Update post
  const updatePost = async (postId, title, content) => {
    try {
      const updatedPost = await discussionService.updatePost(postId, {
        title,
        content,
      });
      setPosts(posts.map(p => (p.postId === postId ? updatedPost : p)));
      return updatedPost;
    } catch (err) {
      setError(err.message || 'Failed to update post');
      throw err;
    }
  };

  // Delete post
  const deletePost = async (postId) => {
    try {
      await discussionService.deletePost(postId);
      setPosts(posts.filter(p => p.postId !== postId));
    } catch (err) {
      setError(err.message || 'Failed to delete post');
      throw err;
    }
  };

  // Create comment
  const createComment = async (postId, content) => {
    try {
      const newComment = await discussionService.createComment({
        postId,
        content,
      });
      // Update post's comments
      setPosts(posts.map(p => {
        if (p.postId === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), newComment],
          };
        }
        return p;
      }));
      return newComment;
    } catch (err) {
      setError(err.message || 'Failed to create comment');
      throw err;
    }
  };

  // Update comment
  const updateComment = async (postId, commentId, content) => {
    try {
      const updatedComment = await discussionService.updateComment(commentId, {
        content,
      });
      // Update post's comments
      setPosts(posts.map(p => {
        if (p.postId === postId) {
          return {
            ...p,
            comments: (p.comments || []).map(c => 
              c.commentId === commentId ? updatedComment : c
            ),
          };
        }
        return p;
      }));
      return updatedComment;
    } catch (err) {
      setError(err.message || 'Failed to update comment');
      throw err;
    }
  };

  // Delete comment
  const deleteComment = async (postId, commentId) => {
    try {
      await discussionService.deleteComment(commentId);
      // Update post's comments
      setPosts(posts.map(p => {
        if (p.postId === postId) {
          return {
            ...p,
            comments: (p.comments || []).filter(c => c.commentId !== commentId),
          };
        }
        return p;
      }));
    } catch (err) {
      setError(err.message || 'Failed to delete comment');
      throw err;
    }
  };

  // Upvote post
  const upvotePost = async (postId) => {
    try {
      const result = await discussionService.upvotePost(postId, false);
      // Update post upvotes from API response
      setPosts(posts.map(p => {
        if (p.postId === postId) {
          return {
            ...p,
            upvotes: result.upvotes,
          };
        }
        return p;
      }));
    } catch (err) {
      setError(err.message || 'Failed to upvote post');
      throw err;
    }
  };

  // Remove post upvote
  const removePostUpvote = async (postId) => {
    try {
      const result = await discussionService.upvotePost(postId, true);
      // Update post upvotes from API response
      setPosts(posts.map(p => {
        if (p.postId === postId) {
          return {
            ...p,
            upvotes: result.upvotes,
          };
        }
        return p;
      }));
    } catch (err) {
      setError(err.message || 'Failed to remove post upvote');
      throw err;
    }
  };

  // Upvote comment
  const upvoteComment = async (postId, commentId) => {
    try {
      const result = await discussionService.upvoteComment(commentId, false);
      // Update comment upvotes from API response
      setPosts(posts.map(p => {
        if (p.postId === postId) {
          return {
            ...p,
            comments: (p.comments || []).map(c => {
              if (c.commentId === commentId) {
                return {
                  ...c,
                  upvotes: result.upvotes,
                };
              }
              return c;
            }),
          };
        }
        return p;
      }));
    } catch (err) {
      setError(err.message || 'Failed to upvote comment');
      throw err;
    }
  };

  // Remove comment upvote
  const removeCommentUpvote = async (postId, commentId) => {
    try {
      const result = await discussionService.upvoteComment(commentId, true);
      // Update comment upvotes from API response
      setPosts(posts.map(p => {
        if (p.postId === postId) {
          return {
            ...p,
            comments: (p.comments || []).map(c => {
              if (c.commentId === commentId) {
                return {
                  ...c,
                  upvotes: result.upvotes,
                };
              }
              return c;
            }),
          };
        }
        return p;
      }));
    } catch (err) {
      setError(err.message || 'Failed to remove comment upvote');
      throw err;
    }
  };

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    createComment,
    updateComment,
    deleteComment,
    upvotePost,
    removePostUpvote,
    upvoteComment,
    removeCommentUpvote,
  };
};

export default useDiscussion;
