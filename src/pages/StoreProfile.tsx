// FIX: Add missing import for React, useState, and useEffect to resolve reference errors.
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStoreBySlug } from '../lib/directus';
import { Store, Product } from '../types';
import { 
  Info, 
  ShoppingBag, 
  Grid, 
  Check, 
  Heart, 
  Loader2,
  AlertCircle,
  Contact,
  Globe,
  AtSign,
  Send,
  Phone,
  MessageCircle,
  MapPin
} from 'lucide-react';

const StoreProfile: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { store: fetchedStore, products: fetchedProducts } = await fetchStoreBySlug(slug);
        if (fetchedStore) {
          setStore(fetchedStore);
          setProducts(fetchedProducts);
        } else {
          setError("فروشگاه مورد نظر یافت نشد.");
        }
      } catch (err) {
        console.error("Failed to load store data:", err);
        setError("خطا در دریافت اطلاعات فروشگاه.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
        <Loader2 className="animate-spin text-secondary" size={48} />
        <p>در حال بارگذاری پروفایل فروشگاه...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
        <AlertCircle size={48} className="text-red-500" />
        <h2>{error || "فروشگاه یافت نشد"}</h2>
      </div>
    );
  }
  
  const contactInfo = [
    { key: 'website', label: 'وب‌سایت', value: store.website?.replace(/^https?:\/\//, ''), icon: <Globe size={18} />, href: store.website },
    { key: 'instagram', label: 'اینستاگرام', value: store.instagram, icon: <AtSign size={18} />, href: `https://instagram.com/${store.instagram}` },
    { key: 'channel', label: 'کانال تلگرام', value: store.channel, icon: <Send size={18} />, href: `https://t.me/${store.channel}` },
    { key: 'telegram', label: 'پشتیبانی تلگرام', value: store.telegram, icon: <Send size={18} />, href: `https://t.me/${store.telegram}` },
    { key: 'whatsapp', label: 'واتس‌اپ', value: store.whatsapp, icon: <MessageCircle size={18} />, href: `https://wa.me/${store.whatsapp?.replace('+', '')}` },
    { key: 'phone', label: 'تلفن ثابت', value: store.phone, icon: <Phone size={18} /> },
    { key: 'mobile', label: 'موبایل', value: store.mobile, icon: <Phone size={18} /> },
    { key: 'address', label: 'آدرس', value: store.address, icon: <MapPin size={18} /> },
  ].filter(item => item.value);

  // Note: storePosts are not fetched yet, so we show an empty state.
  const storePosts: any[] = [];

  return (
    <div className="store-page">
      {/* Hero Section */}
      <div className="store-header">
        <div className="cover-container">
          <img src={store.coverImage} alt="Cover" className="cover-image" />
          <div className="cover-overlay"></div>
        </div>

        <div className="profile-bar-container">
          <div className="profile-bar">
            <div className="avatar-container">
              <img src={store.avatar} alt={store.name} className="avatar-img" />
              <div className="verified-badge">
                <Check size={12} />
              </div>
            </div>
            
            <div className="profile-details">
              <h1 className="profile-name">{store.name}</h1>
              <p className="profile-handle">{store.handle}</p>
            </div>

            <div className="action-buttons">
              <button className="btn-follow-lg">
                دنبال کردن
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="content-grid">
        
        {/* Right Sidebar (Info) */}
        <aside className="info-sidebar">
          <div className="info-card">
            <h3 className="info-title">
              <Info size={20} className="text-secondary" />
              {store.title || 'درباره ما'}
            </h3>
            <p className="info-text">{store.description}</p>
            
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-value">{products.length}</span>
                <span className="stat-label">محصول</span>
              </div>
              <div className="stat-item border-x border-gray-100 dark:border-zinc-800">
                <span className="stat-value">{store.followers.toLocaleString('fa-IR')}</span>
                <span className="stat-label">دنبال‌کننده</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">۴.۹</span>
                <span className="stat-label">امتیاز</span>
              </div>
            </div>
          </div>

          {contactInfo.length > 0 && (
            <div className="info-card">
              <h3 className="info-title">
                <Contact size={20} className="text-secondary" />
                اطلاعات تماس و شبکه‌ها
              </h3>
              <ul className="contact-list">
                {contactInfo.map(item => (
                   <li key={item.key} className="contact-item">
                     <div className="contact-details">
                       <span className="contact-label">{item.label}</span>
                       {item.href ? (
                         <a href={item.href} target="_blank" rel="noopener noreferrer" className="contact-value link">
                           {item.value}
                         </a>
                       ) : (
                         <span className="contact-value">{item.value}</span>
                       )}
                     </div>
                     <div className="contact-icon">{item.icon}</div>
                   </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Left Content (Products/Posts) */}
        <main className="main-content">
          
          {/* Products Section */}
          <section>
            <div className="section-header">
              <h2 className="section-title">
                <ShoppingBag size={22} className="text-gray-400" />
                ویترین فروشگاه
              </h2>
              {products.length > 4 && (
                 <Link to="/marketplace" className="text-sm text-secondary hover:underline">مشاهده همه</Link>
              )}
            </div>
            
            {products.length > 0 ? (
              <div className="store-products-grid">
                {products.slice(0, 6).map(product => ( // Show first 6 products
                  <Link to={`/product/${product.id}`} key={product.id} className="mini-product">
                    <img src={product.image} alt={product.name} />
                    <div className="mini-product-info">
                      <h3 className="mini-product-name">{product.name}</h3>
                      <span className="mini-product-price">{product.price.toLocaleString('fa-IR')} تومان</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">این فروشگاه هنوز محصولی اضافه نکرده است.</div>
            )}
          </section>

          {/* Posts Section */}
          <section>
            <div className="section-header">
              <h2 className="section-title">
                <Grid size={22} className="text-gray-400" />
                پست‌های اخیر
              </h2>
            </div>
            
            {storePosts.length > 0 ? (
              <div className="store-posts-grid">
                {storePosts.map(post => (
                  <div key={post.id} className="mini-post">
                    <img src={post.image} alt="post" />
                    <div className="mini-post-overlay">
                      <Heart size={18} fill="currentColor" />
                      <span>{post.likes}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">این فروشگاه هنوز پستی منتشر نکرده است.</div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
};

export default StoreProfile;