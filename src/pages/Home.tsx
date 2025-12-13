
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, ShieldCheck, Truck, CreditCard, Zap, 
  ArrowLeft, Play, Heart, Sparkles, Shirt, LayoutGrid
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { fetchStores } from '../services/storeService';
import { fetchProducts } from '../services/productService';
import { fetchReels } from '../services/socialService';
import { Store, Product, Reel } from '../types';
import StoryViewer from '../components/StoryViewer';

// --- Sub-Component: Story Bubble (Handles specific loader) ---
const StoryBubble: React.FC<{ store: Store; onClick: () => void }> = ({ store, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      className="story-item cursor-pointer"
      onClick={onClick}
    >
      <div className="story-ring">
        {/* Specific Loader for Story Avatar */}
        {!isLoaded && (
          <div className="story-avatar-loader">
            <Sparkles size={24} className="story-loader-icon" strokeWidth={1.5} />
          </div>
        )}
        <img 
          src={store.avatar} 
          alt={store.name} 
          className={`story-avatar-img ${isLoaded ? 'fade-in' : 'hidden'}`} 
          loading="lazy" 
          onLoad={() => setIsLoaded(true)}
        />
      </div>
      <span className="story-name">{store.name}</span>
    </div>
  );
};

// --- Sub-Component: Home Reel Card (Handles Loading State & Hover Play) ---
const HomeReelCard: React.FC<{ item: Reel; onClick: () => void }> = ({ item, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = item.mimeType?.startsWith('video/');

  const handleMouseEnter = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; 
      setIsPlaying(false);
    }
  };

  return (
    <div 
      className="reel-card-vertical cursor-pointer" 
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="reel-media-box">
        {/* Loader Overlay */}
        {!isLoaded && (
          <div className="skeleton-loader">
            <Shirt size={24} className="fashion-loader-icon text-gray-500" strokeWidth={1} />
          </div>
        )}

        {isVideo ? (
            <video 
              ref={videoRef}
              src={item.media} 
              muted 
              loop 
              playsInline
              className={`obj-cover ${isLoaded ? 'fade-in' : 'opacity-0'}`} 
              onLoadedData={() => setIsLoaded(true)}
              onCanPlay={() => setIsLoaded(true)}
            />
        ) : (
            <img 
              src={item.media} 
              alt="Reel" 
              loading="lazy" 
              className={`obj-cover ${isLoaded ? 'fade-in' : 'opacity-0'}`}
              onLoad={() => setIsLoaded(true)}
            />
        )}
        
        {/* Play Icon Overlay (Big Center Icon) */}
        {isVideo && (
          <div className={`reel-play-overlay ${isPlaying ? 'playing' : ''}`}>
             <div className="big-play-icon">
               <Play fill="white" size={28} className="ml-1" />
             </div>
          </div>
        )}
        
        {/* Small Icon (Corner) - Only show for images or if not playing to indicate type */}
        {!isVideo && (
          <div className="reel-overlay-icon">
             <Sparkles fill="white" size={20} />
          </div>
        )}

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
  );
};

// --- Sub-Component: Home Product Card (Handles Loading State) ---
const HomeProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Link to={`/product/${product.id}`} className="home-product-card">
      <div className="home-product-img-box">
        {/* Loader Overlay */}
        {!isLoaded && (
          <div className="skeleton-loader">
             <Shirt size={24} className="fashion-loader-icon text-gray-400" strokeWidth={1} />
          </div>
        )}
        
        <img 
          src={product.image} 
          alt={product.name} 
          loading="lazy" 
          className={isLoaded ? 'fade-in' : 'opacity-0'}
          onLoad={() => setIsLoaded(true)}
        />
        
        {product.discountPercentage ? (
            <span className="home-discount-badge">{product.discountPercentage}٪</span>
        ) : null}
      </div>
      <div className="home-product-details">
        <h3 className="home-product-title">{product.name}</h3>
        <div className="home-product-meta">
          {/* Store Name Removed for cleaner look */}
          <span className="home-product-price">
            {product.finalPrice.toLocaleString('fa-IR')} <span className="text-xs">تومان</span>
          </span>
        </div>
      </div>
    </Link>
  );
};


const Home: React.FC = () => {
  const { setIsLoading } = useAppContext();
  const navigate = useNavigate();

  // Data State
  const [featuredStores, setFeaturedStores] = useState<Store[]>([]);
  const [storyStores, setStoryStores] = useState<Store[]>([]); // Separated state for Stories
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [trendingReels, setTrendingReels] = useState<Reel[]>([]);

  // Story Viewer State
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerStores, setViewerStores] = useState<Store[]>([]);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadHomeData = async () => {
      setIsLoading(true);
      try {
        // Fetch data in parallel
        const [storesData, productsData, reelsData] = await Promise.all([
          fetchStores(),
          fetchProducts({ limit: 12 }), // Fetch 12 latest products to fill compact grid
          fetchReels(1, 10) // Fetch latest reels
        ]);

        setFeaturedStores(storesData);
        setLatestProducts(productsData);
        setTrendingReels(reelsData);

        // --- SORT STORIES BY RECENCY ---
        // 1. Get IDs of stores in the latest reels (ordered by recency)
        const recentStoreIds = Array.from(new Set(reelsData.map(r => r.store.id)));

        // 2. Filter stores that actually have reels
        const storesWithStories = storesData.filter(s => s.reelIds && s.reelIds.length > 0);

        // 3. Sort: Recent stores first, then others
        const sortedStories = [...storesWithStories].sort((a, b) => {
          const idxA = recentStoreIds.indexOf(a.id);
          const idxB = recentStoreIds.indexOf(b.id);
          
          // If both are recent, lower index (more recent) wins
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          // If only A is recent, it wins
          if (idxA !== -1) return -1;
          // If only B is recent, it wins
          if (idxB !== -1) return 1;
          
          return 0;
        });

        setStoryStores(sortedStories);

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

  // --- Story & Reel Click Handlers ---

  const handleStoryClick = (index: number) => {
    // Since storyStores is already sorted and filtered, we can use it directly
    setViewerStores(storyStores);
    setViewerStartIndex(index);
    setIsViewerOpen(true);
  };

  const handleReelClick = (index: number) => {
    const reelStores: Store[] = trendingReels.map(reel => ({
      id: reel.store.id,
      name: reel.store.name,
      slug: reel.store.slug,
      handle: reel.store.handle,
      avatar: reel.store.avatar,
      coverImage: reel.store.coverImage,
      followers: 0,
      isFollowing: false,
      description: '',
      productIds: [],
      reelIds: [reel.id],
      vendor: undefined
    }));

    setViewerStores(reelStores);
    setViewerStartIndex(index);
    setIsViewerOpen(true);
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
      
      {isViewerOpen && (
        <StoryViewer 
          stores={viewerStores}
          initialStoreIndex={viewerStartIndex}
          onClose={() => setIsViewerOpen(false)}
        />
      )}

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
            <Link to="/filters" className="smart-chip icon-only" title="همه دسته‌بندی‌ها">
              <LayoutGrid size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* --- 2. STORIES RIBBON (SORTED RECENT FIRST) --- */}
      <section className="stories-ribbon-section">
        <div className="section-container">
          <div className="stories-scroll-wrapper">
            {storyStores.map((store, index) => (
              <StoryBubble 
                key={store.id} 
                store={store} 
                onClick={() => handleStoryClick(index)} 
              />
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
            {trendingReels.map((item, index) => (
              <HomeReelCard 
                key={item.id} 
                item={item} 
                onClick={() => handleReelClick(index)} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- 6. FEATURED BOUTIQUES (Default Sort) --- */}
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
              <HomeProductCard key={product.id} product={product} />
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
