import { useState } from 'react';
import useDiscussion from '../hooks/useDiscussion';
import { useAuth } from '../contexts/AuthContext';
import './Discussion.css';

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
      alert('Vui lòng nhập tiêu đề và nội dung');
      return;
    }

    try {
      setCreatePostLoading(true);
      await createPost(postTitle, postContent);
      setPostTitle('');
      setPostContent('');
      setShowCreatePostForm(false);
    } catch (err) {
      alert('Lỗi tạo post: ' + err.message);
    } finally {
      setCreatePostLoading(false);
    }
  };

  // Handle update post
  const handleUpdatePost = async (postId) => {
    if (!editPostTitle.trim() || !editPostContent.trim()) {
      alert('Vui lòng nhập tiêu đề và nội dung');
      return;
    }

    try {
      await updatePost(postId, editPostTitle, editPostContent);
      setEditingPostId(null);
      setEditPostTitle('');
      setEditPostContent('');
    } catch (err) {
      alert('Lỗi cập nhật post: ' + err.message);
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa post này?')) return;

    try {
      await deletePost(postId);
    } catch (err) {
      alert('Lỗi xóa post: ' + err.message);
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
      alert('Lỗi upvote: ' + err.message);
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
      alert('Lỗi upvote comment: ' + err.message);
    }
  };

  // Handle create comment
  const handleCreateComment = async (postId) => {
    const content = commentText[postId];
    if (!content || !content.trim()) {
      alert('Vui lòng nhập nội dung comment');
      return;
    }

    try {
      await createComment(postId, content);
      setCommentText({ ...commentText, [postId]: '' });
    } catch (err) {
      alert('Lỗi tạo comment: ' + err.message);
    }
  };

  // Handle update comment
  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) {
      alert('Vui lòng nhập nội dung comment');
      return;
    }

    try {
      await updateComment(expandedPostId, commentId, editCommentText);
      setEditingCommentId(null);
      setEditCommentText('');
    } catch (err) {
      alert('Lỗi cập nhật comment: ' + err.message);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa comment này?')) return;

    try {
      await deleteComment(expandedPostId, commentId);
    } catch (err) {
      alert('Lỗi xóa comment: ' + err.message);
    }
  };

  if (!user) {
    return (
      <div className="discussion-container">
        <div className="discussion-message">
          Vui lòng đăng nhập để tham gia thảo luận
        </div>
      </div>
    );
  }

  return (
    <div className="discussion-container">
      <div className="discussion-header">
        <h2>💬 Thảo Luận</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreatePostForm(!showCreatePostForm)}
        >
          {showCreatePostForm ? 'Hủy' : '+ Tạo Post'}
        </button>
      </div>

      {/* Create Post Form */}
      {showCreatePostForm && (
        <div className="create-post-form">
          <h3>Tạo Post Mới</h3>
          <form onSubmit={handleCreatePost}>
            <input
              type="text"
              placeholder="Tiêu đề"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              required
              maxLength="255"
            />
            <textarea
              placeholder="Nội dung..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              required
              maxLength="5000"
              rows="5"
            />
            <button type="submit" disabled={createPostLoading}>
              {createPostLoading ? 'Đang tạo...' : 'Đăng Post'}
            </button>
          </form>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : posts.length === 0 ? (
        <div className="no-posts">Chưa có post nào. Hãy tạo post đầu tiên!</div>
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
                      Lưu
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setEditingPostId(null)}
                    >
                      Hủy
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
                        bởi {post.user?.fullName || 'Ẩn danh'} • {' '}
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
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
                            title="Chỉnh sửa"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => handleDeletePost(post.postId)}
                            title="Xóa"
                          >
                            🗑️
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
                        💬 {(post.comments || []).length} Comments
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
                                    Lưu
                                  </button>
                                  <button
                                    className="btn btn-secondary"
                                    onClick={() => setEditingCommentId(null)}
                                  >
                                    Hủy
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="comment-header">
                                  <strong>
                                    {comment.user?.fullName || 'Ẩn danh'}
                                  </strong>
                                  <span className="comment-date">
                                    {new Date(
                                      comment.createdAt
                                    ).toLocaleDateString('vi-VN')}
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
                                          title="Chỉnh sửa"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          className="btn-icon btn-danger"
                                          onClick={() =>
                                            handleDeleteComment(
                                              comment.commentId
                                            )
                                          }
                                          title="Xóa"
                                        >
                                          🗑️
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
                          placeholder="Viết comment..."
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
                          Gửi Comment
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
