import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../constants';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';

// Simulating a Cart Item type extending the Product type
interface CartItem {
  productId: string;
  quantity: number;
}

const Cart: React.FC = () => {
  // Initialize with some mock data from constants
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { productId: 'p1', quantity: 1 },
    { productId: 'p2', quantity: 2 },
    { productId: 'p4', quantity: 1 },
  ]);

  // Helper to get product details
  const getProduct = (id: string) => MOCK_PRODUCTS.find(p => p.id === id);

  // Handlers
  const handleQuantityChange = (id: string, change: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.productId === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const handleRemove = (id: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== id));
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const product = getProduct(item.productId);
    return acc + (product ? product.price * item.quantity : 0);
  }, 0);

  const shippingCost = subtotal > 5000000 ? 0 : 45000; // Free shipping over 5M
  const total = subtotal + shippingCost;

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-state">
        <div className="empty-icon-box">
          <ShoppingBag size={48} />
        </div>
        <h2>سبد خرید شما خالی است!</h2>
        <p>به نظر می‌رسد هنوز محصولی را انتخاب نکرده‌اید.</p>
        <Link to="/marketplace" className="btn-start-shopping">
          مشاهده فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1 className="cart-title">سبد خرید</h1>
        <span className="cart-count">{cartItems.length} کالا</span>
      </div>

      <div className="cart-layout">
        
        {/* Cart Items List */}
        <div className="cart-items-column">
          {cartItems.map(item => {
            const product = getProduct(item.productId);
            if (!product) return null;

            return (
              <div key={item.productId} className="cart-item-card">
                <Link to={`/product/${product.id}`} className="cart-item-image">
                  <img src={product.image} alt={product.name} />
                </Link>
                
                <div className="cart-item-details">
                  <div className="cart-item-info">
                    <Link to={`/product/${product.id}`}>
                      <h3>{product.name}</h3>
                    </Link>
                    {/* FIX: Render the `category_title` property of the `product.category` object, not the object itself. */}
                    <span className="text-sm text-gray-500">{product.category?.category_title}</span>
                    <div className="trust-badge-mini">
                      <ShieldCheck size={14} className="text-green-500" />
                      <span>گارانتی اصالت و سلامت</span>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button 
                        onClick={() => handleQuantityChange(item.productId, 1)}
                        className="qty-btn"
                      >
                        <Plus size={16} />
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.productId, -1)}
                        className="qty-btn"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                    </div>

                    <div className="price-section">
                      <span className="item-total-price">
                        {(product.price * item.quantity).toLocaleString('fa-IR')}
                        <span className="currency"> تومان</span>
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleRemove(item.productId)}
                    className="remove-btn"
                    title="حذف از سبد"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Sidebar */}
        <aside className="cart-summary-column">
          <div className="summary-card">
            <h2 className="summary-title">خلاصه سفارش</h2>
            
            <div className="summary-row">
              <span>قیمت کالاها ({cartItems.length})</span>
              <span>{subtotal.toLocaleString('fa-IR')} تومان</span>
            </div>
            
            <div className="summary-row">
              <span>هزینه ارسال</span>
              {shippingCost === 0 ? (
                <span className="text-green-500">رایگان</span>
              ) : (
                <span>{shippingCost.toLocaleString('fa-IR')} تومان</span>
              )}
            </div>

            <div className="divider"></div>

            <div className="summary-total">
              <span>جمع سبد خرید</span>
              <span className="total-amount">{total.toLocaleString('fa-IR')} تومان</span>
            </div>

            <p className="summary-note">
              هزینه ارسال بر اساس آدرس، زمان تحویل و وزن مرسوله محاسبه می‌شود.
            </p>

            <button className="checkout-btn">
              ادامه فرآیند خرید
              <ArrowRight size={20} className="rtl-flip" />
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default Cart;