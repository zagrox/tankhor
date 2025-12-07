
import React from 'react';
import { useAppContext } from '../context/AppContext';

const Loader: React.FC = () => {
  const { isLoading, appLogo } = useAppContext();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="loader-overlay">
      <div className="loader-content">
        {appLogo ? (
          <img src={appLogo} alt="Loading..." className="loader-logo" />
        ) : (
          <div className="loader-fallback"></div>
        )}
      </div>
    </div>
  );
};

export default Loader;
