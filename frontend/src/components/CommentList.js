import React from 'react';
import Comment from './Comment';

const CommentList = ({ comments }) => {
  if (comments.length === 0) {
    return (
      <div className="empty-comments">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="comments-container">
      <h2>All Comments ({comments.length})</h2>
      {comments.map((comment) => (
        <Comment key={comment._id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;