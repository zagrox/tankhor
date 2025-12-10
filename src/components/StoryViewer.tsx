
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Volume2, VolumeX, Heart, Share2, ShoppingBag, ChevronDown, ChevronLeft, ChevronRight, Shirt } from 'lucide-react';
import { Store, Reel, Product } from '../types';
import { Link } from 'react-router-dom';
import { fetchReelsByIds } from '../services/socialService';
import { fetchProducts } from '../services/productService';

interface StoryViewerProps {
  stores: Store[];
  initialStoreIndex: number;
  onClose: () => void;
}

const STORY_DURATION_IMAGE = 5000; // 5 seconds for images

const StoryViewer: React.FC<StoryViewerProps> = ({ stores, initialStoreIndex, onClose }) => {
  // Navigation State
  const [currentStoreIndex, setCurrentStoreIndex] = useState(initialStoreIndex);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  
  // Data State
  const [currentReels, setCurrentReels] = useState<Reel[]>([]);
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  
  // Playback State
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const touchStartX = useRef<number>(0);

  const activeStore = stores[currentStoreIndex];
  const activeReel = currentReels[currentReelIndex];

  // --- 1. Load Reels when Store Changes ---
  useEffect(() => {
    const loadReels = async () => {
      setIsLoading(true);
      setProgress(0);
      setCurrentReelIndex(0); // Reset to first story of the store
      setIsProductSheetOpen(false);

      if (activeStore && activeStore.reelIds && activeStore.reelIds.length > 0) {
        try {
          // Fetch the actual reel objects for this store
          const reels = await fetchReelsByIds(activeStore.reelIds);
          setCurrentReels(reels);
        } catch (error) {
          console.error("Failed to load stories", error);
        }
      } else {
        setCurrentReels([]);
      }
      setIsLoading(false);
    };

    loadReels();
  }, [currentStoreIndex, activeStore]);

  // --- 2. Load Products when Active Reel Changes ---
  useEffect(() => {
    const loadLinkedProducts = async () => {
      setActiveProducts([]);
      if (activeReel) {
        try {
          // Fetch products linked to this specific reel ID
          const products = await fetchProducts({
            product_reels: { reels_id: { _in: [activeReel.id] } }
          });
          setActiveProducts(products);
        } catch (error) {
          console.error("Failed to load reel products", error);
        }
      }
    };
    loadLinkedProducts();
  }, [activeReel]);

  // --- 3. Navigation Logic ---
  const handleNext = useCallback(() => {
    if (isProductSheetOpen) return; // Don't advance if sheet is open

    // If there are more reels in this store
    if (currentReelIndex < currentReels.length - 1) {
      setCurrentReelIndex(prev => prev + 1);
      setProgress(0);
    } 
    // If this was the last reel of the store, go to next store
    else if (currentStoreIndex < stores.length - 1) {
      setCurrentStoreIndex(prev => prev + 1);
    } 
    // If this was the last store, close viewer
    else {
      onClose();
    }
  }, [currentReelIndex, currentReels.length, currentStoreIndex, stores.length, onClose, isProductSheetOpen]);

  const handlePrev = useCallback(() => {
    // If there is a previous reel in this store
    if (currentReelIndex > 0) {
      setCurrentReelIndex(prev => prev - 1);
      setProgress(0);
    } 
    // If this was the first reel, go to previous store
    else if (currentStoreIndex > 0) {
      setCurrentStoreIndex(prev => prev - 1);
    }
  }, [currentReelIndex, currentStoreIndex]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  // Swipe Logic
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const swipeThreshold = 50;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped Left -> Next
        handleNext();
      } else {
        // Swiped Right -> Prev
        handlePrev();
      }
    }
  };


  // --- 4. Progress & Timer Logic ---
  useEffect(() => {
    if (!activeReel || isLoading || isPaused || isProductSheetOpen) return;

    const isVideo = activeReel.mimeType?.startsWith('video/');

    if (isVideo) {
      // Video logic is handled by onTimeUpdate event of <video>
      if (videoRef.current) {
        videoRef.current.play().catch(e => console.log("Autoplay blocked", e));
      }
    } else {
      // Image logic: Manual timer
      startTime.current = Date.now() - (progress / 100 * STORY_DURATION_IMAGE);
      
      const animate = () => {
        if (isPaused || isProductSheetOpen) return;
        
        const elapsed = Date.now() - startTime.current;
        const percentage = Math.min((elapsed / STORY_DURATION_IMAGE) * 100, 100);
        setProgress(percentage);

        if (percentage < 100) {
          progressInterval.current = requestAnimationFrame(animate);
        } else {
          handleNext();
        }
      };
      
      progressInterval.current = requestAnimationFrame(animate);
    }

    return () => {
      if (progressInterval.current) cancelAnimationFrame(progressInterval.current);
    };
  }, [activeReel, isLoading, isPaused, handleNext, isProductSheetOpen, progress]); // Added progress to deps to allow resume


  // --- 5. Video Specific Handlers ---
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && activeReel?.mimeType?.startsWith('video/') && !isPaused && !isProductSheetOpen) {
      const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percentage);
    }
  };

  const handleVideoEnded = () => {
    handleNext();
  };

  // --- Render Helpers ---
  if (!activeStore) return null;

  return (
    <div className="story-viewer-overlay">
      <div 
        className="story-media-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Progress Bars */}
        <div className="story-progress-container">
          {currentReels.length > 0 ? (
            currentReels.map((_, idx) => (
              <div key={idx} className="progress-segment">
                <div 
                  className={`progress-fill ${idx < currentReelIndex ? 'completed' : ''}`}
                  style={{ 
                    width: idx === currentReelIndex ? `${progress}%` : (idx < currentReelIndex ? '100%' : '0%') 
                  }}
                />
              </div>
            ))
          ) : (
            // Loading placeholder segments
            Array.from({ length: activeStore.reelIds?.length || 1 }).map((_, i) => (
              <div key={i} className="progress-segment" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}></div>
            ))
          )}
        </div>

        {/* Header */}
        <div className="story-header">
          <Link to={`/stores/${activeStore.slug}`} className="story-header-link">
            <img src={activeStore.avatar} alt={activeStore.name} className="story-avatar" />
            <div className="story-meta">
              <span className="story-username">{activeStore.name}</span>
              <span className="story-time">
                {activeReel ? new Date(activeReel.date).toLocaleDateString('fa-IR') : '...'}
              </span>
            </div>
          </Link>
          <button className="story-close-btn" onClick={onClose}>
            <X size={28} />
          </button>
        </div>

        {/* Main Media */}
        {isLoading ? (
          <div className="story-loader">
            <Shirt size={48} className="fashion-loader-icon" strokeWidth={1} />
          </div>
        ) : (
          activeReel && (
             activeReel.mimeType?.startsWith('video/') ? (
              <video
                ref={videoRef}
                src={activeReel.media}
                className="story-media"
                muted={isMuted}
                playsInline
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
              />
             ) : (
              <img 
                src={activeReel.media} 
                alt="Story" 
                className="story-media" 
              />
             )
          )
        )}

        {/* Desktop Navigation Arrows */}
        {!isProductSheetOpen && (
          <>
            <button className="nav-arrow left" onClick={(e) => { e.stopPropagation(); handlePrev(); }}>
              <ChevronLeft size={36} />
            </button>
            <button className="nav-arrow right" onClick={(e) => { e.stopPropagation(); handleNext(); }}>
              <ChevronRight size={36} />
            </button>
          </>
        )}

        {/* Touch Zones (Invisible tap areas for easy mobile navigation) */}
        {!isProductSheetOpen && (
          <>
             <div 
                className="tap-zone left" 
                onClick={handlePrev} 
                onMouseDown={() => setIsPaused(true)} 
                onMouseUp={() => setIsPaused(false)}
             ></div>
             <div 
                className="tap-zone right" 
                onClick={handleNext}
                onMouseDown={() => setIsPaused(true)} 
                onMouseUp={() => setIsPaused(false)}
             ></div>
          </>
        )}

        {/* Footer Actions */}
        <div className="story-footer-actions">
           {/* Mute (Video Only) */}
           {!isLoading && activeReel?.mimeType?.startsWith('video/') && (
             <button className="story-mute-icon" onClick={() => setIsMuted(!isMuted)}>
               {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
             </button>
           )}

           {/* Products Toggle */}
           {activeProducts.length > 0 && (
             <button className="story-action-btn" onClick={() => setIsProductSheetOpen(true)}>
               <ShoppingBag size={24} />
             </button>
           )}

           {/* Social Actions */}
           <button className="story-action-btn">
             <Heart size={24} />
           </button>
           <button className="story-action-btn">
             <Share2 size={24} />
           </button>
        </div>

        {/* Product Bottom Sheet */}
        <div className={`story-product-sheet ${isProductSheetOpen ? 'open' : ''}`}>
           <div className="sheet-header">
             <span className="sheet-title">محصولات این استوری</span>
             <button className="sheet-close" onClick={() => setIsProductSheetOpen(false)}>
               <ChevronDown size={20} />
             </button>
           </div>
           
           <div className="story-products-list">
             {activeProducts.map(product => (
               <Link 
                 key={product.id} 
                 to={`/product/${product.id}`} 
                 className="story-product-card"
               >
                 <img src={product.image} alt={product.name} className="story-product-img" />
                 <div className="story-product-info">
                   <span className="story-product-name">{product.name}</span>
                   <span className="story-product-price">{product.price.toLocaleString('fa-IR')} تومان</span>
                 </div>
                 <span className="story-btn-shop">خرید</span>
               </Link>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default StoryViewer;
