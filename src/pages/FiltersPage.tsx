
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scissors, 
  Layers, 
  Sun, 
  Users, 
  Store,
  ArrowLeft
} from 'lucide-react';

const FiltersPage: React.FC = () => {
  // Static definition of main category types
  const mainCategories = [
    {
      id: 'seasons',
      title: 'فصل‌ها',
      subtitle: 'انتخاب لباس بر اساس آب و هوا',
      image: 'https://images.unsplash.com/photo-1544965850-6f8a69799052?q=80&w=2000&auto=format&fit=crop',
      icon: <Sun size={24} />,
      color: '#f59e0b',
      link: '/collections/season'
    },
    {
      id: 'styles',
      title: 'سبک و استایل',
      subtitle: 'کژوال، رسمی، وینتیج و بیشتر',
      image: 'https://images.unsplash.com/photo-1550614000-4b9519e02a48?q=80&w=2000&auto=format&fit=crop',
      icon: <Scissors size={24} />,
      color: '#ec4899',
      link: '/collections/style'
    },
    {
      id: 'materials',
      title: 'جنس و پارچه',
      subtitle: 'چرم، کتان، ابریشم و الیاف طبیعی',
      image: 'https://images.unsplash.com/photo-1520216135169-92c2df9df1c6?q=80&w=2000&auto=format&fit=crop',
      icon: <Layers size={24} />,
      color: '#3b82f6',
      link: '/collections/material'
    },
    {
      id: 'genders',
      title: 'جنسیت و رده سنی',
      subtitle: 'زنانه، مردانه و بچگانه',
      image: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?q=80&w=2000&auto=format&fit=crop',
      icon: <Users size={24} />,
      color: '#8b5cf6',
      link: '/collections/gender'
    },
    {
      id: 'vendors',
      title: 'نوع فروشگاه',
      subtitle: 'بوتیک، مزون، طراح مستقل',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop',
      icon: <Store size={24} />,
      color: '#10b981',
      link: '/collections/vendor'
    }
  ];

  return (
    <div className="filters-page-root">
      <header className="filters-root-header">
        <h1 className="root-title">دسته‌بندی‌ها</h1>
        <p className="root-subtitle">برای مشاهده محصولات، ابتدا دسته‌بندی مورد نظر خود را انتخاب کنید</p>
      </header>

      <div className="main-categories-grid">
        {mainCategories.map((cat) => (
          <Link 
            to={cat.link} 
            key={cat.id} 
            className="main-category-card"
          >
            <div className="main-cat-bg">
              <img src={cat.image} alt={cat.title} />
              <div className="main-cat-overlay"></div>
            </div>
            
            <div className="main-cat-content">
              <div className="main-cat-icon" style={{ backgroundColor: cat.color }}>
                {cat.icon}
              </div>
              <div className="main-cat-text">
                <h2>{cat.title}</h2>
                <p>{cat.subtitle}</p>
              </div>
              <div className="main-cat-arrow">
                <ArrowLeft size={20} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FiltersPage;
