
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { ArrowRight, ShoppingBag, Truck, Calendar, CreditCard, ChevronDown, Package, AlertCircle } from 'lucide-react';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setIsLoading } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const loadOrders = async () => {
      setLoading(true);
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated, navigate]);

  const toggleExpand = (orderId: number) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'published': return { text: 'تکمیل شده', class: 'status-success' };
      case 'draft': return { text: 'در انتظار پرداخت', class: 'status-pending' };
      case 'archived': return { text: 'لغو شده', class: 'status-cancelled' };
      default: return { text: status, class: 'status-neutral' };
    }
  };

  if (loading) return null; // Global loader handles generic loading

  return (
    <div className="orders-page">
      <div className="orders-container">
        
        {/* Header */}
        <div className="orders-header">
          <button className="back-btn" onClick={() => navigate('/profile')}>
            <ArrowRight size={20} />
            <span>بازگشت به پروفایل</span>
          </button>
          <h1 className="orders-title">سفارش‌های من</h1>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
             <ShoppingBag size={48} className="text-gray-300 mb-4" />
             <h2>هنوز سفارشی ثبت نکرده‌اید</h2>
             <p>محصولات متنوع فروشگاه‌ها را بررسی کنید</p>
             <Link to="/marketplace" className="btn-shop-now">مشاهده فروشگاه</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const status = getStatusLabel(order.status);
              const isExpanded = expandedOrders.includes(order.id);

              return (
                <div key={order.id} className={`order-card ${isExpanded ? 'expanded' : ''}`}>
                  
                  {/* Summary Header (Clickable to toggle) */}
                  <div className="order-summary" onClick={() => toggleExpand(order.id)}>
                    
                    <div className="order-summary-main">
                       <div className="order-header-row">
                         <span className="order-id-badge">سفارش #{order.id}</span>
                         <div className={`status-badge ${status.class}`}>
                           {status.text}
                         </div>
                       </div>
                       
                       <div className="order-sub-row">
                         <span className="meta-item">
                            <Calendar size={14} />
                            {order.date}
                         </span>
                         <span className="meta-divider">•</span>
                         <span className="meta-item text-secondary">
                            {order.total.toLocaleString('fa-IR')} تومان
                         </span>
                         <span className="meta-divider">•</span>
                         <span className="meta-item">
                            {order.items.length} کالا
                         </span>
                       </div>
                    </div>

                    <div className="order-summary-action">
                       <div className={`expand-icon ${isExpanded ? 'open' : ''}`}>
                          <ChevronDown size={20} />
                       </div>
                    </div>

                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="order-details">
                      
                      {/* Store Info Row */}
                      <div className="order-store-header">
                         <span className="store-label">فروشنده:</span>
                         <Link to={`/stores/${order.storeSlug}`} className="store-link">
                            <img src={order.storeLogo} alt="" className="tiny-store-logo" />
                            {order.storeName}
                         </Link>
                      </div>

                      {/* Items List */}
                      <div className="order-items-grid">
                        {order.items.map(item => (
                          <div key={item.id} className="order-item">
                            <img src={item.productImage} alt={item.productName} className="item-img" />
                            <div className="item-info">
                              <h4 className="item-name">{item.productName}</h4>
                              <div className="item-meta">
                                <span>{item.quantity} عدد</span>
                                <span>{item.unitPrice.toLocaleString('fa-IR')} تومان</span>
                              </div>
                            </div>
                            <div className="item-total">
                              {item.totalPrice.toLocaleString('fa-IR')} تومان
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer Info (Tracking) */}
                      <div className="order-footer">
                         <div className="tracking-info">
                           <div className="track-row">
                             <Truck size={18} className="text-secondary" />
                             <span>وضعیت ارسال: {order.trackingCode ? 'ارسال شده' : 'در حال پردازش'}</span>
                           </div>
                           {order.trackingCode && (
                             <div className="track-code-box">
                               <span>کد رهگیری:</span>
                               <span className="code">{order.trackingCode}</span>
                             </div>
                           )}
                         </div>
                         
                         <div className="payment-info">
                            <CreditCard size={18} className="text-secondary" />
                            <span>پرداخت آنلاین (موفق)</span>
                         </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default OrdersPage;
