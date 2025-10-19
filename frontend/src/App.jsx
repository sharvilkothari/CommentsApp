import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CommentForm from './components/CommentForm.jsx';
import CommentList from './components/CommentList.jsx';
import Auth from './components/Auth.jsx';
import UserProfile from './components/UserProfile.jsx';
import LoadingState from './components/LoadingState.jsx';
import ImageContainer from './components/ImageContainer.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import './styles.css';
import './App.css';

// Add CSS for comment section animation
const commentSectionAnimation = {
  enter: {
    opacity: 0,
    maxHeight: '0',
    overflow: 'hidden',
    transition: 'opacity 0.5s ease, max-height 0.5s ease',
  },
  enterActive: {
    opacity: 1,
    maxHeight: '5000px',
    transition: 'opacity 0.5s ease, max-height 0.5s ease',
  },
  exit: {
    opacity: 1,
    maxHeight: '5000px',
    overflow: 'hidden',
    transition: 'opacity 0.5s ease, max-height 0.5s ease',
  },
  exitActive: {
    opacity: 0,
    maxHeight: '0',
    transition: 'opacity 0.5s ease, max-height 0.5s ease',
  },
};

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/comments`;

const AppContent = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showComments, setShowComments] = useState(true);
  const { currentUser, getAuthHeader } = useAuth();
  const notificationRef = useRef(null);

  // Fetch all comments when component mounts or user logs in
  useEffect(() => {
    if (currentUser) {
      // Small delay to ensure token is properly set
      const timeoutId = setTimeout(() => {
        fetchComments();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Reset comments when logged out
      setComments([]);
      setLoading(false);
    }
  }, [currentUser]);

  // Function to fetch comments from the backend
  const fetchComments = async () => {
    try {
      setLoading(true);
      
      if (!currentUser || !currentUser.token) {
        setError('You must be logged in to view comments.');
        setComments([]);
        return;
      }
      
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        setError('Authentication token is missing. Please log in again.');
        return;
      }
      
      // Log the authorization header for debugging
      console.log('Auth headers:', headers);
      
      const response = await axios.get(API_URL, { headers });
      
      console.log('Raw response from API:', response.data);
      
      if (response.status === 200) {
        // Function to count all replies recursively
        const countNestedReplies = (comment) => {
          if (!comment.replies || comment.replies.length === 0) {
            return 0;
          }
          
          let count = comment.replies.length;
          for (const reply of comment.replies) {
            count += countNestedReplies(reply);
          }
          
          return count;
        };
        
        // Log detailed information about each comment and its replies
        response.data.forEach(comment => {
          console.log(`Comment ${comment._id} by ${comment.username}:`, {
            hasRepliesArray: Array.isArray(comment.replies),
            repliesCount: comment.replies ? comment.replies.length : 0,
            totalNestedReplies: countNestedReplies(comment),
            replyData: comment.replies
          });
        });
        
        // Ensure that all replies arrays are properly initialized
        const processedComments = response.data.map(comment => {
          // Ensure top-level comment has replies array
          if (!comment.replies) {
            comment.replies = [];
          }
          
          // Process nested replies to ensure they all have replies arrays
          const processReplies = (replies) => {
            if (!replies) return [];
            
            return replies.map(reply => {
              if (!reply.replies) {
                reply.replies = [];
              } else {
                reply.replies = processReplies(reply.replies);
              }
              return reply;
            });
          };
          
          comment.replies = processReplies(comment.replies);
          return comment;
        });
        
        console.log('Processed comments with nested replies:', processedComments);
        setComments(processedComments);
        setError(null);
      } else {
        throw new Error(`Received unexpected status: ${response.status}`);
      }
    } catch (err) {
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError(`Failed to fetch comments: ${err.response.data.message || err.message}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error: ${err.message}`);
      }
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to show notifications
  const showNotification = (message, type = 'info') => {
    // Hide any existing notification first
    if (notification.show) {
      setNotification(prev => ({ ...prev, show: false }));
      
      // Wait for hide animation to complete
      setTimeout(() => {
        setNotification({ show: true, message, type });
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
          setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
      }, 300);
    } else {
      setNotification({ show: true, message, type });
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    }
  };
  
  // Function to add a new comment
  const addComment = async (commentData) => {
    try {
      if (!currentUser) {
        showNotification('You must be logged in to comment', 'error');
        return false;
      }
      
      const response = await axios.post(
        API_URL, 
        commentData, 
        { headers: getAuthHeader() }
      );
      
      if (response.status === 201) {
        // Add upvote information to match our data structure
        const newComment = {
          ...response.data,
          upvotes: {
            count: 0,
            userHasUpvoted: false,
            users: []
          },
          replies: []
        };
        
        // Update the comments state with the new comment
        setComments(prevComments => [newComment, ...prevComments]);
        showNotification('Comment added successfully!', 'success');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding comment:', error);
      showNotification('Failed to add comment. Please try again.', 'error');
      return false;
    }
  };  // Function to add a reply to a comment
  const addReply = async (parentId, text) => {
    try {
      if (!currentUser) {
        showNotification('You must be logged in to reply', 'error');
        return false;
      }
      
      const response = await axios.post(
        API_URL, 
        { text, parentId }, 
        { headers: getAuthHeader() }
      );
      
      if (!response || !response.data) {
        showNotification('Error adding reply', 'error');
        return false;
      }
      
      // Add upvotes field to match structure
      const newReply = {
        ...response.data,
        upvotes: {
          count: 0,
          userHasUpvoted: false,
          users: []
        },
        replies: []
      };
      
      // Helper function to add reply to nested comments structure
      const addReplyToNestedComments = (comments, parentId, newReply) => {
        return comments.map(comment => {
          if (comment._id === parentId) {
            // Add reply to this comment
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            };
          } else if (comment.replies && comment.replies.length > 0) {
            // Check in this comment's replies
            return {
              ...comment,
              replies: addReplyToNestedComments(comment.replies, parentId, newReply)
            };
          }
          return comment;
        });
      };
      
      // Update the comments state with the new reply using the helper function
      const updatedComments = addReplyToNestedComments(comments, parentId, newReply);
      
      setComments(updatedComments);
      showNotification('Reply added successfully', 'success');
      return true;
    } catch (err) {
      console.error('Error adding reply:', err);
      showNotification('Failed to add reply. Please try again.', 'error');
      return false;
    }
  };

  // Function to handle upvoting a comment
  const handleUpvote = async (commentId) => {
    try {
      if (!currentUser) {
        showNotification('You must be logged in to upvote', 'error');
        return false;
      }
      
      // Optimistically update UI before API response
      const optimisticUpdate = (comments, commentId, increment) => {
        return comments.map(comment => {
          if (comment._id === commentId) {
            const currentCount = comment.upvotes?.count || 0;
            const newCount = increment ? currentCount + 1 : currentCount;
            return {
              ...comment,
              upvotes: {
                ...comment.upvotes,
                count: newCount,
                userHasUpvoted: increment
              }
            };
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: optimisticUpdate(comment.replies, commentId, increment)
            };
          }
          return comment;
        });
      };
      
      // Update UI optimistically
      setComments(prevComments => optimisticUpdate(prevComments, commentId, true));

      const response = await axios.post(
        `${API_URL}/${commentId}/upvote`, 
        {}, 
        { headers: getAuthHeader() }
      );

      // Helper function to update comment with upvote info
      const updateCommentWithUpvote = (comments, commentId, upvoteData) => {
        return comments.map(comment => {
          if (comment._id === commentId) {
            // Update this comment's upvote info
            return {
              ...comment,
              upvotes: {
                ...comment.upvotes,
                count: upvoteData.upvotes,
                userHasUpvoted: upvoteData.userHasUpvoted
              }
            };
          } else if (comment.replies && comment.replies.length > 0) {
            // Check in this comment's replies
            return {
              ...comment,
              replies: updateCommentWithUpvote(comment.replies, commentId, upvoteData)
            };
          }
          return comment;
        });
      };
      
      // Update comments state with new upvote data
      const updatedComments = updateCommentWithUpvote(comments, commentId, response.data);
      setComments(updatedComments);
      return true;
    } catch (err) {
      // Revert optimistic update if failed
      const revertUpdate = (comments, commentId) => {
        return comments.map(comment => {
          if (comment._id === commentId) {
            const currentCount = comment.upvotes?.count || 0;
            return {
              ...comment,
              upvotes: {
                ...comment.upvotes,
                count: currentCount > 0 ? currentCount - 1 : 0,
                userHasUpvoted: false
              }
            };
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: revertUpdate(comment.replies, commentId)
            };
          }
          return comment;
        });
      };
      
      setComments(prevComments => revertUpdate(prevComments, commentId));
      showNotification('Failed to upvote comment', 'error');
      console.error('Error upvoting comment:', err);
      return false;
    }
  };

  // Function to handle removing upvote from a comment
  const handleRemoveUpvote = async (commentId) => {
    try {
      if (!currentUser) {
        showNotification('You must be logged in to remove your upvote', 'error');
        return false;
      }
      
      // Optimistically update UI before API response
      const optimisticUpdate = (comments, commentId) => {
        return comments.map(comment => {
          if (comment._id === commentId) {
            const currentCount = comment.upvotes?.count || 0;
            return {
              ...comment,
              upvotes: {
                ...comment.upvotes,
                count: currentCount > 0 ? currentCount - 1 : 0,
                userHasUpvoted: false
              }
            };
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: optimisticUpdate(comment.replies, commentId)
            };
          }
          return comment;
        });
      };
      
      // Update UI optimistically
      setComments(prevComments => optimisticUpdate(prevComments, commentId));

      const response = await axios.delete(
        `${API_URL}/${commentId}/upvote`, 
        { headers: getAuthHeader() }
      );

      // Helper function to update comment with upvote info (same as above)
      const updateCommentWithUpvote = (comments, commentId, upvoteData) => {
        return comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              upvotes: {
                ...comment.upvotes,
                count: upvoteData.upvotes,
                userHasUpvoted: upvoteData.userHasUpvoted
              }
            };
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentWithUpvote(comment.replies, commentId, upvoteData)
            };
          }
          return comment;
        });
      };
      
      // Update comments state with new upvote data
      const updatedComments = updateCommentWithUpvote(comments, commentId, response.data);
      setComments(updatedComments);
      return true;
    } catch (err) {
      // Revert optimistic update if failed
      const revertUpdate = (comments, commentId) => {
        return comments.map(comment => {
          if (comment._id === commentId) {
            const currentCount = comment.upvotes?.count || 0;
            return {
              ...comment,
              upvotes: {
                ...comment.upvotes,
                count: currentCount + 1,
                userHasUpvoted: true
              }
            };
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: revertUpdate(comment.replies, commentId)
            };
          }
          return comment;
        });
      };
      
      setComments(prevComments => revertUpdate(prevComments, commentId));
      showNotification('Failed to remove upvote', 'error');
      console.error('Error removing upvote:', err);
      return false;
    }
  };

  return (
    <div className="app-wrapper">
      <div className="app-container">
        <h1>Comments App</h1>
        
        <div className="auth-section">
          {currentUser ? <UserProfile /> : <Auth />}
        </div>
        
        {notification.show && (
          <div className={`toast-notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        
        
        {currentUser ? (
          <>
            {/* Add ImageContainer only when logged in */}
            <ImageContainer onToggleComments={(visible) => setShowComments(visible)} />
            
            <div className={`comments-section ${showComments ? 'visible' : 'hidden'}`}>
              <div className="comment-form-container">
                <CommentForm onAddComment={addComment} />
              </div>
              
              <LoadingState loading={loading} error={error}>
                <CommentList 
                  comments={comments} 
                  onAddReply={addReply}
                  onUpvote={handleUpvote}
                  onRemoveUpvote={handleRemoveUpvote} 
                />
              </LoadingState>
            </div>
          </>
        ) : (
          <div className="login-prompt">
            <h2>Welcome to Comments App</h2>
            <p>Please sign in or create an account to view and post comments.</p>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;