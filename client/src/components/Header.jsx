import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, PlusCircle, Search, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

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
          <div className="flex-1 overflow-hidden mx-1 sm:mx-3 max-w-[42vw] sm:max-w-xl relative py-1">
            <div className="whitespace-nowrap font-headline text-xs sm:text-base font-bold tracking-wide text-tertiary">
              <span className="inline-block animate-marquee pl-[100%]">
                {t('header.orgTitle')}
              </span>
            </div>
          </div>

          {/* Right: Language Selector Pill */}
          <div className="flex items-center flex-shrink-0">
            <div className="flex bg-surface-container-high rounded-full p-1 border border-tertiary/40 shadow-inner">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-300 ${
                  language === 'en'
                    ? 'bg-primary-container text-on-primary-container border border-primary/50 shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('te')}
                className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-300 ${
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
            className="relative w-80 max-w-[85vw] bg-[#161816] border-r border-tertiary/50 h-full p-5 sm:p-6 flex flex-col justify-between shadow-2xl z-[101] animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Top Header with Logo & Close Button */}
              <div className="flex items-center justify-between pb-5 border-b border-outline-variant/40 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-11 h-11 rounded-full border-2 border-tertiary shadow-lg flex-shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-headline font-bold text-tertiary uppercase tracking-wider leading-tight">
                      {t('header.orgTitle')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={closeMenu}
                  className="p-2 rounded-xl text-on-surface-variant hover:text-tertiary hover:bg-surface-bright/50 border border-outline-variant/40 transition-colors flex-shrink-0"
                  aria-label="Close Navigation Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Options List */}
              <nav className="flex flex-col gap-3">
                <NavLink
                  to="/create"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all border shadow-md ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container border-primary shadow-xl scale-[1.02]'
                        : 'bg-[#1f221f] text-on-surface border-tertiary/30 hover:border-tertiary hover:bg-tertiary/20'
                    }`
                  }
                >
                  <PlusCircle className="w-5 h-5 text-tertiary flex-shrink-0" />
                  <span>{t('header.menu.createEntry')}</span>
                </NavLink>

                <NavLink
                  to="/update"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all border shadow-md ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container border-primary shadow-xl scale-[1.02]'
                        : 'bg-[#1f221f] text-on-surface border-tertiary/30 hover:border-tertiary hover:bg-tertiary/20'
                    }`
                  }
                >
                  <Search className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span>{t('header.menu.updateEntry')}</span>
                </NavLink>

                <NavLink
                  to="/download"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all border shadow-md ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container border-primary shadow-xl scale-[1.02]'
                        : 'bg-[#1f221f] text-on-surface border-tertiary/30 hover:border-tertiary hover:bg-tertiary/20'
                    }`
                  }
                >
                  <Download className="w-5 h-5 text-tertiary flex-shrink-0" />
                  <span>{t('header.menu.downloadSheet')}</span>
                </NavLink>
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
    </>
  );
};
