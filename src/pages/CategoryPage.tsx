import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';
import { fetchCategoryInfoAndProducts, CategoryType } from '../services/categoryService';
import { AlertCircle, ShoppingBag } from 'lucide-react';

interface CategoryPageProps {
  type: CategoryType;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ type }) => {
  const { slug } = useParams<{ slug: string }>();
  const { setIsLoading, isLoading } = useAppContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { info, products: fetchedProducts } = await fetchCategoryInfoAndProducts(type, slug);
        
        if (info) {
          setCategoryInfo(info);
          setProducts(fetchedProducts);
        } else {
          setError('دسته بندی مورد نظر یافت نشد.');
        }
      } catch (err) {
        console.error(`Failed to load data for ${type}/${slug}`, err);
        setError('خطا در دریافت اطلاعات.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [type, slug, setIsLoading]);

  // FIX: Added 'category' to the record to match the CategoryType definition.
  const typeTranslations: Record<CategoryType, string> = {
    season: 'فصل',
    style: 'سبک',
    material: 'جنس',
    gender: 'جنسیت',
    vendor: 'نوع فروشگاه',
    category: 'دسته‌بندی'
  };

  const getCategoryTitle = () => {
    if (!categoryInfo) return '';
    switch (type) {
      case 'season': return categoryInfo.season_title;
      case 'style': return categoryInfo.style_title;
      case 'material': return categoryInfo.material_title;
      case 'gender': return categoryInfo.gender_title;
      case 'vendor': return categoryInfo.vendor_name;
      default: return '';
    }
  };

  if (isLoading) {
    return null; // Global loader is active
  }

  if (error) {
    return (
      <div className="category-page-status">
        <AlertCircle size={48} className="text-red-500" />
        <h2>{error}</h2>
        <Link to="/filters" className="btn-back-filters">بازگشت به دسته‌بندی‌ها</Link>
      </div>
    );
  }

  return (
    <div className="category-page">
      <header className="category-header">
        <span className="category-type">{typeTranslations[type]}</span>
        <h1 className="category-title">{getCategoryTitle()}</h1>
      </header>
      
      {products.length > 0 ? (
        <div className="category-products-grid">
          {products.map(product => (
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
                {/* FIX: Render the `category_name` property of the `product.category` object, not the object itself. */}
                <div className="category-badge">{product.category?.category_name}</div>
              </div>
              <div className="card-body">
                <h3 className="card-title">{product.name}</h3>
                <span className="card-store">{product.storeName || 'فروشگاه'}</span>
                <div className="card-footer">
                  <div className="card-price">
                    {product.price.toLocaleString('fa-IR')} 
                    <span>تومان</span>
                  </div>
                  <button className="btn-add-mini" onClick={(e) => e.preventDefault()}>
                    <ShoppingBag size={16} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="category-page-status">
          <p>محصولی در این دسته‌بندی یافت نشد.</p>
          <Link to="/filters" className="btn-back-filters">بازگشت به دسته‌بندی‌ها</Link>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
