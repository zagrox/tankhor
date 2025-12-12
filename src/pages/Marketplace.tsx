
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { fetchProducts } from '../services/productService'; 
import { Product } from '../types';
import { MOCK_PRODUCTS, PRICE_RANGES } from '../constants'; // Keep mock products as a fallback
import { Link } from 'react-router-dom';
import { ShoppingBag, Grid, List, Table, Shirt } from 'lucide-react';

// --- Sub-Component: Product Card (Handles View Modes & Loader) ---
const MarketplaceProductCard: React.FC<{ product: Product; viewMode: 'grid' | 'list' | 'table' }> = ({ product, viewMode }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // --- Table View ---
  if (viewMode === 'table') {
    return (
      <Link to={`/product/${product.id}`} className="product-table-row">
        <div className="table-col-img">
          <div className="table-img-wrapper">
             {!isLoaded && (
                <div className="skeleton-loader-mini">
                  <Shirt size={16} className="fashion-loader-icon text-gray-400" strokeWidth={1} />
                </div>
             )}
             <img 
               src={product.image} 
               alt={product.name} 
               className={isLoaded ? 'fade-in' : 'opacity-0'} 
               onLoad={() => setIsLoaded(true)}
             />
          </div>
        </div>
        <div className="table-col-info">
           <span className="table-product-name">{product.name}</span>
           <span className="table-store-name">{product.storeName}</span>
        </div>
        <div className="table-col-category">
          {product.category?.category_name}
        </div>
        <div className="table-col-price">
           {product.finalPrice.toLocaleString('fa-IR')} <span className="text-xs">تومان</span>
        </div>
        <div className="table-col-action">
           <button className="btn-add-mini-table" onClick={(e) => e.preventDefault()}>
             <ShoppingBag size={14} />
           </button>
        </div>
      </Link>
    );
  }

  // --- List & Grid View ---
  const isList = viewMode === 'list';

  return (
    <Link to={`/product/${product.id}`} className={`store-product-card ${isList ? 'list-view' : ''}`}>
      <div className="card-img-wrapper">
        {/* Loader Overlay */}
        {!isLoaded && (
          <div className="skeleton-loader">
             <Shirt size={isList ? 24 : 32} className="fashion-loader-icon text-gray-400" strokeWidth={1} />
          </div>
        )}
        
        <img 
          src={product.image} 
          alt={product.name} 
          className="card-img"
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          style={{ opacity: isLoaded ? 1 : 0 }} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400?text=No+Image';
            setIsLoaded(true);
          }}
        />
        
        {/* Category Badge - Grid View Only */}
        {product.category && !isList && (
          <div className="category-badge">
            {product.category.category_name}
          </div>
        )}

        {/* Discount Badge - Grid View Only */}
        {product.discountPercentage && !isList && (
           <div className="discount-badge-card">
             {product.discountPercentage}٪
           </div>
        )}
      </div>
      
      <div className="card-body">
        <div className="card-body-header">
           <h3 className="card-title">{product.name}</h3>
           <span className="card-store">{product.storeName || 'فروشگاه'}</span>
        </div>
        
        {/* Extended Details for List View */}
        {isList && (
          <div className="list-view-content">
            <div className="list-badges">
               {product.category && (
                 <span className="list-badge">{product.category.category_name}</span>
               )}
               
               {product.inStock 
                 ? <span className="list-badge text-green">موجود</span>
                 : <span className="list-badge text-red">ناموجود</span>
               }
               
               {product.discountPercentage ? (
                 <span className="list-badge bg-red text-white">{product.discountPercentage}٪ تخفیف</span>
               ) : null}
            </div>

            <div className="list-attributes">
               {product.materials && product.materials.length > 0 && (
                 <div className="attr-item">
                   <span className="attr-label">جنس:</span>
                   <span>{product.materials.map(m => m.material_title).join('، ')}</span>
                 </div>
               )}
               {product.styles && product.styles.length > 0 && (
                 <div className="attr-item">
                   <span className="attr-label">سبک:</span>
                   <span>{product.styles.map(s => s.style_title).join('، ')}</span>
                 </div>
               )}
            </div>

            {product.description && (
              <p className="card-desc-preview">{product.description.substring(0, 160)}...</p>
            )}
          </div>
        )}

        <div className="card-footer">
          <div className="card-price-column">
            {product.discountPercentage ? (
               <span className="price-old">{product.price.toLocaleString('fa-IR')}</span>
            ) : null}
            <div className="card-price">
              {product.finalPrice.toLocaleString('fa-IR')} 
              <span>تومان</span>
            </div>
          </div>
          <button className="btn-add-mini" onClick={(e) => e.preventDefault()}>
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
};

const Marketplace: React.FC = () => {
  const { 
    setIsLoading, 
    isLoading,
    selectedCategories, 
    selectedSeasons, // Get seasons filter
    selectedStyles, // Get styles filter
    selectedMaterials, // Get materials filter
    selectedGenders, // Get genders filter
    selectedVendors, // Get vendors filter
    selectedColorFamilies, // Get color families filter
    selectedPriceRanges, // Get price ranges filter
    priceSort,
  } = useAppContext();

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');

  // Fetch Data on Mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const realProducts = await fetchProducts();
        
        if (realProducts && realProducts.length > 0) {
          setProducts(realProducts);
        } else {
          console.warn("No products found in Directus, using Mock data.");
          setProducts(MOCK_PRODUCTS);
        }

      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("خطا در دریافت محصولات");
        setProducts(MOCK_PRODUCTS); 
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setIsLoading]);

  // Filter Logic (Client Side) using global state
  const filteredProducts = products.filter(p => {
    // Category Filter
    const categoryMatch = selectedCategories.length === 0 || (p.category && selectedCategories.includes(String(p.category.id)));
    
    // Season Filter (M2M check)
    const seasonMatch = selectedSeasons.length === 0 || (p.seasons && p.seasons.some(s => selectedSeasons.includes(String(s.id))));

    // Style Filter (M2M check)
    const styleMatch = selectedStyles.length === 0 || (p.styles && p.styles.some(s => selectedStyles.includes(String(s.id))));

    // Material Filter (M2M check)
    const materialMatch = selectedMaterials.length === 0 || (p.materials && p.materials.some(m => selectedMaterials.includes(String(m.id))));

    // Gender Filter (M2M check)
    const genderMatch = selectedGenders.length === 0 || (p.genders && p.genders.some(g => selectedGenders.includes(String(g.id))));

    // Vendor Filter (Check against storeVendor.id)
    const vendorMatch = selectedVendors.length === 0 || (p.storeVendor && selectedVendors.includes(String(p.storeVendor.id)));

    // Color Family Filter (Check against color_family property)
    const colorMatch = selectedColorFamilies.length === 0 || (p.colors && p.colors.some(c => c.color_family && selectedColorFamilies.includes(c.color_family)));

    // Price Range Filter
    const priceMatch = selectedPriceRanges.length === 0 || selectedPriceRanges.some(rangeId => {
      const range = PRICE_RANGES.find(r => r.id === rangeId);
      if (!range) return false;
      return p.finalPrice >= range.min && p.finalPrice < range.max;
    });

    return categoryMatch && seasonMatch && styleMatch && materialMatch && genderMatch && vendorMatch && colorMatch && priceMatch;
  }).sort((a, b) => {
    if (priceSort === 'asc') return a.finalPrice - b.finalPrice;
    if (priceSort === 'desc') return b.finalPrice - a.finalPrice;
    return 0;
  });

  return (
    <div className="marketplace-page">
      {/* Grid */}
      <main className="products-container">
        
        <div className="products-header">
          <div className="products-header-start">
             <h1 className="products-title">محصولات برگزیده</h1>
             <span className="products-count">
               {isLoading ? '...' : `${filteredProducts.length} کالا`}
             </span>
          </div>

          <div className="layout-switcher">
            <button 
              className={`layout-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="نمایش شبکه"
            >
              <Grid size={20} />
            </button>
            <button 
              className={`layout-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="نمایش لیست"
            >
              <List size={20} />
            </button>
            <button 
              className={`layout-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="نمایش جدول"
            >
              <Table size={20} />
            </button>
          </div>
        </div>

        {!isLoading && (
          <div className={`products-container-view ${viewMode}`}>
            {filteredProducts.map(product => (
              <MarketplaceProductCard 
                key={product.id} 
                product={product} 
                viewMode={viewMode}
              />
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                محصولی با فیلترهای انتخاب شده یافت نشد.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;
