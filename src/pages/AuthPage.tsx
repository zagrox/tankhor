
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { authService } from '../services/authService';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, appConfig } = useAppContext();
  
  // 'login' or 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let user;
      if (mode === 'login') {
        user = await authService.login(email, password);
      } else {
        // Use configured role ID or default
        const roleId = appConfig?.app_user_role;
        user = await authService.register(email, password, firstName, lastName, roleId);
      }
      
      if (user) {
        setUser(user);
        
        // Redirect to profile or previous page
        const from = (location.state as any)?.from?.pathname || '/profile';
        navigate(from, { replace: true });
      } else {
        throw new Error("Authentication successful but user data missing.");
      }

    } catch (err: any) {
      console.error("Auth Error:", err);
      
      // Extract error message safely
      const errorMessage = err?.message || '';
      const directusErrorMsg = err?.errors?.[0]?.message || '';
      const directusErrorCode = err?.errors?.[0]?.code || '';

      if (directusErrorMsg === 'Invalid user credentials.' || errorMessage.includes('Invalid user credentials')) {
         setError('ایمیل یا رمز عبور اشتباه است.');
      } else if (directusErrorCode === 'RECORD_NOT_UNIQUE') {
         setError('این ایمیل قبلاً ثبت شده است.');
      } else if (errorMessage.includes("Cannot use 'in' operator")) {
         setError('خطای داخلی سیستم (API). لطفاً به پشتیبانی اطلاع دهید.');
      } else {
         setError('خطایی رخ داد. لطفاً اتصال اینترنت خود را بررسی کنید.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError(null);
    // Optional: Clear fields or keep them? Keeping them is usually friendlier.
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        
        {/* Back Link */}
        <button className="auth-back-btn" onClick={() => navigate('/')}>
          <ArrowRight size={20} />
          بازگشت به خانه
        </button>

        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">
              {mode === 'login' ? 'ورود به حساب کاربری' : 'عضویت در تن‌خور'}
            </h1>
            <p className="auth-subtitle">
              {mode === 'login' 
                ? 'برای دسترسی به امکانات کامل وارد شوید' 
                : 'به جمع شیک‌پوشان تن‌خور بپیوندید'}
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="auth-tabs">
            <button 
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              ورود
            </button>
            <button 
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >
              ثبت‌نام
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            
            {mode === 'register' && (
              <div className="form-row-split">
                <div className="form-group">
                  <label>نام</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="نام"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>نام خانوادگی</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="نام خانوادگی"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      required 
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label>ایمیل</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>رمز عبور</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input 
                  type="password" 
                  placeholder="حداقل ۸ کاراکتر"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required 
                  minLength={8}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : (mode === 'login' ? 'ورود' : 'ثبت‌نام')}
            </button>
          </form>
          
          {mode === 'login' && (
            <div className="auth-footer-links">
               <button className="forgot-pass-link" type="button" onClick={() => alert('لینک بازیابی رمز عبور به ایمیل شما ارسال شد (نمایشی)')}>
                 رمز عبور خود را فراموش کرده‌اید؟
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
