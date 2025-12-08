
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Filter } from 'lucide-react';
import MultiSelectDropdown from './MultiSelectDropdown';
import { fetchSeasons, fetchStyles, fetchMaterials, fetchGenders, fetchColors, fetchVendors } from '../services/categoryService';
import { Season, Style, Material, Gender, Color, Vendor } from '../types';
import { PRICE_RANGES } from '../constants';

const SecondarySidebar: React.FC = () => {
  const { 
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
    selectedVendors,
    setSelectedVendors,
    selectedColorFamilies,
    setSelectedColorFamilies,
    selectedPriceRanges,
    setSelectedPriceRanges,
    priceSort, 
    setPriceSort,
    groupedCategories,
  } = useAppContext();

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    // Fetch available seasons, styles, materials, genders, colors and vendors for filtering
    const loadFilters = async () => {
      const [seasonsData, stylesData, materialsData, gendersData, colorsData, vendorsData] = await Promise.all([
        fetchSeasons(),
        fetchStyles(),
        fetchMaterials(),
        fetchGenders(),
        fetchColors(),
        fetchVendors()
      ]);
      setSeasons(seasonsData);
      setStyles(stylesData);
      setMaterials(materialsData);
      setGenders(gendersData);
      setColors(colorsData);
      setVendors(vendorsData);
    };
    loadFilters();
  }, []);

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

  const seasonGroups = [{
    label: 'فصل',
    options: seasons.map(s => ({
      value: String(s.id),
      label: s.season_title
    }))
  }];

  const styleGroups = [{
    label: 'سبک',
    options: styles.map(s => ({
      value: String(s.id),
      label: s.style_title
    }))
  }];

  const materialGroups = [{
    label: 'جنس',
    options: materials.map(m => ({
      value: String(m.id),
      label: m.material_title
    }))
  }];

  const genderGroups = [{
    label: 'جنسیت',
    options: genders.map(g => ({
      value: String(g.id),
      label: g.gender_title
    }))
  }];

  const vendorGroups = [{
    label: 'نوع فروشگاه',
    options: vendors.map(v => ({
      value: String(v.id),
      label: v.vendor_title
    }))
  }];

  // Extract unique color families
  const uniqueColorFamilies = Array.from(new Set(
    colors.map(c => c.color_family).filter(Boolean)
  )).sort();

  const colorGroups = [{
    label: 'خانواده رنگ',
    options: uniqueColorFamilies.map(f => ({
      value: f!,
      label: f!
    }))
  }];

  const priceGroups = [{
    label: 'محدوده قیمت',
    options: PRICE_RANGES.map(range => ({
      value: range.id,
      label: range.label
    }))
  }];

  return (
    <aside className="secondary-sidebar">
      <div className="secondary-sidebar-content">
        <div className="filter-header">
          <Filter size={20} className="text-secondary" />
          <h2> فروشگاه تن‌خور</h2>
        </div>
        
        <div className="filter-group">
          <MultiSelectDropdown 
            label="انتخاب دسته‌بندی"
            groups={categoryGroups}
            selectedValues={selectedCategories}
            onChange={setSelectedCategories}
          />
        </div>

        <div className="filter-group">
           <MultiSelectDropdown 
            label="محدوده قیمت"
            groups={priceGroups}
            selectedValues={selectedPriceRanges}
            onChange={setSelectedPriceRanges}
          />
        </div>

        <div className="filter-group">
           <MultiSelectDropdown 
            label="انتخاب جنسیت"
            groups={genderGroups}
            selectedValues={selectedGenders}
            onChange={setSelectedGenders}
          />
        </div>

        <div className="filter-group">
           <MultiSelectDropdown 
            label="انتخاب فروشگاه"
            groups={vendorGroups}
            selectedValues={selectedVendors}
            onChange={setSelectedVendors}
          />
        </div>

        <div className="filter-group">
           <MultiSelectDropdown 
            label="انتخاب فصل"
            groups={seasonGroups}
            selectedValues={selectedSeasons}
            onChange={setSelectedSeasons}
          />
        </div>

        <div className="filter-group">
           <MultiSelectDropdown 
            label="انتخاب سبک"
            groups={styleGroups}
            selectedValues={selectedStyles}
            onChange={setSelectedStyles}
          />
        </div>

        <div className="filter-group">
           <MultiSelectDropdown 
            label="انتخاب جنس"
            groups={materialGroups}
            selectedValues={selectedMaterials}
            onChange={setSelectedMaterials}
          />
        </div>

        <div className="filter-group">
           <MultiSelectDropdown 
            label="انتخاب رنگ"
            groups={colorGroups}
            selectedValues={selectedColorFamilies}
            onChange={setSelectedColorFamilies}
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
