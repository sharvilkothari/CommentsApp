import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, error } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
  };
  
  return (
    <div className="auth-form">
      <h2>Sign In</h2>
      
      {error && <p className="error">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            autoComplete="email"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? (
            <span>Signing in...</span>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>
      
      <p className="form-toggle">
        Don't have an account?{' '}
        <button type="button" onClick={onToggleForm}>
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default LoginForm;