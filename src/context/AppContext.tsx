
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { fetchAppConfiguration, getAssetUrl } from '../lib/directus';
import { AppConfiguration } from '../types';

interface AppContextType {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  appConfig: AppConfiguration | null;
  appLogo: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [appConfig, setAppConfig] = useState<AppConfiguration | null>(null);
  const [appLogo, setAppLogo] = useState<string | null>(null);

  useEffect(() => {
    // Fetch global app settings on initial load
    const loadConfig = async () => {
      try {
        const config = await fetchAppConfiguration();
        setAppConfig(config);
        if (config.app_logo) {
          setAppLogo(getAssetUrl(config.app_logo));
        }
      } catch (error) {
        console.error("Failed to fetch app configuration:", error);
      } finally {
        // FIX: Ensure the loader is turned off after the initial config fetch.
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const value = {
    isLoading,
    setIsLoading,
    appConfig,
    appLogo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
