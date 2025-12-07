

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { fetchProductById } from '../lib/directus';
import { Product } from '../types';
import { 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Truck, 
  Play, 
  Heart, 
  Share2, 
  AlertCircle,
  CheckCircle2,
  Minus,
  Plus,
  Info
} from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { setIsLoading, isLoading } = useAppContext();
  
  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Selection State
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Fetch Data
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await fetchProductById(id);
        
        if (data) {
          setProduct(data);
          setActiveImage(data.image);
          // Default selections
          if (data.colors && data.colors.length > 0) {
            setSelectedColor(data.colors[0].name);
          }
          if (data.sizes && data.sizes.length > 0) {
            setSelectedSize(data.sizes[0]);
          }
        } else {
          setError("محصول یافت نشد");
        }
      } catch (err) {
        console.error(err);
        setError("خطا در دریافت اطلاعات محصول");
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, setIsLoading]);

  if (isLoading) {
    // The global loader is now handling the loading state.
    // This component can return null or a minimal skeleton if desired.
    return null;
  }

  if (error || !product) {
    return (
      <div className="product-error-container">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2>{error || "محصول یافت نشد"}</h2>
        <Link to="/marketplace" className="btn-back">بازگشت به فروشگاه</Link>
      </div>
    );
  }

  // Derived Data
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  
  const hasPrice = product.price > 0;
  const discountedPrice = (hasPrice && product.discount) 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  return (
    <div className="product-detail-container">
      
      {/* --- Breadcrumbs --- */}
      <nav className="breadcrumbs">
        <Link to="/">خانه</Link> / 
        <Link to="/marketplace">فروشگاه</Link> / 
        <span>{product.category}</span>
      </nav>

      <div className="product-layout-grid">
        
        {/* --- RIGHT: Gallery --- */}
        <div className="product-gallery-section">
          <div className="main-image-wrapper">
            <img 
              src={activeImage} 
              alt={product.name} 
              className="main-img" 
              onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/600x800?text=No+Image'}
            />
            {product.discount ? (
              <span className="discount-badge-lg">
                {product.discount}٪ تخفیف
              </span>
            ) : null}
            <button className="wishlist-btn">
              <Heart size={24} />
            </button>
          </div>
          
          {gallery.length > 1 && (
            <div className="gallery-thumbs">
              {gallery.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={`thumb-btn ${activeImage === img ? 'active' : ''}`}
                >
                  <img src={img} alt={`view ${idx}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- LEFT: Info & Buy Box --- */}
        <div className="product-info-section">
          
          {/* Header */}
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-meta">
              <span className="vendor-type">{product.vendorType || 'فروشگاه'}</span>
              
              {/* Only show rating if available (mock for now as backend doesn't have it yet) */}
              <div className="rating-box">
                <Star size={16} fill="#facc15" className="text-yellow-400" />
                <span>۴.۸</span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="price-box">
            {hasPrice ? (
              product.discount ? (
                <div className="discounted-pricing">
                  <span className="old-price">{product.price.toLocaleString('fa-IR')}</span>
                  <span className="final-price">{discountedPrice.toLocaleString('fa-IR')} <span className="currency">تومان</span></span>
                </div>
              ) : (
                <span className="final-price">{product.price.toLocaleString('fa-IR')} <span className="currency">تومان</span></span>
              )
            ) : (
              <div className="call-for-price">
                <Info size={20} />
                <span>برای قیمت تماس بگیرید</span>
              </div>
            )}
          </div>

          <div className="divider"></div>

          {/* Variants: Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="variant-group">
              <span className="variant-label">رنگ: <span className="selected-value">{selectedColor}</span></span>
              <div className="colors-grid">
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    className={`color-swatch ${selectedColor === color.name ? 'selected' : ''}`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => setSelectedColor(color.name)}
                    title={color.name}
                  >
                    {selectedColor === color.name && <CheckCircle2 size={16} className={color.name === 'White' || color.hex === '#ffffff' ? 'text-black' : 'text-white'} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variants: Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="variant-group">
              <span className="variant-label">سایز: <span className="selected-value">{selectedSize}</span></span>
              <div className="sizes-grid">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Availability & Quantity */}
          <div className="stock-control-row">
            <div className={`availability-badge ${product.stock === 0 ? 'out' : product.stock < 5 ? 'low' : ''}`}>
               {product.stock > 0 && <CheckCircle2 size={16} />}
               {product.stock === 0 && <AlertCircle size={16} />}
               <span>
                 {product.stock > 10 ? 'موجود در انبار' : 
                  product.stock > 0 ? `فقط ${product.stock} عدد مانده` : 
                  'ناموجود'}
               </span>
            </div>

            {product.stock > 0 && (
              <div className="quantity-stepper">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={16}/></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}><Plus size={16}/></button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="action-buttons-row">
            <button className="btn-add-cart" disabled={product.stock === 0}>
              <ShoppingBag size={20} />
              {product.stock === 0 ? 'ناموجود' : 'افزودن به سبد خرید'}
            </button>
            <button className="btn-share">
              <Share2 size={20} />
            </button>
          </div>

          {/* Seller Card */}
          {product.storeId && product.storeSlug && (
            <div className="seller-info-card">
              <img src={product.storeAvatar} alt={product.storeName} className="seller-avatar" />
              <div className="seller-text">
                <span className="seller-label">فروشنده</span>
                <Link to={`/stores/${product.storeSlug}`} className="seller-name">{product.storeName || 'فروشگاه'}</Link>
              </div>
              <Link to={`/stores/${product.storeSlug}`} className="seller-link-btn">
                مشاهده غرفه
              </Link>
            </div>
          )}

          {/* Services */}
          <div className="services-grid">
            <div className="service-item">
              <Truck size={20} className="text-blue-500" />
              <span>ارسال سریع</span>
            </div>
            <div className="service-item">
              <ShieldCheck size={20} className="text-green-500" />
              <span>تضمین اصالت</span>
            </div>
          </div>

        </div>
      </div>

      {/* --- Content Tabs Section --- */}
      <div className="product-content-tabs">
        
        {/* Description & Specs */}
        <section className="detail-section">
          <h2 className="section-heading">مشخصات و توضیحات</h2>
          <div className="specs-container">
            <p className="description-text">{product.description || 'توضیحات محصول به زودی اضافه می‌شود.'}</p>
            
            {product.details && Object.keys(product.details).length > 0 && (
              <table className="specs-table">
                <tbody>
                  {Object.entries(product.details).map(([key, value]) => {
                    if (!value) return null;
                    return (
                      <tr key={key}>
                        <td className="spec-key">
                          {key === 'material' ? 'جنس' :
                           key === 'season' ? 'مناسب فصل' :
                           key === 'style' ? 'سبک' :
                           key === 'texture' ? 'طرح پارچه' :
                           key === 'origin' ? 'مبدا برند' : key}
                        </td>
                        <td className="spec-val">{value}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Reels (Only if available) */}
        {product.reels && product.reels.length > 0 && (
          <section className="detail-section">
            <h2 className="section-heading">ویدیوها و ریلز</h2>
            <div className="reels-scroller">
              {product.reels.map(reel => (
                <div key={reel.id} className="reel-card">
                  <img src={reel.thumbnail} alt="Reel thumbnail" />
                  <div className="play-overlay">
                    <Play size={24} fill="currentColor" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews (Only if available) */}
        {product.reviews && product.reviews.length > 0 && (
          <section className="detail-section">
            <h2 className="section-heading">نظرات کاربران</h2>
            <div className="reviews-list">
              {product.reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <img src={review.avatar} alt={review.user} className="reviewer-avatar" />
                    <div className="reviewer-info">
                      <span className="reviewer-name">{review.user}</span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                        ))}
                      </div>
                    </div>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <p className="review-text">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default ProductDetail;