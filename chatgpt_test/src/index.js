import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// React 18 방식으로 렌더링
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);