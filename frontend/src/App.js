import React, { useState, useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/Login";
import Students from "./Pages/Students";
import Courses from "./Pages/Courses";
import Attendance from "./Pages/Attendence";
import Reports from "./Pages/Reports";
import PrivateLayout from "./Components/PrivateLayout";

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [loading, setLoading] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check session on app load
  useEffect(() => {

    fetch(
      "http://localhost/student-MVC/backend/api/session.php",
      {
        credentials: "include"
      }
    )
      .then((res) => res.json())

      .then((data) => {

        if (data.loggedIn) {
          setIsLoggedIn(true);
        }

        setLoading(false);
      })

      .catch((err) => {

        console.error("Session error:", err);

        setLoading(false);
      });

  }, []);

  // Theme toggle
  const toggleTheme = () => {

    setIsDarkMode(!isDarkMode);
  };

  // Apply theme
  useEffect(() => {

    document.body.className = isDarkMode
      ? "dark"
      : "";

  }, [isDarkMode]);

  // Loading screen
  if (loading) {

    return (
      <div className="app-loading">
        <p>Loading…</p>
      </div>
    );
  }

  return (

    <BrowserRouter>

      <Routes>

        {/* Login Route */}
        <Route
          path="/"
          element={
            !isLoggedIn ? (
              <Login
                onLoginSuccess={() =>
                  setIsLoggedIn(true)
                }
              />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        <Route
          element={
            <PrivateLayout
              isLoggedIn={isLoggedIn}
              toggleTheme={toggleTheme}
              isDarkMode={isDarkMode}
            />
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;