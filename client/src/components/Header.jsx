import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  PlusCircle,
  Search,
  Download,
  ShieldCheck,
  LogOut,
  Receipt,
  PiggyBank,
  FileCheck2,
  LogIn
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AdminLoginModal } from './AdminLoginModal';

export const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, logout } = useAuth();
  const { showToast } = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    showToast(t('toasts.logoutSuccess'), 'success');
    closeMenu();
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="fixed top-0 w-full z-40 bg-[#121412]/95 backdrop-blur-xl shadow-2xl border-b border-tertiary/30 text-on-surface">
        <div className="h-16 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
          
          {/* Left: Menu Button & Logo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl text-tertiary hover:text-on-surface hover:bg-surface-bright/50 transition-colors border border-tertiary/30 active:scale-95"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <NavLink to="/" onClick={closeMenu} className="flex items-center gap-2 group flex-shrink-0">
              <img
                src="/logo.png"
                alt="Sri Bala Hanuman Vinayaka Seva Samithi Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-tertiary shadow-md group-hover:scale-105 transition-transform"
              />
            </NavLink>
          </div>

          {/* Center: Marquee Title (Right-to-Left) */}
          <div className="flex-1 overflow-hidden mx-1 sm:mx-3 max-w-[35vw] sm:max-w-xl relative py-1">
            <div className="whitespace-nowrap font-headline text-xs sm:text-base font-bold tracking-wide text-tertiary">
              <span className="inline-block animate-marquee pl-[100%]">
                {t('header.orgTitle')}
              </span>
            </div>
          </div>

          {/* Right Actions: Admin Button & Language Selector */}
          <div className="flex items-center gap-2 flex-shrink-0">
            
            {/* Admin Login / Logout Quick Pill */}
            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-error-container/60 text-error border border-error/40 hover:bg-error/20 transition-all"
                title="Logout Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('header.menu.logout')}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-tertiary/20 text-tertiary border border-tertiary/40 hover:bg-tertiary/30 transition-all active:scale-95"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('header.menu.adminLogin')}</span>
              </button>
            )}

            {/* Language Selector Pill */}
            <div className="flex bg-surface-container-high rounded-full p-0.5 sm:p-1 border border-tertiary/40 shadow-inner">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-300 ${
                  language === 'en'
                    ? 'bg-primary-container text-on-primary-container border border-primary/50 shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('te')}
                className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-300 ${
                  language === 'te'
                    ? 'bg-primary-container text-on-primary-container border border-primary/50 shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                తెలుగు
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full Viewport High-Contrast Side Navigation Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          
          {/* Dark Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
            onClick={closeMenu}
          />

          {/* Solid Drawer Panel */}
          <aside
            className="relative w-80 max-w-[85vw] bg-[#161816] border-r border-tertiary/50 h-full p-5 sm:p-6 flex flex-col justify-between shadow-2xl z-[101] animate-in slide-in-from-left duration-300 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Top Header with Logo & Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40 mb-5">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-10 h-10 rounded-full border-2 border-tertiary shadow-lg flex-shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-headline font-bold text-tertiary uppercase tracking-wider leading-tight">
                      {t('header.orgTitle')}
                    </span>
                    {isAdmin && (
                      <span className="text-[10px] text-tertiary/80 font-semibold uppercase tracking-wider">
                        Role: Admin ({user?.username})
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={closeMenu}
                  className="p-1.5 rounded-xl text-on-surface-variant hover:text-tertiary hover:bg-surface-bright/50 border border-outline-variant/40 transition-colors flex-shrink-0"
                  aria-label="Close Navigation Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Options List */}
              <nav className="flex flex-col gap-2.5">
                
                {/* Admin Only: Create Entry */}
                {isAdmin && (
                  <NavLink
                    to="/create"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all border shadow-md ${
                        isActive
                          ? 'bg-primary-container text-on-primary-container border-primary shadow-xl scale-[1.02]'
                          : 'bg-[#1f221f] text-on-surface border-tertiary/30 hover:border-tertiary hover:bg-tertiary/20'
                      }`
                    }
                  >
                    <PlusCircle className="w-5 h-5 text-tertiary flex-shrink-0" />
                    <span>{t('header.menu.createEntry')}</span>
                  </NavLink>
                )}

                {/* Admin Only: Update Entry */}
                {isAdmin && (
                  <NavLink
                    to="/update"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all border shadow-md ${
                        isActive
                          ? 'bg-primary-container text-on-primary-container border-primary shadow-xl scale-[1.02]'
                          : 'bg-[#1f221f] text-on-surface border-tertiary/30 hover:border-tertiary hover:bg-tertiary/20'
                      }`
                    }
                  >
                    <Search className="w-5 h-5 text-secondary flex-shrink-0" />
                    <span>{t('header.menu.updateEntry')}</span>
                  </NavLink>
                )}

                {/* All Users: Track Collection */}
                <NavLink
                  to="/track-collection"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all border shadow-md ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container border-primary shadow-xl scale-[1.02]'
                        : 'bg-[#1f221f] text-on-surface border-tertiary/30 hover:border-tertiary hover:bg-tertiary/20'
                    }`
                  }
                >
                  <Receipt className="w-5 h-5 text-tertiary flex-shrink-0" />
                  <span>{t('header.menu.trackCollection')}</span>
                </NavLink>

                {/* All Users: Track Spendings */}
                <NavLink
                  to="/track-spendings"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all border shadow-md ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container border-primary shadow-xl scale-[1.02]'
                        : 'bg-[#1f221f] text-on-surface border-tertiary/30 hover:border-tertiary hover:bg-tertiary/20'
                    }`
                  }
                >
                  <PiggyBank className="w-5 h-5 text-tertiary flex-shrink-0" />
                  <span>{t('header.menu.trackSpendings')}</span>
                </NavLink>

                {/* Admin Only: Update Spendings */}
                {isAdmin && (
                  <NavLink
                    to="/update-spendings"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all border shadow-md ${
                        isActive
                          ? 'bg-primary-container text-on-primary-container border-primary shadow-xl scale-[1.02]'
                          : 'bg-[#1f221f] text-on-surface border-tertiary/30 hover:border-tertiary hover:bg-tertiary/20'
                      }`
                    }
                  >
                    <FileCheck2 className="w-5 h-5 text-secondary flex-shrink-0" />
                    <span>{t('header.menu.updateSpendings')}</span>
                  </NavLink>
                )}

                {/* Admin Only: Download Sheet */}
                {isAdmin && (
                  <NavLink
                    to="/download"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all border shadow-md ${
                        isActive
                          ? 'bg-primary-container text-on-primary-container border-primary shadow-xl scale-[1.02]'
                          : 'bg-[#1f221f] text-on-surface border-tertiary/30 hover:border-tertiary hover:bg-tertiary/20'
                      }`
                    }
                  >
                    <Download className="w-5 h-5 text-tertiary flex-shrink-0" />
                    <span>{t('header.menu.downloadSheet')}</span>
                  </NavLink>
                )}

                {/* Admin Auth Toggle Button inside Mobile Drawer */}
                <div className="pt-3 border-t border-outline-variant/30 mt-2">
                  {isAdmin ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm bg-error-container/80 text-error border border-error/50 hover:bg-error/20 transition-all shadow-md active:scale-95"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('header.menu.logout')} ({user?.username})</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        closeMenu();
                        setIsAdminModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm bg-tertiary/20 text-tertiary border border-tertiary/50 hover:bg-tertiary/30 transition-all shadow-md active:scale-95"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{t('header.menu.adminLogin')}</span>
                    </button>
                  )}
                </div>
              </nav>
            </div>

            {/* Bottom Drawer Footer */}
            <div className="pt-4 border-t border-outline-variant/30 text-center">
              <p className="text-[11px] text-on-surface-variant font-medium">
                © {new Date().getFullYear()} Sri Bala Hanuman Vinayaka Seva Samithi
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </>
  );
};
