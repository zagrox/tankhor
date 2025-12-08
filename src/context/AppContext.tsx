

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { fetchAppConfiguration } from '../services/configService';
import { getAssetUrl } from '../services/client';
import { fetchCategories } from '../services/categoryService';
import { AppConfiguration, Category } from '../types';

// Marketplace-specific types
export type PriceSort = 'asc' | 'desc' | 'default';

interface AppContextType {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  appConfig: AppConfiguration | null;
  appLogo: string | null;

  // Marketplace Filter State
  selectedCategories: string[]; // Changed to array for multi-select
  setSelectedCategories: (categories: string[]) => void;
  
  selectedSeasons: string[]; // Season Filter
  setSelectedSeasons: (seasons: string[]) => void;

  selectedStyles: string[]; // Style Filter
  setSelectedStyles: (styles: string[]) => void;

  selectedMaterials: string[]; // Material Filter
  setSelectedMaterials: (materials: string[]) => void;

  selectedGenders: string[]; // Gender Filter
  setSelectedGenders: (genders: string[]) => void;

  selectedColorFamilies: string[]; // Color Family Filter
  setSelectedColorFamilies: (colors: string[]) => void;

  priceSort: PriceSort;
  setPriceSort: (sort: PriceSort) => void;
  groupedCategories: Map<string, Category[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [appConfig, setAppConfig] = useState<AppConfiguration | null>(null);
  const [appLogo, setAppLogo] = useState<string | null>(null);

  // Marketplace Filter State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedColorFamilies, setSelectedColorFamilies] = useState<string[]>([]);
  const [priceSort, setPriceSort] = useState<PriceSort>('default');
  const [groupedCategories, setGroupedCategories] = useState<Map<string, Category[]>>(new Map());


  useEffect(() => {
    // Fetch global app settings and categories on initial load
    const loadInitialData = async () => {
      try {
        const [config, categories] = await Promise.all([
          fetchAppConfiguration(),
          fetchCategories()
        ]);

        // Process config
        setAppConfig(config);
        if (config.app_logo) {
          setAppLogo(getAssetUrl(config.app_logo));
        }

        // Process and group categories
        const grouped = categories.reduce((acc, cat) => {
          // Explicitly fallback to 'سایر' if category_parent is null or empty
          const parent = cat.category_parent ? cat.category_parent : 'سایر';
          if (!acc.has(parent)) {
            acc.set(parent, []);
          }
          acc.get(parent)!.push(cat);
          return acc;
        }, new Map<string, Category[]>());
        setGroupedCategories(grouped);

      } catch (error) {
        console.error("Failed to fetch initial app data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const value = {
    isLoading,
    setIsLoading,
    appConfig,
    appLogo,
    selectedCategories,
    setSelectedCategories,
    selectedSeasons,
    setSelectedSeasons,
    selectedStyles,
    setSelectedStyles,
    selectedMaterials,
    setSelectedMaterials,
    selectedGenders,
    setSelectedGenders,
    selectedColorFamilies,
    setSelectedColorFamilies,
    priceSort,
    setPriceSort,
    groupedCategories,
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