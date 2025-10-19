import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentForm from './components/CommentForm';
import CommentList from './components/CommentList';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/comments`;

function App() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all comments when component mounts
  useEffect(() => {
    fetchComments();
  }, []);

  // Function to fetch comments from the backend
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setComments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch comments. Please try again later.');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new comment
  const addComment = async (commentData) => {
    try {
      const response = await axios.post(API_URL, commentData);
      setComments([response.data, ...comments]);
      return true;
    } catch (err) {
      console.error('Error adding comment:', err);
      return false;
    }
  };

  return (
    <div className="container">
      <h1>Comments App</h1>
      
      <CommentForm onAddComment={addComment} />
      
      {loading ? (
        <p>Loading comments...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <CommentList comments={comments} />
      )}
    </div>
  );
}

export default App;