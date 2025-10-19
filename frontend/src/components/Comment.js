import React from 'react';

const Comment = ({ comment }) => {
  // Format the date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="comment">
      <div className="comment-header">
        <span className="comment-name">{comment.name}</span>
        <span className="comment-date">{formatDate(comment.createdAt)}</span>
      </div>
      <div className="comment-text">{comment.text}</div>
    </div>
  );
};

export default Comment;