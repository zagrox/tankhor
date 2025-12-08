

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { fetchProducts } from '../services/productService'; 
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants'; // Keep mock products as a fallback
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const Marketplace: React.FC = () => {
  const { 
    setIsLoading, 
    isLoading,
    selectedCategories, 
    selectedSeasons, // Get seasons filter
    selectedStyles, // Get styles filter
    selectedMaterials, // Get materials filter
    selectedGenders, // Get genders filter
    selectedColorFamilies, // Get color families filter
    priceSort,
  } = useAppContext();

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

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

    // Color Family Filter (Check against color_family property)
    const colorMatch = selectedColorFamilies.length === 0 || (p.colors && p.colors.some(c => c.color_family && selectedColorFamilies.includes(c.color_family)));

    return categoryMatch && seasonMatch && styleMatch && materialMatch && genderMatch && colorMatch;
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
          <h1 className="products-title">محصولات برگزیده</h1>
          <span className="products-count">
            {isLoading ? '...' : `${filteredProducts.length} کالا`}
          </span>
        </div>

        {!isLoading && (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} className="store-product-card">
                  <div className="card-img-wrapper">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="card-img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400?text=No+Image';
                      }}
                    />
                    {product.category && (
                      <div className="category-badge">
                        {product.category.category_name}
                      </div>
                    )}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{product.name}</h3>
                    <span className="card-store">{product.storeName || 'فروشگاه'}</span>
                    
                    <div className="card-footer">
                      <div className="card-price">
                        {product.finalPrice.toLocaleString('fa-IR')} 
                        <span>تومان</span>
                      </div>
                      <button className="btn-add-mini">
                        <ShoppingBag size={16} />
                      </button>
                    </div>
                  </div>
                </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;