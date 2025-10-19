import React, { useState } from 'react';

const CommentForm = ({ onAddComment }) => {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim() || !text.trim()) {
      setError('Name and comment text are required!');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    const success = await onAddComment({ name, text });
    
    if (success) {
      // Reset form after successful submission
      setName('');
      setText('');
    } else {
      setError('Failed to post comment. Please try again.');
    }
    
    setSubmitting(false);
  };

  return (
    <div className="comment-form">
      <h2>Add a Comment</h2>
      
      {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            placeholder="Your name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="comment">Comment:</label>
          <textarea
            id="comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submitting}
            placeholder="Write your comment here..."
          />
        </div>
        
        <button type="submit" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
};

export default CommentForm;