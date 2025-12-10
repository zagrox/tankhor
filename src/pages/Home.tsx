
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, ShieldCheck, Truck, CreditCard, Zap, 
  ArrowLeft, Play, Heart, Sparkles 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { fetchStores } from '../services/storeService';
import { fetchProducts } from '../services/productService';
import { fetchReels } from '../services/socialService';
import { Store, Product, Reel } from '../types';

const Home: React.FC = () => {
  const { setIsLoading } = useAppContext();
  const navigate = useNavigate();

  // Data State
  const [featuredStores, setFeaturedStores] = useState<Store[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [trendingReels, setTrendingReels] = useState<Reel[]>([]);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadHomeData = async () => {
      setIsLoading(true);
      try {
        // Fetch data in parallel
        const [storesData, productsData, reelsData] = await Promise.all([
          fetchStores(),
          fetchProducts({ limit: 8 }), // Fetch 8 latest products
          fetchReels(1, 10) // Fetch latest reels
        ]);

        setFeaturedStores(storesData);
        setLatestProducts(productsData);
        setTrendingReels(reelsData);

      } catch (e) {
        console.error("Home data error", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadHomeData();
  }, [setIsLoading]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate('/marketplace');
    }
  };

  const smartChips = [
    { label: 'مانتو تابستانه', link: '/seasons/summer' },
    { label: 'لباس مجلسی', link: '/styles/formal' },
    { label: 'چرم طبیعی', link: '/materials/leather' },
    { label: 'کالکشن جدید', link: '/marketplace' },
  ];

  const categories = [
    { title: 'کالکشن فصل', subtitle: 'بهار و تابستان ۱۴۰۴', image: 'https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?auto=format&fit=crop&q=80&w=600', link: '/seasons/spring' },
    { title: 'استایل خیابانی', subtitle: 'ترندهای روز تهران', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=600', link: '/styles/street' },
    { title: 'اکسسوری', subtitle: 'کیف، کفش و عینک', image: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?auto=format&fit=crop&q=80&w=600', link: '/marketplace' },
  ];

  return (
    <div className="home-page">
      
      {/* --- 1. HERO SECTION --- */}
      <section className="hero-section">
        <div className="hero-bg-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            سبک خود را <span className="text-secondary">پیدا کنید</span>
          </h1>
          <p className="hero-subtitle">
            پلتفرم تخصصی مد و فشن؛ جایی برای دیده شدن و انتخاب بهترین‌ها
          </p>

          <form onSubmit={handleSearch} className="hero-search-wrapper">
            <input 
              type="text" 
              placeholder="جستجو در محصولات، برندها و..." 
              className="hero-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="hero-search-btn">
              <Search size={20} />
            </button>
          </form>

          <div className="hero-chips">
            {smartChips.map((chip, idx) => (
              <Link key={idx} to={chip.link} className="smart-chip">
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- 2. STORIES RIBBON --- */}
      <section className="stories-ribbon-section">
        <div className="section-container">
          <div className="stories-scroll-wrapper">
            {featuredStores.map((store) => (
              <Link to={`/stores/${store.slug}`} key={store.id} className="story-item">
                <div className="story-ring">
                  <img src={store.avatar} alt={store.name} className="story-avatar-img" loading="lazy" />
                </div>
                <span className="story-name">{store.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- 3. VISUAL CATEGORIES --- */}
      <section className="visual-categories-section">
        <div className="section-container">
          <div className="section-header">
            <h2>ویترین‌های جدید</h2>
            <Link to="/filters" className="see-more-link">
              مشاهده همه <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="categories-grid">
            {categories.map((cat, idx) => (
              <Link to={cat.link} key={idx} className="category-card-visual">
                <img src={cat.image} alt={cat.title} className="cat-bg-img" loading="lazy" />
                <div className="cat-overlay">
                  <h3>{cat.title}</h3>
                  <span>{cat.subtitle}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- 4. LATEST REELS (Social Feed) --- */}
      <section className="latest-reels-section">
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2>استایل‌های ترند</h2>
              <p className="text-sm text-gray-500 mt-1">ویدیوها و استایل‌های محبوب کاربران</p>
            </div>
            <Link to="/social" className="see-more-link">
              مشاهده فید <ArrowLeft size={16} />
            </Link>
          </div>
          
          <div className="reels-horizontal-scroll">
            {trendingReels.map((item) => (
              <div key={item.id} className="reel-card-vertical">
                <div className="reel-media-box">
                  {item.mimeType?.startsWith('video/') ? (
                      <video src={item.media} muted loop className="obj-cover" />
                  ) : (
                      <img src={item.media} alt="Reel" loading="lazy" />
                  )}
                  <div className="reel-overlay-icon">
                    {item.mimeType?.startsWith('video/') ? <Play fill="white" size={20} /> : <Sparkles fill="white" size={20} />}
                  </div>
                  <div className="reel-stats-overlay">
                    <Heart size={14} fill="white" />
                    <span>{item.likes}</span>
                  </div>
                </div>
                <Link to={`/stores/${item.store.slug}`} className="reel-info-mini">
                  <img src={item.store.avatar} alt={item.store.name} className="reel-avatar-mini" />
                  <span className="reel-store-name-mini">{item.store.name}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 5. LATEST PRODUCTS (Commerce) --- */}
      <section className="latest-products-section">
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2>جدیدترین محصولات</h2>
              <p className="text-sm text-gray-500 mt-1">تازه‌ترین کالکشن‌های اضافه شده به بازار</p>
            </div>
            <Link to="/marketplace" className="see-more-link">
              فروشگاه <ArrowLeft size={16} />
            </Link>
          </div>

          <div className="home-products-grid">
            {latestProducts.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="home-product-card">
                <div className="home-product-img-box">
                  <img src={product.image} alt={product.name} loading="lazy" />
                  {product.discountPercentage ? (
                     <span className="home-discount-badge">{product.discountPercentage}٪</span>
                  ) : null}
                </div>
                <div className="home-product-details">
                  <h3 className="home-product-title">{product.name}</h3>
                  <div className="home-product-meta">
                    <span className="home-store-name">{product.storeName}</span>
                    <span className="home-product-price">
                      {product.finalPrice.toLocaleString('fa-IR')} <span className="text-xs">تومان</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- 6. FEATURED BOUTIQUES --- */}
      <section className="featured-stores-section">
        <div className="section-container">
          <div className="section-header">
            <h2>بوتیک‌های برتر</h2>
            <Link to="/stores" className="see-more-link">
              لیست فروشگاه‌ها <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="stores-carousel">
            {featuredStores.slice(0, 5).map(store => (
              <Link to={`/stores/${store.slug}`} key={store.id} className="store-card-horizontal">
                <div 
                  className="store-cover-wrapper"
                  style={{ backgroundColor: store.coverColor || '#f1f5f9' }}
                >
                   {store.coverImage && (
                     <img src={store.coverImage} alt="Cover" className="store-cover-img" loading="lazy" />
                   )}
                   <div className="store-avatar-badge">
                     <img src={store.avatar} alt={store.name} />
                   </div>
                </div>
                <div className="store-info">
                  <h4>{store.name}</h4>
                  <p className="store-followers">{store.followers.toLocaleString('fa-IR')} دنبال‌کننده</p>
                  
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- 7. AI TEASER --- */}
      <section className="ai-teaser-section">
        <div className="section-container">
          <div className="ai-banner">
            <div className="ai-content">
              <Sparkles size={32} className="text-yellow-300 mb-2" />
              <h2>استایلیست هوشمند</h2>
              <p>هنوز نمی‌دونی چی بپوشی؟ بذار هوش مصنوعی بهت پیشنهاد بده.</p>
              <Link to="/filters" className="ai-btn">
                بزودی
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- 8. TRUST SIGNALS --- */}
      <section className="trust-section">
        <div className="section-container">
          <div className="trust-grid">
            <div className="trust-item">
              <ShieldCheck size={32} className="text-secondary" />
              <h3>ضمانت اصالت</h3>
              <p>تضمین بازگشت وجه در صورت عدم تطابق</p>
            </div>
            <div className="trust-item">
              <Truck size={32} className="text-secondary" />
              <h3>ارسال سریع</h3>
              <p>تحویل اکسپرس در تهران و مراکز استان</p>
            </div>
            <div className="trust-item">
              <CreditCard size={32} className="text-secondary" />
              <h3>پرداخت امن</h3>
              <p>درگاه پرداخت مطمئن با نماد اعتماد</p>
            </div>
            <div className="trust-item">
              <Zap size={32} className="text-secondary" />
              <h3>پشتیبانی ۲۴/۷</h3>
              <p>پاسخگویی در تمام روزهای هفته</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
