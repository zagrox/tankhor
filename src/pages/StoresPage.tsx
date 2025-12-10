
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { fetchStores } from '../services/storeService';
import { fetchVendors } from '../services/categoryService';
import { Store, Vendor } from '../types';
import { Search, Store as StoreIcon, ArrowLeft } from 'lucide-react';

const StoresPage: React.FC = () => {
  const { setIsLoading } = useAppContext();
  
  // Data State
  const [stores, setStores] = useState<Store[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [storesData, vendorsData] = await Promise.all([
          fetchStores(),
          fetchVendors()
        ]);
        setStores(storesData);
        setVendors(vendorsData);
      } catch (e) {
        console.error("Failed to load directory data", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [setIsLoading]);

  // Filter Logic
  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          store.handle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVendor = selectedVendorId === 'all' || 
                          (store.vendor && String(store.vendor.id) === selectedVendorId);

    return matchesSearch && matchesVendor;
  });

  return (
    <div className="stores-directory-page">
      
      {/* Minimal Header */}
      <div className="directory-minimal-header">
        <div className="header-top-row">
          <div>
            <h1 className="minimal-title">فروشگاه‌ها</h1>
            <p className="minimal-subtitle">کشف بهترین بوتیک‌های مد و فشن</p>
          </div>
          <div className="minimal-search-box">
             <Search size={18} className="search-icon" />
             <input 
               type="text" 
               placeholder="جستجو..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        {/* Categories / Tabs */}
        <div className="minimal-tabs-scroll">
          <button 
            className={`minimal-tab ${selectedVendorId === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedVendorId('all')}
          >
            همه
          </button>
          {vendors.map(vendor => (
            <button
              key={vendor.id}
              className={`minimal-tab ${selectedVendorId === String(vendor.id) ? 'active' : ''}`}
              onClick={() => setSelectedVendorId(String(vendor.id))}
            >
              {vendor.vendor_name}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Grid */}
      <div className="directory-content">
        {filteredStores.length > 0 ? (
          <div className="minimal-stores-grid">
            {filteredStores.map(store => (
              <Link to={`/stores/${store.slug}`} key={store.id} className="minimal-store-card">
                {/* Visual Header */}
                <div className="card-visual">
                  <div 
                    className="visual-cover"
                    style={{ backgroundColor: store.coverColor || '#f1f5f9' }}
                  >
                    {store.coverImage && <img src={store.coverImage} alt="" className="visual-img" loading="lazy" />}
                  </div>
                  <div className="visual-avatar">
                     <img src={store.avatar} alt={store.name} />
                  </div>
                  {store.vendor && (
                    <span className="visual-badge">{store.vendor.vendor_name}</span>
                  )}
                </div>

                {/* Info */}
                <div className="card-info">
                  <div className="info-main">
                    <h3 className="info-name">{store.name}</h3>
                    <span className="info-handle">{store.handle}</span>
                  </div>
                  
                  <div className="info-footer">
                     <span className="info-stats">
                       {store.followers.toLocaleString('fa-IR')} دنبال‌کننده
                     </span>
                     <div className="info-arrow">
                       <ArrowLeft size={16} />
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state-minimal">
            <StoreIcon size={32} className="text-gray-300 mb-2" />
            <p>موردی یافت نشد.</p>
            <button onClick={() => { setSearchTerm(''); setSelectedVendorId('all'); }}>
              پاک کردن فیلترها
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoresPage;
