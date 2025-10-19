import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReplyForm from './ReplyForm';
import './CommentItem.css'; // Import the animation styles

const CommentItem = ({ 
  comment, 
  onAddReply, 
  onUpvote, 
  onRemoveUpvote, 
  isReply = false, 
  level = 0, 
  forceCollapse = false 
}) => {
  // Get collapse state from localStorage or use false as default
  const getStoredCollapseState = () => {
    try {
      const storedState = localStorage.getItem(`comment-${comment._id}-collapsed`);
      return storedState === 'true';
    } catch (e) {
      return false;
    }
  };
  
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(getStoredCollapseState());
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevUpvoteCount, setPrevUpvoteCount] = useState(comment.upvotes?.count || 0);
  const { currentUser } = useAuth();
  const commentRef = useRef(null);
  const upvoteCountRef = useRef(null);
  
  // Effect to handle force collapse from parent with localStorage persistence
  useEffect(() => {
    if (forceCollapse) {
      setIsCollapsed(true);
      // Update localStorage when forced collapse
      try {
        localStorage.setItem(`comment-${comment._id}-collapsed`, 'true');
      } catch (e) {
        console.error('Failed to save collapse state:', e);
      }
    }
  }, [forceCollapse, comment._id]);
  
  // Effect to animate vote count changes
  useEffect(() => {
    const currentUpvoteCount = comment.upvotes?.count || 0;
    
    if (upvoteCountRef.current && prevUpvoteCount !== currentUpvoteCount) {
      // Add animation class
      upvoteCountRef.current.classList.add('vote-change');
      
      // Remove animation class after animation completes
      const timeout = setTimeout(() => {
        if (upvoteCountRef.current) {
          upvoteCountRef.current.classList.remove('vote-change');
        }
      }, 300); // Match animation duration
      
      // Update previous count
      setPrevUpvoteCount(currentUpvoteCount);
      
      return () => clearTimeout(timeout);
    }
  }, [comment.upvotes?.count, prevUpvoteCount]);
  
  // Effect to add animation for new comments
  useEffect(() => {
    if (commentRef.current && !isReply) {
      commentRef.current.classList.add('new-comment');
      
      const timeout = setTimeout(() => {
        if (commentRef.current) {
          commentRef.current.classList.remove('new-comment');
        }
      }, 500); // Match animation duration
      
      return () => clearTimeout(timeout);
    }
  }, []);
  
  // Format the date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleReplyClick = () => {
    setShowReplyForm(!showReplyForm);
  };

  const handleSubmitReply = async (replyText) => {
    const success = await onAddReply(comment._id, replyText);
    if (success) {
      setShowReplyForm(false);
      setIsCollapsed(false); // Auto-expand when a new reply is added
    }
    return success;
  };
  
  const toggleCollapse = () => {
    setIsAnimating(true);
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    
    // Store collapse state in localStorage
    try {
      localStorage.setItem(`comment-${comment._id}-collapsed`, newCollapsedState.toString());
    } catch (e) {
      console.error('Failed to save collapse state:', e);
    }
    
    // Remove animation class after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 400); // Match animation duration
  };
  
  const handleUpvoteClick = async () => {
    if (!currentUser) {
      alert('You must be logged in to upvote comments');
      return;
    }
    
    if (isUpvoting) return; // Prevent multiple clicks
    
    setIsUpvoting(true);
    try {
      // If user has already upvoted, remove upvote, otherwise add upvote
      const hasUpvoted = comment.upvotes?.userHasUpvoted;
      let success;
      
      // Optimistic UI update - Add animation before API call completes
      if (upvoteCountRef.current) {
        upvoteCountRef.current.classList.add('vote-change');
      }
      
      if (hasUpvoted) {
        success = await onRemoveUpvote(comment._id);
      } else {
        success = await onUpvote(comment._id);
      }
      
      if (!success) {
        // Display a message using a more elegant method than alert in a real app
        console.error('Failed to update upvote status');
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
    } finally {
      // Remove animation class after a delay
      setTimeout(() => {
        if (upvoteCountRef.current) {
          upvoteCountRef.current.classList.remove('vote-change');
        }
        setIsUpvoting(false);
      }, 300);
    }
  };

  // Calculate the indentation for replies
  const indentStyle = {
    marginLeft: isReply ? `${level * 20}px` : '0',
  };

  // Debug info for this component
  console.log(`Rendering comment ${comment._id}:`, { 
    hasReplies: comment.replies && comment.replies.length > 0,
    replyCount: comment.replies ? comment.replies.length : 0,
    isReply,
    level,
    isCollapsed
  });
  
  // Get reply count for aria-labels
  const replyCount = comment.replies ? comment.replies.length : 0;
  const replyText = replyCount === 1 ? '1 reply' : `${replyCount} replies`;

  // Get upvote count and whether current user has upvoted
  const upvoteCount = comment.upvotes?.count || 0;
  const userHasUpvoted = comment.upvotes?.userHasUpvoted || false;
  
  return (
    <>
      <div 
        ref={commentRef}
        className={`comment ${isReply ? 'comment-reply' : ''} ${isReply ? 'reply-animation' : ''}`} 
        style={indentStyle}>
        <div className="comment-header">
          <span className="comment-name">{comment.username}</span>
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
        </div>
        <div className="comment-text">{comment.text}</div>
        <div className="comment-footer">
          <div className="comment-vote-wrapper">
            <button 
              onClick={handleUpvoteClick}
              disabled={isUpvoting || !currentUser}
              className={`upvote-btn ${userHasUpvoted ? 'active' : ''}`}
              title={userHasUpvoted ? 'Remove upvote' : 'Upvote this comment'}
              aria-label={userHasUpvoted ? 'Remove upvote' : 'Upvote this comment'}
            >
              <span className="upvote-icon">▲</span>
            </button>
            <span 
              ref={upvoteCountRef} 
              className="vote-count"
            >
              {upvoteCount}
            </span>
          </div>
          <div className="comment-actions">
            {currentUser && (
              <button 
                onClick={handleReplyClick} 
                className="reply-button"
              >
                {showReplyForm ? 'Cancel' : 'Reply'}
              </button>
            )}
            {comment.replies && comment.replies.length > 0 && (
              <>
                <button
                  onClick={toggleCollapse}
                  className="toggle-button"
                  aria-label={isCollapsed ? `Expand ${replyText}` : `Collapse ${replyText}`}
                  title={isCollapsed ? `Show ${replyText}` : `Hide ${replyText}`}
                >
                  {isCollapsed ? '▶ Show' : '▼ Hide'}
                </button>
                <span className="reply-count">
                  {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </span>
              </>
            )}
          </div>
        </div>
        
        {showReplyForm && (
          <div className="reply-form-container reply-animation">
            <ReplyForm onSubmitReply={handleSubmitReply} />
          </div>
        )}
      </div>
      
      {/* Render nested replies if they exist and not collapsed */}
      {comment.replies && comment.replies.length > 0 && !isCollapsed && (
        <div className={`replies-container replies-level-${level} ${isAnimating ? 'reply-animation' : ''}`}>
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply._id} 
              comment={reply} 
              onAddReply={onAddReply}
              onUpvote={onUpvote}
              onRemoveUpvote={onRemoveUpvote}
              isReply={true}
              forceCollapse={forceCollapse}
              level={level + 1}
            />
          ))}
        </div>
      )}
      
      {/* Show a collapsed indicator when replies are hidden */}
      {comment.replies && comment.replies.length > 0 && isCollapsed && (
        <div 
          className="collapsed-indicator" 
          onClick={toggleCollapse} 
          onKeyDown={(e) => e.key === 'Enter' && toggleCollapse()}
          tabIndex={0}
          role="button"
          aria-label={`Expand ${replyText}`}
        >
          <span className="collapsed-text">
            {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'} hidden
          </span>
        </div>
      )}
    </>
  );
};

export default CommentItem;