import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../lib/directus'; // Import API helper
import { Product } from '../types';
import { MOCK_PRODUCTS, MOCK_STORES } from '../constants'; // Keep MOCK_STORES for now until Stores are integrated
import { Link } from 'react-router-dom';
import { Filter, ShoppingBag, ArrowUpDown, Loader2 } from 'lucide-react';

const Marketplace: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | 'default'>('default');

  // Fetch Data on Mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch real data from Directus
        const realProducts = await fetchProducts();
        
        // Fallback to MOCK if DB is empty (for demo stability)
        if (!realProducts || realProducts.length === 0) {
          console.warn("No products found in Directus, using Mock data.");
          setProducts(MOCK_PRODUCTS);
        } else {
          setProducts(realProducts);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("خطا در دریافت محصولات");
        // Fallback on error
        setProducts(MOCK_PRODUCTS); 
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter Logic (Client Side for now)
  const categories = ['همه', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && selectedCategory !== 'همه') {
      return p.category === selectedCategory;
    }
    return true;
  }).sort((a, b) => {
    if (priceSort === 'asc') return a.price - b.price;
    if (priceSort === 'desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="marketplace-page">
      <div className="marketplace-layout">
        
        {/* Sidebar */}
        <aside className="filters-container">
          <div className="filters-box">
            <div className="filter-header">
              <Filter size={20} className="text-secondary" />
              <h2>فیلترها</h2>
            </div>
            
            <div className="filter-group">
              <span className="filter-title">دسته‌بندی‌ها</span>
              <div className="space-y-1">
                {categories.map(cat => (
                  <label key={cat} className="radio-option">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === cat} 
                      onChange={() => setSelectedCategory(cat)}
                      className="radio-input" 
                    />
                    <span className="radio-label">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-title flex items-center gap-2">
                <ArrowUpDown size={14} />
                مرتب‌سازی قیمت
              </span>
              <select 
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value as any)}
                className="sort-select"
              >
                <option value="default">پیش‌فرض</option>
                <option value="asc">ارزان‌ترین</option>
                <option value="desc">گران‌ترین</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <main className="products-container">
          <div className="products-header">
            <h1 className="products-title">محصولات برگزیده</h1>
            <span className="products-count">
              {loading ? '...' : `${filteredProducts.length} کالا`}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-secondary" size={48} />
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => {
                // Temporary: Still matching mock stores until stores are integrated
                const store = MOCK_STORES.find(s => s.id === product.storeId);
                
                return (
                  <Link to={`/product/${product.id}`} key={product.id} className="store-product-card">
                    <div className="card-img-wrapper">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="card-img"
                        onError={(e) => {
                          // Fallback if image fails
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400?text=No+Image';
                        }}
                      />
                      <div className="category-badge">
                        {product.category}
                      </div>
                    </div>
                    <div className="card-body">
                      <h3 className="card-title">{product.name}</h3>
                      <span className="card-store">{store?.name || 'فروشگاه'}</span>
                      
                      <div className="card-footer">
                        <div className="card-price">
                          {product.price.toLocaleString('fa-IR')} 
                          <span>تومان</span>
                        </div>
                        <button className="btn-add-mini">
                          <ShoppingBag size={16} />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Marketplace;
