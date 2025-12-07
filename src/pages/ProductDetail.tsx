import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { fetchProductById } from '../services/productService';
import { Product, Color, Size } from '../types';
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
  Info
} from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { setIsLoading, isLoading } = useAppContext();
  
  // State
  const [product, setProduct] = useState<Product | null>(null);
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

  return (
    <div className="product-detail-container">
      
      {/* --- Breadcrumbs --- */}
      <nav className="breadcrumbs">
        <Link to="/">خانه</Link> / 
        <Link to="/marketplace">فروشگاه</Link> / 
        <span>{product.name}</span>
      </nav>

      <div className="product-layout-grid">
        
        {/* --- RIGHT: Image --- */}
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

        {/* --- LEFT: Info & Buy Box --- */}
        <div className="product-info-section">
          
          {/* Header */}
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-meta">
               <div className="rating-box">
                <Star size={16} fill="#facc15" className="text-yellow-400" />
                <span>۴.۸ (mock)</span>
              </div>
            </div>
          </div>

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

          <div className="divider"></div>

          {/* Variants: Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="variant-group">
              <span className="variant-label">رنگ: <span className="selected-value">{selectedColor?.color_name}</span></span>
              <div className="colors-grid">
                {product.colors.map((color) => (
                  <button
                    key={color.id}
                    className={`color-swatch ${selectedColor?.id === color.id ? 'selected' : ''}`}
                    style={{ backgroundColor: color.color_hex }}
                    onClick={() => setSelectedColor(color)}
                    title={color.color_name}
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
              <span className="variant-label">سایز: <span className="selected-value">{selectedSize?.size_name}</span></span>
              <div className="sizes-grid">
                {product.sizes.map(size => (
                  <button
                    key={size.id}
                    className={`size-btn ${selectedSize?.id === size.id ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size.size_name}
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
            {product.description && <p className="description-text">{product.description}</p>}
            
            <table className="specs-table">
              <tbody>
                {product.seasons && product.seasons.length > 0 && (
                  <tr>
                    <td className="spec-key">مناسب فصل</td>
                    <td className="spec-val">{product.seasons.map(s => s.season_title).join('، ')}</td>
                  </tr>
                )}
                {product.styles && product.styles.length > 0 && (
                  <tr>
                    <td className="spec-key">سبک</td>
                    <td className="spec-val">{product.styles.map(s => s.style_title).join('، ')}</td>
                  </tr>
                )}
                {product.materials && product.materials.length > 0 && (
                  <tr>
                    <td className="spec-key">جنس</td>
                    <td className="spec-val">{product.materials.map(m => m.material_title).join('، ')}</td>
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
    </div>
  );
};

export default ProductDetail;