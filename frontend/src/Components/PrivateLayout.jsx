import React from "react";
import { Navigate } from "react-router-dom";
import AppShell from "./AppShell";

const PrivateLayout = ({ isLoggedIn, toggleTheme, isDarkMode }) => {
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppShell toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
  );
};

export default PrivateLayout;
