import { useState } from 'react';
import useDiscussion from '../hooks/useDiscussion';
import { useAuth } from '../contexts/AuthContext';
import '../assets/CSS/Discussion.css';

/**
 * Discussion Component
 * Full-featured forum for lesson discussions
 */
export default function Discussion({ lessonId }) {
  const { user } = useAuth();
  const {
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
  } = useDiscussion(lessonId);

  // State management
  const [showCreatePostForm, setShowCreatePostForm] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [createPostLoading, setCreatePostLoading] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');

  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [userUpvotes, setUserUpvotes] = useState({});
  const [userCommentUpvotes, setUserCommentUpvotes] = useState({});

  // Handle create post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      alert('Please enter title and content');
      return;
    }
    
    // Validation matching backend requirements
    if (postTitle.trim().length < 6) {
      alert('Title must be at least 6 characters long');
      return;
    }
    
    if (postContent.trim().length < 11) {
      alert('Content must be at least 11 characters long');
      return;
    }

    try {
      setCreatePostLoading(true);
      await createPost(postTitle, postContent);
      setPostTitle('');
      setPostContent('');
      setShowCreatePostForm(false);
    } catch (err) {
      alert('Error creating post: ' + err.message);
    } finally {
      setCreatePostLoading(false);
    }
  };

  // Handle update post
  const handleUpdatePost = async (postId) => {
    if (!editPostTitle.trim() || !editPostContent.trim()) {
      alert('Please enter title and content');
      return;
    }
    
    // Validation matching backend requirements
    if (editPostTitle.trim().length < 6) {
      alert('Title must be at least 6 characters long');
      return;
    }
    
    if (editPostContent.trim().length < 11) {
      alert('Content must be at least 11 characters long');
      return;
    }

    try {
      await updatePost(postId, editPostTitle, editPostContent);
      setEditingPostId(null);
      setEditPostTitle('');
      setEditPostContent('');
    } catch (err) {
      alert('Error updating post: ' + err.message);
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await deletePost(postId);
    } catch (err) {
      alert('Error deleting post: ' + err.message);
    }
  };

  // Handle upvote post
  const handleUpvotePost = async (postId) => {
    try {
      const isUpvoted = userUpvotes[postId];
      if (isUpvoted) {
        await removePostUpvote(postId);
        setUserUpvotes(prev => ({ ...prev, [postId]: false }));
      } else {
        await upvotePost(postId);
        setUserUpvotes(prev => ({ ...prev, [postId]: true }));
      }
    } catch (err) {
      alert('Error upvoting: ' + err.message);
    }
  };

  // Handle upvote comment
  const handleUpvoteComment = async (postId, commentId) => {
    try {
      const upvoteKey = `${postId}-${commentId}`;
      const isUpvoted = userCommentUpvotes[upvoteKey];
      if (isUpvoted) {
        await removeCommentUpvote(postId, commentId);
        setUserCommentUpvotes(prev => ({ ...prev, [upvoteKey]: false }));
      } else {
        await upvoteComment(postId, commentId);
        setUserCommentUpvotes(prev => ({ ...prev, [upvoteKey]: true }));
      }
    } catch (err) {
      alert('Error upvoting comment: ' + err.message);
    }
  };

  // Handle create comment
  const handleCreateComment = async (postId) => {
    const content = commentText[postId];
    if (!content || !content.trim()) {
      alert('Please enter comment content');
      return;
    }

    try {
      await createComment(postId, content);
      setCommentText({ ...commentText, [postId]: '' });
    } catch (err) {
      alert('Error creating comment: ' + err.message);
    }
  };

  // Handle update comment
  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) {
      alert('Please enter comment content');
      return;
    }

    try {
      await updateComment(expandedPostId, commentId, editCommentText);
      setEditingCommentId(null);
      setEditCommentText('');
    } catch (err) {
      alert('Error updating comment: ' + err.message);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(expandedPostId, commentId);
    } catch (err) {
      alert('Error deleting comment: ' + err.message);
    }
  };

  if (!user) {
    return (
      <div className="discussion-container">
        <div className="discussion-message">
          Please log in to participate in the discussion
        </div>
      </div>
    );
  }

  return (
    <div className="discussion-container">
      <div className="discussion-header">
        <h2>Discussion</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreatePostForm(!showCreatePostForm)}
        >
          {showCreatePostForm ? 'Cancel' : '+ Create Post'}
        </button>
      </div>

      {/* Create Post Form */}
      {showCreatePostForm && (
        <div className="create-post-form">
          <h3>Create New Post</h3>
          <form onSubmit={handleCreatePost}>
            <input
              type="text"
              placeholder="Title"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              required
              maxLength="255"
            />
            <textarea
              placeholder="Content..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              required
              maxLength="5000"
              rows="5"
            />
            <button type="submit" disabled={createPostLoading}>
              {createPostLoading ? 'Creating...' : 'Post'}
            </button>
          </form>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="no-posts">No posts yet. Be the first to create one!</div>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.postId} className="post-card">
              {editingPostId === post.postId ? (
                // Edit Post Form
                <div className="edit-post-form">
                  <input
                    type="text"
                    value={editPostTitle}
                    onChange={(e) => setEditPostTitle(e.target.value)}
                    maxLength="255"
                  />
                  <textarea
                    value={editPostContent}
                    onChange={(e) => setEditPostContent(e.target.value)}
                    maxLength="5000"
                    rows="4"
                  />
                  <div className="form-buttons">
                    <button
                      className="btn btn-success"
                      onClick={() => handleUpdatePost(post.postId)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setEditingPostId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Post Header */}
                  <div className="post-header">
                    <div className="post-title-section">
                      <h3>{post.title}</h3>
                      <p className="post-meta">
                        by {post.user?.fullName || 'Anonymous'} • {' '}
                        {new Date(post.createdAt).toLocaleDateString('en-US')}
                      </p>
                    </div>
                    <div className="post-actions">
                      {(user?.id === post.userId || user?.role === 'admin') && (
                        <>
                          <button
                            className="btn-icon"
                            onClick={() => {
                              setEditingPostId(post.postId);
                              setEditPostTitle(post.title);
                              setEditPostContent(post.content);
                            }}
                            title="Edit"
                          >
                            <img src="/icons/edit-button-icon.png" alt="Edit" className="icon-img" />
                          </button>
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => handleDeletePost(post.postId)}
                            title="Delete"
                          >
                            <img src="/icons/delete-button-icon.png" alt="Delete" className="icon-img" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="post-content">
                    <p>{post.content}</p>
                  </div>

                  {/* Post Footer with Upvote and Comments */}
                  <div className="post-footer">
                    <div className="post-stats">
                      <button
                        className={`upvote-btn ${
                          userUpvotes[post.postId] ? 'upvoted' : ''
                        }`}
                        onClick={() => handleUpvotePost(post.postId)}
                      >
                        👍 {post.upvotes || 0}
                      </button>
                      <button
                        className="comments-btn"
                        onClick={() =>
                          setExpandedPostId(
                            expandedPostId === post.postId ? null : post.postId
                          )
                        }
                      >
                        {(post.comments || []).length} Comments
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {expandedPostId === post.postId && (
                    <div className="comments-section">
                      <div className="comments-list">
                        {(post.comments || []).map((comment) => (
                          <div key={comment.commentId} className="comment">
                            {editingCommentId === comment.commentId ? (
                              // Edit Comment Form
                              <div className="edit-comment-form">
                                <textarea
                                  value={editCommentText}
                                  onChange={(e) =>
                                    setEditCommentText(e.target.value)
                                  }
                                  maxLength="2000"
                                  rows="2"
                                />
                                <div className="form-buttons">
                                  <button
                                    className="btn btn-success"
                                    onClick={() =>
                                      handleUpdateComment(comment.commentId)
                                    }
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="btn btn-secondary"
                                    onClick={() => setEditingCommentId(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="comment-header">
                                  <strong>
                                    {comment.user?.fullName || 'Anonymous'}
                                  </strong>
                                  <span className="comment-date">
                                    {new Date(
                                      comment.createdAt
                                    ).toLocaleDateString('en-US')}
                                  </span>
                                  <div className="comment-actions">
                                    {(user?.id === comment.userId ||
                                      user?.role === 'admin') && (
                                      <>
                                        <button
                                          className="btn-icon"
                                          onClick={() => {
                                            setEditingCommentId(
                                              comment.commentId
                                            );
                                            setEditCommentText(
                                              comment.content
                                            );
                                          }}
                                          title="Edit"
                                        >
                                          <img src="/icons/edit-button-icon.png" alt="Edit" className="icon-img" />
                                        </button>
                                        <button
                                          className="btn-icon btn-danger"
                                          onClick={() =>
                                            handleDeleteComment(
                                              comment.commentId
                                            )
                                          }
                                          title="Delete"
                                        >
                                          <img src="/icons/delete-button-icon.png" alt="Delete" className="icon-img" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <p className="comment-content">
                                  {comment.content}
                                </p>
                                <button
                                  className={`upvote-btn ${
                                    userCommentUpvotes[`${post.postId}-${comment.commentId}`]
                                      ? 'upvoted'
                                      : ''
                                  }`}
                                  onClick={() =>
                                    handleUpvoteComment(post.postId, comment.commentId)
                                  }
                                >
                                  👍 {comment.upvotes || 0}
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Create Comment Form */}
                      <div className="create-comment-form">
                        <textarea
                          placeholder="Write a comment..."
                          value={commentText[post.postId] || ''}
                          onChange={(e) =>
                            setCommentText({
                              ...commentText,
                              [post.postId]: e.target.value,
                            })
                          }
                          maxLength="2000"
                          rows="3"
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => handleCreateComment(post.postId)}
                        >
                          Send Comment
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
