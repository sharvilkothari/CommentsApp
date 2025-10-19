import React, { useState, useRef, useEffect } from 'react';
import './ReplyForm.css';

const ReplyForm = ({ onSubmitReply }) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const textareaRef = useRef(null);
  const formRef = useRef(null);
  
  // Focus on textarea when form is rendered
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!text.trim()) {
      setError('Reply text is required!');
      // Add shake animation to the form
      if (formRef.current) {
        formRef.current.classList.add('error');
        setTimeout(() => {
          formRef.current?.classList.remove('error');
        }, 500);
      }
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const success = await onSubmitReply(text);
      
      if (success) {
        // Show success animation briefly
        setSubmitSuccess(true);
        // Reset form after successful submission
        setText('');
        
        // Reset success state after animation
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 1000);
      } else {
        setError('Failed to post reply. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Reply submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`reply-form ${submitSuccess ? 'submit-success' : ''}`}>
      {error && <p className="error">{error}</p>}
      
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submitting}
            placeholder="Write your reply here..."
            rows="2"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={submitting} 
          className={`reply-submit-button ${submitting ? 'submitting' : ''}`}
        >
          {submitting ? 'Posting...' : submitSuccess ? 'Posted!' : 'Post Reply'}
        </button>
      </form>
    </div>
  );
};

export default ReplyForm;