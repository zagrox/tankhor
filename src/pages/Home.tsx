
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Users, ArrowLeft } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1 className="hero-title">به تن‌خور خوش آمدید</h1>
        <p className="hero-subtitle">
          پلتفرم تخصصی مد و فشن؛ جایی برای دیده شدن و انتخاب بهترین‌ها
        </p>
        
        <div className="hero-actions">
          <Link to="/marketplace" className="hero-btn primary">
            <ShoppingBag size={20} />
            ورود به فروشگاه
          </Link>
          <Link to="/social" className="hero-btn secondary">
            <Users size={20} />
            شبکه اجتماعی
          </Link>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <h3>خرید آسان</h3>
          <p>دسترسی به هزاران محصول از برندهای معتبر با چند کلیک.</p>
        </div>
        <div className="feature-card">
          <h3>تعامل اجتماعی</h3>
          <p>دنبال کردن ترندها و به اشتراک‌گذاری استایل شخصی.</p>
        </div>
        <div className="feature-card">
          <h3>تنوع بی‌نظیر</h3>
          <p>پوشاک، کیف، کفش و اکسسوری برای تمام سلیقه‌ها.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
