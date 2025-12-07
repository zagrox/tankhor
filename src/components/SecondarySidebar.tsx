
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Filter } from 'lucide-react';
import MultiSelectDropdown from './MultiSelectDropdown';

const SecondarySidebar: React.FC = () => {
  const { 
    selectedCategories, 
    setSelectedCategories, 
    priceSort, 
    setPriceSort,
    groupedCategories,
  } = useAppContext();

  // Transform groupedCategories Map into the structure expected by MultiSelectDropdown
  // And apply Smart Sorting: Parent categories alphabetical, but 'سایر' (Other) always last.
  const categoryGroups = Array.from(groupedCategories.entries())
    .map(([parent, children]) => ({
      label: parent,
      options: children.map(cat => ({
        value: String(cat.id),
        label: cat.category_name
      }))
    }))
    .sort((a, b) => {
      if (a.label === 'سایر') return 1;
      if (b.label === 'سایر') return -1;
      return a.label.localeCompare(b.label, 'fa');
    });

  return (
    <aside className="secondary-sidebar">
      <div className="secondary-sidebar-content">
        <div className="filter-header">
          <Filter size={20} className="text-secondary" />
          <h2>فروشگاه</h2>
        </div>
        
        <div className="filter-group">
          <MultiSelectDropdown 
            label="انتخاب دسته‌بندی"
            groups={categoryGroups}
            selectedValues={selectedCategories}
            onChange={setSelectedCategories}
          />
        </div>

        <div className="filter-group sort-group">
          <select 
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value as any)}
            className="sort-select"
          >
            <option value="default">پیش‌فرض</option>
            <option value="asc">ارزان‌ترین</option>
            <option value="desc">گران‌ترین</option>
          </select>
        </div>
      </div>
    </aside>
  );
};

export default SecondarySidebar;
