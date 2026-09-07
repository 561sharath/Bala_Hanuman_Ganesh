import React, { useState } from 'react';
import { X, Lock, User, Loader2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AdminLoginModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError(t('adminLogin.invalidCredentials'));
      return;
    }

    setLoading(true);
    try {
      const res = await login(username, password);
      if (res.success) {
        showToast(t('toasts.loginSuccess'), 'success');
        setUsername('');
        setPassword('');
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('adminLogin.invalidCredentials');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center p-4 pt-24 pb-12 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md bg-[#161816] border border-tertiary/50 rounded-2xl p-6 shadow-2xl relative my-0 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-tertiary/20 text-tertiary border border-tertiary/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-headline font-bold text-on-surface">
                {t('adminLogin.title')}
              </h3>
              <p className="text-xs text-on-surface-variant">
                {t('adminLogin.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-xl bg-error-container/90 border border-error/60 text-on-error-container text-xs sm:text-sm font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-tertiary">
              {t('adminLogin.username')} <span className="text-error">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('adminLogin.usernamePlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 bg-[#212421] border border-outline-variant/40 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-tertiary">
              {t('adminLogin.password')} <span className="text-error">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('adminLogin.passwordPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 bg-[#212421] border border-outline-variant/40 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface-variant font-bold text-sm hover:bg-surface-bright/40 transition-colors"
            >
              {t('adminLogin.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm hover:bg-primary-container/90 transition-all border border-primary/50 shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('adminLogin.loggingIn')}</span>
                </>
              ) : (
                <span>{t('adminLogin.login')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
