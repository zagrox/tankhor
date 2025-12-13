
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/* Core Styles */
import './styles/reset.css';
import './styles/variables.css';
import './styles/global.css';

/* Component Styles (Imported explicitly for robustness) */
import './styles/components/Layout.css';
import './styles/components/Sidebar.css';
import './styles/components/Loader.css';
import './styles/components/SecondarySidebar.css';
import './styles/components/MultiSelectDropdown.css'; 
import './styles/components/StoryViewer.css'; 

/* Page Styles */
import './styles/pages/Home.css';
import './styles/pages/SocialFeed.css';
import './styles/pages/Marketplace.css';
import './styles/pages/ProductDetail.css';
import './styles/pages/StoreProfile.css';
import './styles/pages/Blog.css';
import './styles/pages/Cart.css';
import './styles/pages/FiltersPage.css';
import './styles/pages/CategoryPage.css';
import './styles/pages/StoresPage.css'; 
import './styles/pages/Auth.css'; // Added Auth Styles
import './styles/pages/Settings.css'; // Added Settings Styles
import './styles/pages/Orders.css'; // Added Orders Styles

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
