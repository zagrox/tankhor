

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { fetchProductById } from '../services/productService';
import { fetchReelsByIds } from '../services/socialService';
import { Product, Color, Size, Reel } from '../types';
import { 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Truck, 
  Heart, 
  Share2, 
  AlertCircle,
  CheckCircle2,
  Minus,
  Plus,
  Info,
  Play
} from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { setIsLoading, isLoading } = useAppContext();
  
  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [reels, setReels] = useState<Reel[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Selection State
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
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
          // Default selections
          if (data.colors && data.colors.length > 0) {
            setSelectedColor(data.colors[0]);
          }
          if (data.sizes && data.sizes.length > 0) {
            setSelectedSize(data.sizes[0]);
          }

          // Fetch Reels if available
          if (data.relatedReelIds && data.relatedReelIds.length > 0) {
            const relatedReels = await fetchReelsByIds(data.relatedReelIds);
            setReels(relatedReels);
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
  const hasPrice = product.price > 0;

  // Dynamic Page Style based on Store Color
  const pageStyle = {
    '--store-theme': product.storeColor || 'var(--color-secondary)'
  } as React.CSSProperties;

  return (
    <div className="product-detail-container" style={pageStyle}>
      
      {/* --- Breadcrumbs --- */}
      <nav className="breadcrumbs">
        <Link to="/">خانه</Link> / 
        <Link to="/marketplace">فروشگاه</Link> / 
        {product.category && <><Link to={`/filters`}>{product.category.category_name}</Link> / </>}
        <span>{product.name}</span>
      </nav>

      {/* --- ROW 1: Main Product Info (Image & Buy Box) --- */}
      <div className="product-layout-grid">
        
        {/* RIGHT COLUMN: Image Gallery */}
        <div className="product-gallery-section">
          <div className="main-image-wrapper">
            <img 
              src={product.image} 
              alt={product.name} 
              className="main-img" 
              onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/600x800?text=No+Image'}
            />
            {product.discountPercentage ? (
              <span className="discount-badge-lg">
                {product.discountPercentage}٪ تخفیف
              </span>
            ) : null}
            <button className="wishlist-btn">
              <Heart size={24} />
            </button>
          </div>
        </div>

        {/* LEFT COLUMN: Product Info & Attributes */}
        <div className="product-info-section">
          
          {/* Header */}
          <div className="product-header">
            {product.category && <span className="category-tag">{product.category.category_name}</span>}
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-meta">
               <div className="rating-box">
                <Star size={16} fill="#facc15" className="text-yellow-400" />
                <span>۴.۸</span>
              </div>
              {product.storeVendor && <span className="vendor-type">{product.storeVendor.vendor_title}</span>}
            </div>

            {/* Overview */}
            {product.overview && (
              <p className="product-overview">{product.overview}</p>
            )}
          </div>

          <div className="divider"></div>

          {/* Price */}
          <div className="price-box">
            {hasPrice ? (
              product.discountPercentage ? (
                <div className="discounted-pricing">
                  <span className="old-price">{product.price.toLocaleString('fa-IR')}</span>
                  <span className="final-price">{product.finalPrice.toLocaleString('fa-IR')} <span className="currency">تومان</span></span>
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

          {/* Variants: Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="variant-group">
               <span className="variant-label">
                رنگ: <span className="selected-value">{selectedColor?.color_title || selectedColor?.color_name || selectedColor?.id || '-'}</span>
              </span>
              <div className="colors-grid">
                {product.colors.map((color) => (
                  <button
                    key={color.id}
                    className={`color-swatch ${selectedColor?.id === color.id ? 'selected' : ''}`}
                    style={{ backgroundColor: color.color_hex || color.color_decimal }}
                    onClick={() => setSelectedColor(color)}
                    title={color.color_title || color.color_name}
                  >
                    {selectedColor?.id === color.id && <CheckCircle2 size={16} className={color.color_name === 'White' || color.color_hex === '#ffffff' ? 'text-black' : 'text-white'} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variants: Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="variant-group">
               <span className="variant-label">
                سایز: <span className="selected-value">{selectedSize?.size_title || selectedSize?.size_name || selectedSize?.id || '-'}</span>
              </span>
              <div className="sizes-grid">
                {product.sizes.map(size => (
                  <button
                    key={size.id}
                    className={`size-btn ${selectedSize?.id === size.id ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size.size_title || size.size_name || size.id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Availability & Quantity */}
          <div className="stock-control-row">
            <div className={`availability-badge ${product.inStock ? '' : 'out'}`}>
               {product.inStock ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
               <span>{product.inStock ? 'موجود در انبار' : 'ناموجود'}</span>
            </div>

            {product.inStock && (
              <div className="quantity-stepper">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={16}/></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}><Plus size={16}/></button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="action-buttons-row">
            <button className="btn-add-cart" disabled={!product.inStock}>
              <ShoppingBag size={20} />
              {!product.inStock ? 'ناموجود' : 'افزودن به سبد خرید'}
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
                مشاهده فروشگاه
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

      {/* --- ROW 2: Specifications & Reels (Split View) --- */}
      <div className="details-split-grid">
        
        {/* Column 1: Reels (Grid) - NOW FIRST (RIGHT in RTL) */}
        {reels.length > 0 && (
          <section className="detail-section reels-col">
             <h2 className="section-heading">ویدیوهای محصول</h2>
             <div className="reels-grid-compact">
               {reels.map(reel => (
                 <div key={reel.id} className="reel-card compact">
                   {reel.mimeType?.startsWith('video/') ? (
                      <video src={reel.media} className="object-cover w-full h-full" muted />
                   ) : (
                      <img src={reel.media} alt={reel.caption} />
                   )}
                   <div className="play-overlay">
                      <Play size={20} fill="white" />
                   </div>
                 </div>
               ))}
             </div>
          </section>
        )}

        {/* Column 2: Specifications (Table) - NOW SECOND (LEFT in RTL) */}
        <section className="detail-section specs-col">
          <h2 className="section-heading">مشخصات فنی</h2>
          <div className="specs-container">
            <table className="specs-table">
              <tbody>
                {product.category && (
                  <tr>
                    <td className="spec-key">دسته‌بندی</td>
                    <td className="spec-val">{product.category.category_name}</td>
                  </tr>
                )}
                {product.weight && (
                   <tr>
                    <td className="spec-key">وزن</td>
                    <td className="spec-val">{product.weight} گرم</td>
                  </tr>
                )}
                {product.materials && product.materials.length > 0 && (
                  <tr>
                    <td className="spec-key">جنس و متریال</td>
                    <td className="spec-val">{product.materials.map(m => m.material_title).join('، ')}</td>
                  </tr>
                )}
                 {product.styles && product.styles.length > 0 && (
                  <tr>
                    <td className="spec-key">سبک و استایل</td>
                    <td className="spec-val">{product.styles.map(s => s.style_title).join('، ')}</td>
                  </tr>
                )}
                {product.seasons && product.seasons.length > 0 && (
                  <tr>
                    <td className="spec-key">مناسب فصل</td>
                    <td className="spec-val">{product.seasons.map(s => s.season_title).join('، ')}</td>
                  </tr>
                )}
                {product.genders && product.genders.length > 0 && (
                  <tr>
                    <td className="spec-key">جنسیت</td>
                    <td className="spec-val">{product.genders.map(g => g.gender_title).join('، ')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* --- ROW 3: Description (Full Width) --- */}
      <section className="detail-section description-full">
          <h2 className="section-heading">توضیحات محصول</h2>
          <div 
            className="description-text"
            dangerouslySetInnerHTML={{ __html: product.description || "توضیحاتی برای این محصول ثبت نشده است." }}
          />
      </section>

    </div>
  );
};

export default ProductDetail;
