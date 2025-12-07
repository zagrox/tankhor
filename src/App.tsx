

import React from 'react';
// FIX: Switched from react-router-dom v5 to v6/v7 syntax to resolve module export errors.
// This involves replacing `Switch` with `Routes`, `Redirect` with `Navigate`,
// and using the `element` prop on `<Route>` instead of `component` or `render`.
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Loader from './components/Loader';
import SocialFeed from './pages/SocialFeed';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import Blog from './pages/Blog';
import StoreProfile from './pages/StoreProfile';
import Cart from './pages/Cart';
import FiltersPage from './pages/FiltersPage';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';

// Simple placeholder components for unused routes
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-[50vh]">
    <h1 className="text-2xl text-gray-400">{title} - به زودی</h1>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <AppProvider>
        <Loader />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/social" element={<SocialFeed />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/filters" element={<FiltersPage />} />
            
            {/* SEO-friendly Category Routes */}
            <Route path="/seasons/:slug" element={<CategoryPage type="season" />} />
            <Route path="/styles/:slug" element={<CategoryPage type="style" />} />
            <Route path="/materials/:slug" element={<CategoryPage type="material" />} />
            <Route path="/genders/:slug" element={<CategoryPage type="gender" />} />
            <Route path="/vendors/:slug" element={<CategoryPage type="vendor" />} />

            <Route path="/product/:id" element={<ProductDetail />} />
            {/* Changed store route to use slug for SEO */}
            <Route path="/stores/:slug" element={<StoreProfile />} />
            <Route path="/blog" element={<Blog />} />
            
            <Route path="/cart" element={<Cart />} />
            
            <Route path="/contact" element={<Placeholder title="تماس با ما" />} />
            <Route path="/about" element={<Placeholder title="درباره ما" />} />
            <Route path="/privacy" element={<Placeholder title="حریم خصوصی" />} />
            <Route path="/terms" element={<Placeholder title="قوانین" />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </AppProvider>
    </Router>
  );
};

export default App;