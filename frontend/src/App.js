import React, { useState, useEffect } from 'react';
import Dashboard from './Components/Dashboard'; // Move your Dashboard code here
import Login from './Components/Login';         // Create a Login.js component

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check if user is logged in on page load
useEffect(() => {
  fetch("http://localhost/student-MVC/backend/api/login.php", {
    credentials: "include" // Required for sessions to work across ports
  })
    .then((res) => {
      if (!res.ok) throw new Error("File not found (404)");
      return res.json();
    })
    .then((data) => {
      if (data.loggedIn) setIsLoggedIn(true);
    })
    .catch((err) => console.error("Check your PHP path or XAMPP:", err));
}, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Apply theme to the whole body
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark' : '';
  }, [isDarkMode]);

  return (
    <div className="app-container">
      {!isLoggedIn ? (
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <Dashboard toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      )}
    </div>
  );
}

export default App;