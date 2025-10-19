import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import CommentItem from './CommentItem.jsx';
import './CommentList.css';

const CommentList = ({ comments, onAddReply, onUpvote, onRemoveUpvote }) => {
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'popular'
  const [isSorting, setIsSorting] = useState(false);
  const commentsContainerRef = useRef(null);
  
  // Handle sort option change with animation
  const handleSortChange = useCallback((newSortBy) => {
    if (sortBy === newSortBy) return;
    
    // Apply animation
    setIsSorting(true);
    setSortBy(newSortBy);
    
    if (commentsContainerRef.current) {
      commentsContainerRef.current.classList.add('sort-animation');
      
      // Remove animation class after animation completes
      setTimeout(() => {
        if (commentsContainerRef.current) {
          commentsContainerRef.current.classList.remove('sort-animation');
        }
        setIsSorting(false);
      }, 400); // Match animation duration
    }
  }, [sortBy]);
  
  // Sort only parent-level comments based on sortBy value
  // Replies within each comment retain their original order
  const sortedComments = useMemo(() => {
    if (!comments || !Array.isArray(comments)) return [];
    
    // Create a deep copy of the comments array to avoid modifying the original
    const commentsCopy = comments.map(comment => ({
      ...comment
    }));
    
    // Define the tooltip text based on sort selection
    const getSortTooltip = (type) => {
      return `${type} first (only parent comments are sorted)`;
    };
    
    // Sort only the parent-level comments
    switch (sortBy) {
      case 'newest':
        return commentsCopy.sort((a, b) => {
          // Keep sorting logic only for top-level comments
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      case 'oldest':
        return commentsCopy.sort((a, b) => {
          // Keep sorting logic only for top-level comments
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
      case 'popular':
        return commentsCopy.sort((a, b) => {
          // Sort by upvotes count
          const aUpvotes = a.upvotes?.count || 0;
          const bUpvotes = b.upvotes?.count || 0;
          
          // If upvotes are equal, fallback to newest first
          if (bUpvotes === aUpvotes) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          
          return bUpvotes - aUpvotes;
        });
      default:
        return commentsCopy;
    }
  }, [comments, sortBy]);
  if (comments.length === 0) {
    return (
      <div className="empty-comments">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  // Count all comments including nested replies recursively
  const countAllComments = () => {
    const countCommentsRecursively = (commentsArray) => {
      if (!commentsArray || commentsArray.length === 0) {
        return 0;
      }
      
      let count = commentsArray.length;
      
      commentsArray.forEach(comment => {
        if (comment.replies && Array.isArray(comment.replies)) {
          count += countCommentsRecursively(comment.replies);
        }
      });
      
      return count;
    };
    
    return countCommentsRecursively(comments);
  };

  const totalCommentCount = countAllComments();

  return (
    <div className="comments-container">
      <div className="comments-header">
        <h2>All Comments ({totalCommentCount})</h2>
        
        <div className="sort-controls">
          <span className="sort-label">Sort top-level comments by:</span>
          <div className="sort-options">
            <button 
              className={`sort-option ${sortBy === 'newest' ? 'active' : ''}`}
              onClick={() => handleSortChange('newest')}
              disabled={isSorting}
            >
              <span className="tooltip">
                Newest
                <span className="tooltip-text">Sort by most recent comments first</span>
              </span>
            </button>
            <button 
              className={`sort-option ${sortBy === 'oldest' ? 'active' : ''}`}
              onClick={() => handleSortChange('oldest')}
              disabled={isSorting}
            >
              <span className="tooltip">
                Oldest
                <span className="tooltip-text">Sort by oldest comments first</span>
              </span>
            </button>
            <button 
              className={`sort-option ${sortBy === 'popular' ? 'active' : ''}`}
              onClick={() => handleSortChange('popular')}
              disabled={isSorting}
            >
              <span className="tooltip">
                Most Upvoted
                <span className="tooltip-text">Sort by highest upvote count</span>
              </span>
            </button>
          </div>
        </div>
      </div>
      
      <div 
        ref={commentsContainerRef} 
        className="comments-list"
      >
        {sortedComments.map((comment) => (
          <CommentItem 
            key={comment._id} 
            comment={comment} 
            onAddReply={onAddReply}
            onUpvote={onUpvote}
            onRemoveUpvote={onRemoveUpvote}
            forceCollapse={false}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentList;