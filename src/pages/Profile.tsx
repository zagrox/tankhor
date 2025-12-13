
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { LogOut, User, Settings, Heart, ShoppingBag, MapPin } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const displayName = user.first_name || user.last_name 
    ? `${user.first_name} ${user.last_name}`.trim() 
    : user.email.split('@')[0];

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        {/* Profile Header */}
        <div className="profile-card header-card">
          <div className="profile-avatar-wrapper">
             {user.avatar ? (
               <img src={user.avatar} alt="Profile" className="profile-img" />
             ) : (
               <div className="profile-img-placeholder">
                 <User size={48} />
               </div>
             )}
          </div>
          <div className="profile-info">
            <h1 className="user-name">{displayName}</h1>
            <p className="user-email">{user.email}</p>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="خروج">
            <LogOut size={20} />
            <span>خروج</span>
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
           
           <div className="dash-card">
             <div className="dash-icon"><Heart size={24} className="text-red-500" /></div>
             <h3>علاقه‌مندی‌ها</h3>
             <p>لیست محصولات و فروشگاه‌های مورد علاقه شما</p>
           </div>

           <div className="dash-card">
             <div className="dash-icon"><ShoppingBag size={24} className="text-secondary" /></div>
             <h3>سفارش‌های من</h3>
             <p>پیگیری سفارشات جاری و تاریخچه خریدها</p>
           </div>

           <div className="dash-card">
             <div className="dash-icon"><MapPin size={24} className="text-blue-500" /></div>
             <h3>آدرس‌ها</h3>
             <p>مدیریت آدرس‌های ارسال سفارش</p>
           </div>

           <div 
             className="dash-card" 
             onClick={() => navigate('/settings')}
           >
             <div className="dash-icon"><Settings size={24} className="text-gray-500" /></div>
             <h3>تنظیمات حساب</h3>
             <p>ویرایش اطلاعات شخصی و تغییر رمز عبور</p>
           </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
