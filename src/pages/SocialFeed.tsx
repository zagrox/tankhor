
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { fetchStores } from '../services/storeService';
import { fetchReels } from '../services/socialService';
import { fetchProducts } from '../services/productService';
import { Store as StoreType, Reel, Product } from '../types';
import { Heart, MessageCircle, Share2, ShoppingBag, Volume2, VolumeX, Play, Pause, ChevronLeft, Shirt } from 'lucide-react';
import { Link } from 'react-router-dom';
import StoryViewer from '../components/StoryViewer';

// --- Sub-Component: Feed Post (Handles Video Logic & UI) ---
const FeedPost: React.FC<{ 
  reel: Reel; 
  linkedProducts: Product[];
  hasActiveStory?: boolean;
  onStoryClick?: () => void;
}> = ({ reel, linkedProducts, hasActiveStory, onStoryClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showOverlayIcon, setShowOverlayIcon] = useState(false); // For Play/Pause animation
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // Loading State
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);

  const isVideo = reel.mimeType?.startsWith('video/');

  // Initial check for cached video
  useEffect(() => {
    if (isVideo && videoRef.current) {
      if (videoRef.current.readyState >= 3) {
        setIsMediaLoaded(true);
      }
    }
  }, [isVideo]);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.6, // Play when 60% of the video is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Only attempt play if data is loaded
          if (videoRef.current?.readyState && videoRef.current.readyState >= 3) {
             videoRef.current?.play().then(() => {
              setIsPlaying(true);
            }).catch(() => {
              setIsPlaying(false);
            });
          }
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      });
    }, options);

    observer.observe(videoRef.current);

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, [isVideo]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }

    setShowOverlayIcon(true);
    setTimeout(() => setShowOverlayIcon(false), 800);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLoadedData = () => {
    setIsMediaLoaded(true);
  };

  return (
    <article className="feed-post-reel">
      {/* Media Content */}
      <div className="reel-media-container" onClick={isVideo ? togglePlay : undefined}>
        
        {/* Fashion Loader Overlay (Visible until media is loaded) */}
        {!isMediaLoaded && (
          <div className="media-loader-overlay">
            <Shirt size={48} className="fashion-loader-icon" strokeWidth={1} />
          </div>
        )}

        {isVideo ? (
          <>
            <video
              ref={videoRef}
              src={reel.media}
              className={`reel-video ${isMediaLoaded ? 'fade-in' : 'hidden'}`}
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              poster={reel.cover} // Use the cover image as poster
              onLoadedData={handleLoadedData}
              onCanPlay={handleLoadedData}
            />
            {/* Play/Pause Animation Overlay */}
            <div className={`center-play-icon ${showOverlayIcon ? 'animate' : ''}`}>
              {isPlaying ? <Play size={48} fill="currentColor" /> : <Pause size={48} fill="currentColor" />}
            </div>
          </>
        ) : (
          <img 
            src={reel.media} 
            alt="Post content" 
            className={`reel-image ${isMediaLoaded ? 'fade-in' : 'hidden'}`} 
            loading="lazy" 
            onLoad={handleLoadedData}
          />
        )}
        
        {/* Gradient Overlay for Text Readability */}
        <div className="reel-gradient-overlay"></div>
      </div>

      {/* Floating Action Bar (Right side in LTR, Left in RTL) */}
      <div className="reel-actions-sidebar">
        <button className="action-btn-vertical">
          <Heart size={28} />
          <span className="action-count">{reel.likes.toLocaleString('fa-IR')}</span>
        </button>
        
        <button className="action-btn-vertical">
          <MessageCircle size={28} />
          <span className="action-count">نظر</span>
        </button>
        
        <button className="action-btn-vertical">
          <Share2 size={28} />
        </button>

        <button className="action-btn-vertical shop-btn">
          <ShoppingBag size={26} />
        </button>
        
        {/* Mute Button Replaces More Options */}
        {isVideo && (
          <button className="action-btn-vertical" onClick={toggleMute}>
            {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
          </button>
        )}
      </div>

      {/* Bottom Content Overlay */}
      <div className="reel-content-overlay">
        
        {/* User Info */}
        <div className="reel-user-row">
          {hasActiveStory ? (
             <div 
               className="story-ring-active cursor-pointer" 
               onClick={onStoryClick}
               title="مشاهده استوری"
             >
                <img src={reel.store.avatar} alt={reel.store.name} className="reel-avatar" />
             </div>
          ) : (
            <Link to={`/stores/${reel.store.slug}`} className="reel-avatar-link">
              <img src={reel.store.avatar} alt={reel.store.name} className="reel-avatar" />
            </Link>
          )}
          
          <div className="flex flex-col">
            <Link to={`/stores/${reel.store.slug}`} className="reel-username">
              {reel.store.name}
            </Link>
          </div>
          <button className="reel-follow-btn">دنبال کردن</button>
        </div>

        {/* Caption */}
        <div className="reel-caption-container">
          <p className={`reel-caption-text ${isDescriptionExpanded ? 'expanded' : ''}`} onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
            {reel.caption}
          </p>
        </div>

        {/* Linked Products (Vertical Glass Stack) - Now at the bottom */}
        {linkedProducts.length > 0 && (
          <div className="reel-products-stack">
            {linkedProducts.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} className="product-glass-card">
                <div className="glass-card-img-wrapper">
                  <img src={product.image} alt="" className="glass-card-img" />
                </div>
                <div className="glass-card-info">
                  <span className="glass-card-name">{product.name}</span>
                  <span className="glass-card-price">{product.price.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="glass-card-action">
                  <span className="glass-btn-text">خرید</span>
                  <ChevronLeft size={16} />
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </article>
  );
};


// --- Main Component ---
const SocialFeed: React.FC = () => {
  const { setIsLoading } = useAppContext();
  const [stores, setStores] = useState<StoreType[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  // Story Viewing State
  const [storyStores, setStoryStores] = useState<StoreType[]>([]);
  const [isViewingStory, setIsViewingStory] = useState(false);
  const [viewingStoreIndex, setViewingStoreIndex] = useState(0);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerTarget = useRef(null);

  // Initial Load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const fetchedStores = await fetchStores();
        setStores(fetchedStores);
        
        // Fetch first batch of reels
        const initialReels = await fetchReels(1, 5); 
        setReels(initialReels);
        
        // --- Smart Story Sorting ---
        // 1. Identify stores that are in the initial batch of reels (Recent Active)
        const recentStoreIds = Array.from(new Set(initialReels.map(r => r.store.id)));
        
        // 2. Filter valid stores (those with reels)
        let validStores = fetchedStores.filter(s => s.reelIds && s.reelIds.length > 0);

        // 3. Sort: Stores in 'recentStoreIds' come first, maintaining their relative order from the feed
        validStores.sort((a, b) => {
            const indexA = recentStoreIds.indexOf(a.id);
            const indexB = recentStoreIds.indexOf(b.id);
            
            // If both are recent, lower index (earlier in feed) wins
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // If only A is recent, it wins
            if (indexA !== -1) return -1;
            // If only B is recent, it wins
            if (indexB !== -1) return 1;
            // If neither is recent, keep original order (or sort alphabetically if preferred)
            return 0;
        });

        setStoryStores(validStores);

        if (initialReels.length < 5) setHasMore(false);

        // Fetch products only for visible reels
        if (initialReels.length > 0) {
          const reelIds = initialReels.map(r => r.id);
          const products = await fetchProducts({
            product_reels: { reels_id: { _in: reelIds } }
          });
          setRelatedProducts(products);
        }

      } catch (e) {
        console.error("Failed to load social feed", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [setIsLoading]);

  // Load More Function
  const loadMoreReels = useCallback(async () => {
    if (isFetchingMore || !hasMore) return;
    
    setIsFetchingMore(true);
    const nextPage = page + 1;
    
    try {
      const newReels = await fetchReels(nextPage, 5);
      
      if (newReels.length === 0) {
        setHasMore(false);
      } else {
        setReels(prev => [...prev, ...newReels]);
        setPage(nextPage);

        // Fetch products for new reels
        const reelIds = newReels.map(r => r.id);
        const newProducts = await fetchProducts({
          product_reels: { reels_id: { _in: reelIds } }
        });
        setRelatedProducts(prev => [...prev, ...newProducts]);
      }
    } catch (e) {
      console.error("Failed to load more reels", e);
    } finally {
      setIsFetchingMore(false);
    }
  }, [page, hasMore, isFetchingMore]);

  // Infinite Scroll Observer with PRELOAD
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreReels();
        }
      },
      { 
        // IMPORTANT: Trigger load 800px BEFORE the user hits the bottom.
        // This effectively hides the loader and prevents scroll jumping because
        // new content is appended while the user is still viewing current content.
        rootMargin: '800px', 
        threshold: 0 
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMoreReels]);


  // Helper to find products for a specific reel
  const getProductsForReel = (reelId: number) => {
    return relatedProducts.filter(p => p.relatedReelIds && p.relatedReelIds.includes(reelId));
  };

  const openStory = (index: number) => {
    setViewingStoreIndex(index);
    setIsViewingStory(true);
  };
  
  // Helper to open story from FeedPost
  const openStoryFromFeed = (storeId: string) => {
    const index = storyStores.findIndex(s => s.id === storeId);
    if (index !== -1) {
      openStory(index);
    }
  };

  return (
    <div className="social-page">
      {/* Story Viewer Overlay */}
      {isViewingStory && storyStores.length > 0 && (
        <StoryViewer 
          stores={storyStores} 
          initialStoreIndex={viewingStoreIndex} 
          onClose={() => setIsViewingStory(false)} 
        />
      )}

      {/* Stories Bubbles */}
      <div className="stories-container">
        <div className="stories-scroll">
          {storyStores.map((store, index) => (
            <div 
              key={store.id} 
              className="story-card cursor-pointer" 
              onClick={() => openStory(index)}
            >
              <div className="story-ring">
                <img src={store.avatar} alt={store.name} className="story-img" />
              </div>
              <span className="story-name">{store.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="feed-list">
        {reels.map((reel) => {
          const hasStory = storyStores.some(s => s.id === reel.store.id);
          return (
            <FeedPost 
              key={reel.id} 
              reel={reel} 
              linkedProducts={getProductsForReel(reel.id)}
              hasActiveStory={hasStory}
              onStoryClick={() => openStoryFromFeed(reel.store.id)}
            />
          );
        })}
        
        {/* Loader Sentinel */}
        <div ref={observerTarget} className="feed-loader">
           {isFetchingMore && <div className="loader-spinner"></div>}
           {!hasMore && reels.length > 0 && <span className="end-msg">پایان مطالب</span>}
        </div>
      </div>
    </div>
  );
};

export default SocialFeed;
