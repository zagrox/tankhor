
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { DirectusProfile } from '../types/directus';
import { 
  ArrowRight, 
  Save, 
  User, 
  Smartphone, 
  Calendar, 
  Instagram, 
  Send, 
  Palette, 
  Briefcase, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, isAuthenticated, setIsLoading } = useAppContext();
  
  const [profileId, setProfileId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    type: 'personal',
    gender: 'female',
    mobile: '',
    birthday: '',
    telegram: '',
    instagram: '',
    color: '#FFA439'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Load User Data
        const userData = await authService.getCurrentUser();
        if (userData) {
          // Load Profile Data
          const profileData = await profileService.getMyProfile();
          
          setFormData({
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            username: profileData?.profile_username || '',
            type: profileData?.profile_type || 'personal',
            gender: profileData?.profile_gender || 'female',
            mobile: profileData?.profile_mobile || '',
            birthday: profileData?.profile_birthday || '',
            telegram: profileData?.profile_telegram || '',
            instagram: profileData?.profile_instagram || '',
            color: profileData?.profile_color || '#FFA439'
          });

          if (profileData) {
            setProfileId(profileData.id);
          }
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        setMessage({ type: 'error', text: 'خطا در دریافت اطلاعات کاربری.' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // 1. Update Directus User (First/Last Name)
      const updatedUser = await authService.updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName
      });

      // Update context immediately
      if (user) {
        setUser({ ...user, first_name: formData.firstName, last_name: formData.lastName });
      }

      // 2. Update/Create Profile Item
      const profilePayload: Partial<DirectusProfile> = {
        profile_username: formData.username,
        profile_type: formData.type,
        profile_gender: formData.gender,
        profile_mobile: formData.mobile,
        profile_birthday: formData.birthday || null as any, // Send null if empty
        profile_telegram: formData.telegram,
        profile_instagram: formData.instagram,
        profile_color: formData.color
      };

      if (profileId) {
        await profileService.updateProfile(profileId, profilePayload);
      } else {
        const newProfile = await profileService.createProfile({
            ...profilePayload,
            status: 'published'
        });
        if (newProfile) setProfileId(newProfile.id);
      }

      setMessage({ type: 'success', text: 'تغییرات با موفقیت ذخیره شد.' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);

    } catch (err) {
      console.error("Error saving settings:", err);
      setMessage({ type: 'error', text: 'خطا در ذخیره تغییرات. لطفاً مجددا تلاش کنید.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null; // Or a specific skeleton

  return (
    <div className="settings-page">
      <div className="settings-container">
        
        {/* Header */}
        <div className="settings-header">
          <button className="back-btn" onClick={() => navigate('/profile')}>
            <ArrowRight size={20} />
            <span>بازگشت به پروفایل</span>
          </button>
          <h1 className="settings-title">تنظیمات حساب کاربری</h1>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`message-alert ${message.type}`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="settings-form">
          
          {/* Section: Personal Info */}
          <section className="form-section">
            <h2 className="section-title">
              <User size={20} className="text-secondary" />
              اطلاعات فردی
            </h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label>نام</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="نام خود را وارد کنید"
                />
              </div>

              <div className="form-group">
                <label>نام خانوادگی</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="نام خانوادگی"
                />
              </div>

              <div className="form-group">
                <label>نام نمایشی (نام کاربری)</label>
                <input 
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="نامی که در پروفایل نمایش داده می‌شود"
                />
              </div>

              <div className="form-group">
                <label>شماره موبایل</label>
                <div className="input-with-icon">
                  <Smartphone size={18} />
                  <input 
                    type="tel" 
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="form-input"
                    dir="ltr"
                    placeholder="0912..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>تاریخ تولد</label>
                <div className="input-with-icon">
                  <Calendar size={18} />
                  <input 
                    type="date" 
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section: Type & Gender */}
          <section className="form-section">
            <h2 className="section-title">
              <Briefcase size={20} className="text-secondary" />
              نوع حساب و جنسیت
            </h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label>نوع حساب</label>
                <div className="radio-group">
                  <label className={`radio-card ${formData.type === 'personal' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="type" 
                      value="personal" 
                      checked={formData.type === 'personal'}
                      onChange={() => handleRadioChange('type', 'personal')}
                    />
                    <span>شخصی</span>
                  </label>
                  <label className={`radio-card ${formData.type === 'business' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="type" 
                      value="business" 
                      checked={formData.type === 'business'}
                      onChange={() => handleRadioChange('type', 'business')}
                    />
                    <span>کسب‌وکار</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>جنسیت</label>
                <div className="radio-group">
                  <label className={`radio-card ${formData.gender === 'female' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="gender" 
                      value="female" 
                      checked={formData.gender === 'female'}
                      onChange={() => handleRadioChange('gender', 'female')}
                    />
                    <span>خانم</span>
                  </label>
                  <label className={`radio-card ${formData.gender === 'male' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="gender" 
                      value="male" 
                      checked={formData.gender === 'male'}
                      onChange={() => handleRadioChange('gender', 'male')}
                    />
                    <span>آقا</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Social Media */}
          <section className="form-section">
            <h2 className="section-title">
              <Instagram size={20} className="text-secondary" />
              شبکه‌های اجتماعی
            </h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label>اینستاگرام</label>
                <div className="input-with-icon">
                  <Instagram size={18} />
                  <input 
                    type="text" 
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="form-input"
                    dir="ltr"
                    placeholder="username without @"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>تلگرام</label>
                <div className="input-with-icon">
                  <Send size={18} />
                  <input 
                    type="text" 
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleChange}
                    className="form-input"
                    dir="ltr"
                    placeholder="username without @"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section: Branding */}
          <section className="form-section">
            <h2 className="section-title">
              <Palette size={20} className="text-secondary" />
              ظاهر پروفایل
            </h2>
            
            <div className="form-group">
              <label>رنگ پروفایل</label>
              <div className="color-picker-wrapper">
                <input 
                  type="color" 
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="color-input"
                />
                <span className="color-value">{formData.color}</span>
              </div>
              <p className="helper-text">این رنگ در پس‌زمینه کارت‌های شما نمایش داده می‌شود.</p>
            </div>
          </section>

          {/* Submit Action */}
          <div className="form-actions">
             <button type="submit" className="btn-save" disabled={saving}>
               {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
               <span>ذخیره تغییرات</span>
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
