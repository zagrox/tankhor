import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { fetchStores } from '../services/storeService';
import { Store as StoreType } from '../types';
import { MOCK_POSTS, MOCK_PRODUCTS } from '../constants'; // Posts are still mock
import { Heart, MessageCircle, Share2, ShoppingBag, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

const SocialFeed: React.FC = () => {
  const { setIsLoading } = useAppContext();
  const [stores, setStores] = useState<StoreType[]>([]);

  useEffect(() => {
    const loadStores = async () => {
      setIsLoading(true);
      const fetchedStores = await fetchStores();
      setStores(fetchedStores);
      setIsLoading(false);
    };
    loadStores();
  }, [setIsLoading]);

  return (
    <div className="social-page">
      
      {/* Stories */}
      <div className="stories-container">
        <div className="stories-scroll">
          {stores.map((store) => (
            <Link to={`/stores/${store.slug}`} key={store.id} className="story-card">
              <div className="story-ring">
                <img 
                  src={store.avatar} 
                  alt={store.name} 
                  className="story-img" 
                />
              </div>
              <span className="story-username">
                {store.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="feed-list">
        {MOCK_POSTS.map((post) => {
          // Note: This part still uses mock data until posts are live
          const store = stores.find(s => s.id === post.storeId) || { id: post.storeId, name: 'فروشگاه', handle: '@store', avatar: '', slug: '' };

          return (
            <article key={post.id} className="feed-post">
              {/* Header */}
              <div className="post-header">
                <div className="post-author">
                  <Link to={`/stores/${store.slug}`}>
                    <img src={store.avatar} alt={store.name} className="post-avatar" />
                  </Link>
                  <div className="post-author-info">
                    <Link to={`/stores/${store.slug}`}>
                      <h3>{store.name}</h3>
                    </Link>
                    <p>{store.handle}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Image */}
              <div className="post-media">
                <img src={post.image} alt="Post content" loading="lazy" />
              </div>

              {/* Content & Actions */}
              <div className="post-content">
                <div className="action-bar">
                  <button className="action-btn hover:text-red-500">
                    <Heart size={26} />
                  </button>
                  <button className="action-btn hover:text-blue-500">
                    <MessageCircle size={26} />
                  </button>
                  <button className="action-btn hover:text-green-500">
                    <Share2 size={26} />
                  </button>
                  <div className="mr-auto"></div>
                  <button className="action-btn">
                     <ShoppingBag size={24} />
                  </button>
                </div>
                
                <span className="likes-count">{post.likes.toLocaleString('fa-IR')} پسند</span>

                <span className="caption-text">
                  <span className="caption-username">{store.name}</span>
                  {post.caption}
                </span>

                {/* Linked Products */}
                {post.linkedProductIds && post.linkedProductIds.length > 0 && (
                  <div className="tagged-products">
                    <span className="tagged-label">محصولات این پست</span>
                    <div className="grid grid-cols-1 gap-2">
                      {post.linkedProductIds.map(pid => {
                        const product = MOCK_PRODUCTS.find(p => p.id === pid);
                        if (!product) return null;
                        return (
                          <Link to={`/product/${product.id}`} key={pid} className="product-tag">
                            <img src={product.image} alt={product.name} className="tag-img" />
                            <div className="tag-info">
                              <h4>{product.name}</h4>
                              <p>{product.price.toLocaleString('fa-IR')} تومان</p>
                            </div>
                            <div className="tag-icon">
                              <ShoppingBag size={16} />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default SocialFeed;