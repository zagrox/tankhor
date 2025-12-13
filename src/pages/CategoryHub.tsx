
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  fetchSeasons, 
  fetchStyles, 
  fetchMaterials, 
  fetchGenders,
  fetchVendors
} from '../services/categoryService';
import { getAssetUrl } from '../services/client';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface HubItem {
  id: string | number;
  title: string;
  subtitle?: string;
  image?: string;
  link: string;
  color?: string;
}

const CategoryHub: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const { setIsLoading } = useAppContext();
  const [items, setItems] = useState<HubItem[]>([]);
  const [heroData, setHeroData] = useState({
    title: '',
    description: '',
    image: '',
    color: ''
  });
  const [loading, setLoading] = useState(true);

  // Helper to slugify
  const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setIsLoading(true);
      let fetchedItems: HubItem[] = [];

      try {
        switch (type) {
          case 'season':
            setHeroData({
              title: 'فصل‌ها',
              description: 'مجموعه‌ای از لباس‌های مناسب برای هر شرایط آب و هوایی. استایل خود را با فصل هماهنگ کنید.',
              image: 'https://images.unsplash.com/photo-1477414956199-7dafc86a4f19?q=80&w=2070&auto=format&fit=crop',
              color: '#f59e0b'
            });
            const seasons = await fetchSeasons();
            fetchedItems = seasons.map(s => ({
              id: s.id,
              title: s.season_title,
              subtitle: s.season_name,
              color: s.season_color,
              link: `/seasons/${toSlug(s.season_name)}`
            }));
            break;

          case 'style':
            setHeroData({
              title: 'سبک و استایل',
              description: 'از کژوال تا رسمی، وینتیج تا مدرن. سبک منحصر به فرد خود را در اینجا پیدا کنید.',
              image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
              color: '#ec4899'
            });
            const styles = await fetchStyles();
            fetchedItems = styles.map(s => ({
              id: s.id,
              title: s.style_title,
              subtitle: s.style_name,
              image: s.style_image ? getAssetUrl(s.style_image) : undefined,
              link: `/styles/${toSlug(s.style_name)}`
            }));
            break;

          case 'material':
            setHeroData({
              title: 'جنس و پارچه',
              description: 'انتخاب هوشمندانه بر اساس کیفیت و بافت. بهترین متریال‌ها برای راحتی شما.',
              image: 'https://images.unsplash.com/photo-1520692857416-6ec42b650742?q=80&w=2069&auto=format&fit=crop',
              color: '#3b82f6'
            });
            const materials = await fetchMaterials();
            fetchedItems = materials.map(m => ({
              id: m.id,
              title: m.material_title,
              subtitle: m.material_name,
              link: `/materials/${toSlug(m.material_name)}`
            }));
            break;

          case 'gender':
             setHeroData({
              title: 'جنسیت و رده سنی',
              description: 'دسته‌بندی بر اساس مخاطب. محصولاتی مناسب برای همه اعضای خانواده.',
              image: 'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?q=80&w=1974&auto=format&fit=crop',
              color: '#8b5cf6'
            });
            const genders = await fetchGenders();
            fetchedItems = genders.map(g => ({
              id: g.id,
              title: g.gender_title,
              subtitle: g.gender_name,
              color: g.gender_color || undefined,
              link: `/genders/${toSlug(g.gender_name)}`
            }));
            break;

           case 'vendor':
             setHeroData({
              title: 'نوع فروشگاه',
              description: 'خرید از بوتیک‌های لوکس، مزون‌های شخصی دوز یا طراحان مستقل.',
              image: 'https://images.unsplash.com/photo-1556740758-90de2742dd61?q=80&w=2070&auto=format&fit=crop',
              color: '#10b981'
            });
            const vendors = await fetchVendors();
            fetchedItems = vendors.map(v => ({
              id: v.id,
              title: v.vendor_title,
              subtitle: v.vendor_name,
              color: v.vendor_color || undefined,
              link: `/vendors/${toSlug(v.vendor_title)}`
            }));
            break;

          default:
            setHeroData({ title: 'دسته‌بندی', description: '', image: '', color: '#333' });
            break;
        }

        setItems(fetchedItems);
      } catch (error) {
        console.error("Error fetching hub data", error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    loadData();
  }, [type, setIsLoading]);

  if (loading) return null;

  return (
    <div className="category-hub-page">
      
      {/* Back Nav */}
      <div className="hub-nav">
        <Link to="/filters" className="hub-back-btn">
          <ArrowRight size={20} />
          بازگشت به دسته‌بندی‌ها
        </Link>
      </div>

      {/* Hero Section */}
      <header className="hub-hero">
        <div className="hub-hero-bg">
          {heroData.image && <img src={heroData.image} alt={heroData.title} />}
          <div className="hub-hero-overlay"></div>
        </div>
        <div className="hub-hero-content">
          <h1 className="hub-title" style={{ '--accent-color': heroData.color } as React.CSSProperties}>
            {heroData.title}
          </h1>
          <p className="hub-desc">{heroData.description}</p>
        </div>
      </header>

      {/* Sub-Category Grid */}
      <section className="hub-grid-container">
        <div className="hub-grid">
          {items.map((item) => (
            <Link 
              to={item.link} 
              key={item.id} 
              className="hub-card"
              style={{ '--card-accent': item.color || heroData.color } as React.CSSProperties}
            >
              {/* If item has a specific image (like style), show it */}
              {item.image && (
                 <div className="hub-card-bg">
                   <img src={item.image} alt={item.title} />
                   <div className="hub-card-bg-overlay"></div>
                 </div>
              )}
              
              <div className="hub-card-content">
                <div className="hub-card-text">
                  <h3>{item.title}</h3>
                  {item.subtitle && <span className="subtitle">{item.subtitle}</span>}
                </div>
                <div className="hub-card-arrow">
                  <ArrowLeft size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};

export default CategoryHub;
