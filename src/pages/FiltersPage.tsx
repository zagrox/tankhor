import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  fetchSeasons, 
  fetchStyles, 
  fetchMaterials, 
  fetchGenders,
  fetchVendors
} from '../services/categoryService';
import { Season, Style, Material, Gender, Vendor } from '../types';
import { 
  Users, 
  Sun, 
  Scissors, 
  Layers, 
  ArrowLeft,
  Store
} from 'lucide-react';

const FiltersPage: React.FC = () => {
  const { setIsLoading, isLoading } = useAppContext();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [
          seasonsData, 
          stylesData, 
          materialsData, 
          gendersData,
          vendorsData
        ] = await Promise.all([
          fetchSeasons(),
          fetchStyles(),
          fetchMaterials(),
          fetchGenders(),
          fetchVendors()
        ]);

        setSeasons(seasonsData);
        setStyles(stylesData);
        setMaterials(materialsData);
        setGenders(gendersData);
        setVendors(vendorsData);
      } catch (error) {
        console.error("Failed to load filter data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setIsLoading]);

  if (isLoading) {
    return null; // Global loader is active
  }

  const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

  const getGenderIcon = (name: string) => {
    return <Users size={32} className="text-current opacity-80" />;
  };

  return (
    <div className="filters-page">
      <header className="filters-header">
        <h1 className="page-title">دسته‌بندی و جستجو</h1>
        <p className="page-subtitle">محصولات را بر اساس سلیقه و نیاز خود پیدا کنید</p>
      </header>

      {/* --- Styles Section --- */}
      <section className="filter-section">
        <div className="section-title-row">
          <Scissors size={24} className="text-secondary" />
          <h2>سبک و استایل</h2>
        </div>
        <div className="chips-grid">
          {styles.map((style) => (
            <Link 
              to={`/styles/${toSlug(style.style_name)}`} 
              key={style.id} 
              className="filter-chip"
            >
              {style.style_title}
              <span className="chip-sub">{style.style_name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* --- Materials Section --- */}
      <section className="filter-section">
        <div className="section-title-row">
          <Layers size={24} className="text-secondary" />
          <h2>جنس پارچه</h2>
        </div>
        <div className="chips-grid">
          {materials.map((mat) => (
            <Link 
              to={`/materials/${toSlug(mat.material_name)}`}
              key={mat.id} 
              className="filter-chip"
            >
              {mat.material_title}
              <span className="chip-sub">{mat.material_name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* --- Seasons Section --- */}
      <section className="filter-section">
        <div className="section-title-row">
          <Sun size={24} className="text-secondary" />
          <h2>فصل‌ها</h2>
        </div>
        <div className="season-grid">
          {seasons.map((season) => (
            <Link 
              to={`/seasons/${toSlug(season.season_name)}`}
              key={season.id} 
              className="season-card"
              style={{
                '--season-color': season.season_color || '#ccc'
              } as React.CSSProperties}
            >
              <div className="season-content">
                <span className="season-en">{season.season_name}</span>
                <span className="season-fa">{season.season_title}</span>
              </div>
              <div className="season-arrow">
                <ArrowLeft size={20} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- Genders Section --- */}
      <section className="filter-section">
        <div className="section-title-row">
          <Users size={24} className="text-secondary" />
          <h2>جنسیت و رده سنی</h2>
        </div>
        <div className="gender-grid">
          {genders.map((gender) => (
            <Link 
              to={`/genders/${toSlug(gender.gender_name)}`}
              key={gender.id} 
              className="gender-card"
            >
              <div className="gender-icon-wrapper">
                {getGenderIcon(gender.gender_name)}
              </div>
              <span className="gender-title">{gender.gender_title}</span>
            </Link>
          ))}
        </div>
      </section>
      
      {/* --- Vendors Section --- */}
      <section className="filter-section">
        <div className="section-title-row">
          <Store size={24} className="text-secondary" />
          <h2>نوع فروشگاه</h2>
        </div>
        <div className="vendor-grid">
          {vendors.map((vendor) => (
            <Link 
              to={`/vendors/${toSlug(vendor.vendor_title)}`}
              key={vendor.id} 
              className="vendor-card"
              style={{ '--vendor-color': vendor.vendor_color || '#ccc' } as React.CSSProperties}
            >
              <div className="vendor-card-header">
                <h3 className="vendor-name">{vendor.vendor_name}</h3>
                <span className="vendor-title">{vendor.vendor_title}</span>
              </div>
              <p className="vendor-details">{vendor.vendor_details}</p>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};

export default FiltersPage;