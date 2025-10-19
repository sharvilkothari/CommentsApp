import React, { useState } from 'react';
import './ImageContainer.css';
import dummyImage from '../images/dummy.jpg';

const ImageContainer = ({ onToggleComments }) => {
  const [showComments, setShowComments] = useState(true);
  
  const handleToggle = () => {
    const newState = !showComments;
    setShowComments(newState);
    if (onToggleComments) {
      onToggleComments(newState);
    }
  };
  
  // Simple SVG icons for comments toggle
  const CommentIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12C21 16.9706 16.9706 21 12 21C10.2289 21 8.5736 20.5384 7.14296 19.7368L3 21L4.26316 16.857C3.46157 15.4264 3 13.7711 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  
  const HideIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12C2 12 5.63636 5 12 5C18.3636 5 22 12 22 12C22 12 18.3636 19 12 19C5.63636 19 2 12 2 12Z" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 4L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  
  return (
    <div className="image-container">
      <div className="image-content">
        <img 
          src={dummyImage} 
          alt="Featured content" 
          className="dummy-image"
        />
        <div className="toggle-comments-container">
          <button 
            className="toggle-comments-btn" 
            onClick={handleToggle}
            aria-label={showComments ? "Hide comments" : "Show comments"}
          >
            {showComments ? (
              <>
                <HideIcon /> Hide Comments
              </>
            ) : (
              <>
                <CommentIcon /> Show Comments
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageContainer;