import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';

// Redirect to the correct styles in src
import './src/styles/main.css';

// Import all modular styles to ensure they are bundled if root index is used
import './src/styles/components/Layout.css';
import './src/styles/pages/SocialFeed.css';
import './src/styles/pages/Marketplace.css';
import './src/styles/pages/ProductDetail.css';
import './src/styles/pages/StoreProfile.css';
import './src/styles/pages/AIStylist.css';
import './src/styles/pages/Blog.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);