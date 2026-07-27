import React, { useState } from 'react';
import config from '../config';

const Login = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${config.current.apiBaseUrl}/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include' 
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("Non-JSON server response:", textResponse);
        throw new TypeError("Server error: Response was not valid JSON.");
      }

      const data = await response.json();

      if (data.status === 'success' || data.success) {
        onLoginSuccess(data.user);
      } else {
        setMessage(data.message || 'Invalid username or password');
      }
    } catch (error) {
      console.error("Login fetch error:", error);
      setMessage('Server connection failed. Check your network or XAMPP.');
    } finally {
      setLoading(false);
    }
  };

  // --- Helper Component for the Eye Icon (SVG) ---
  const EyeIcon = ({ isVisible }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="feather feather-eye"
    >
      {isVisible ? (
        // Open Eye (Visible)
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </>
      ) : (
        // Closed Eye (Hidden)
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </>
      )}
    </svg>
  );

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>🔥 Golden Ember</h1>
            <p>Student Management System</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                required
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>
            
            {/* Password Field with Eye Icon Toggle */}
            <div className="input-group">
              <label>Password</label>
              <div className="password-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  // Ensure enough padding on the right so text doesn't overlap the icon
                  style={{ width: '100%', paddingRight: '45px', boxSizing: 'border-box' }} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    // Adjust color to match your theme. #aaa is a good default grey
                    color: showPassword ? '#555' : '#aaa', 
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                    // Ensure the button doesn't shrink
                    flexShrink: 0 
                  }}
                >
                  <EyeIcon isVisible={showPassword} />
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {message && <p id="msg" className="error-msg">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;