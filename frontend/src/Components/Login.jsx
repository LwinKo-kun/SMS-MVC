import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage(''); // Clear message before trying

  try {
    const response = await fetch('http://localhost/student-MVC/backend/api/login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // REQUIRED for PHP to read the body
      },
      body: JSON.stringify(credentials),
      credentials: 'include' // REQUIRED for PHPSESSID cookies to work
    });

    // Check if the response is actually JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Oops, the server didn't send JSON back!");
    }

    const data = await response.json();
    
    // Note: I used data.status because our PHP usually sends {status: 'success'}
    if (data.status === 'success' || data.success) {
      onLoginSuccess();
    } else {
      setMessage(data.message || 'Invalid username or password');
    }
  } catch (error) {
    console.error("Fetch error:", error);
    setMessage('Server error. Check if XAMPP is running.');
  }
};

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
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                required 
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
            </div>
            <button type="submit" className="login-btn">Login</button>
            {message && <p id="msg">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;