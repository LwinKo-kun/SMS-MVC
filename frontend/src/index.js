import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css'; // Make sure your CSS file is in the src folder
import App from './App'; // We will create this next

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);