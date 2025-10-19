import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './CommentForm.css';

const CommentForm = ({ onAddComment }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!text.trim()) {
      setError('Comment text is required!');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    const success = await onAddComment({ text });
    
    if (success) {
      // Reset form after successful submission
      setText('');
    } else {
      setError('Failed to post comment. Please try again.');
    }
    
    setSubmitting(false);
  };

  // SVG icon for the post button
  const SendIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  
  const ErrorIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  
  const UserIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  
  return (
    <div className="comment-form">
      <h2>Add a Comment</h2>
      
      {error && (
        <div className="error">
          <ErrorIcon />
          <span>{error}</span>
        </div>
      )}
      
      {currentUser ? (
        <form onSubmit={handleSubmit}>
          <p className="commenting-as">
            <UserIcon />
            Posting as <strong>{currentUser.username}</strong>
          </p>
          
          <div className="form-group">
            <label htmlFor="comment">Share your thoughts</label>
            <textarea
              id="comment"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={submitting}
              placeholder="Write your comment here..."
            />
          </div>
          
          <button type="submit" disabled={submitting}>
            {submitting ? (
              'Posting...'
            ) : (
              <>
                <SendIcon /> Post Comment
              </>
            )}
          </button>
        </form>
      ) : (
        <p className="login-prompt">Please log in to post comments</p>
      )}
    </div>
  );
};

export default CommentForm;