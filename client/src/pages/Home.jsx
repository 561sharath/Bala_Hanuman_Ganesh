import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Download, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center py-6">

      {/* Hero Centerpiece */}
      <div className="w-full max-w-4xl mx-auto mb-10 p-8 sm:p-12 rounded-3xl bg-[#181a18]/85 backdrop-blur-2xl shadow-2xl border border-tertiary/40 text-center relative overflow-hidden group">

        {/* Subtle top gradient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-tertiary/20 via-primary/10 to-transparent blur-xl pointer-events-none" />

        <div className="flex flex-col items-center relative z-10">

          {/* Official Emblem Logo */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-tertiary via-primary to-tertiary shadow-2xl mb-6 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
            <img
              src="/logo.png"
              alt="Sri Bala Hanuman Vinayaka Seva Samithi Emblem"
              className="w-full h-full rounded-full object-cover shadow-md border-2 border-tertiary"
            />
          </div>

          {/* Sacred Trust Badge */}


          {/* Main Title */}
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface tracking-wide leading-tight">
            {t('home.title')}
          </h1>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">

        {/* Action Card 1: Create Entry */}
        <Link
          to="/create"
          className="group flex flex-col justify-between p-8 rounded-2xl bg-[#181a18]/85 backdrop-blur-xl border border-outline-variant/40 hover:border-tertiary transition-all duration-300 shadow-2xl hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/15 transition-colors" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-primary-container/40 border border-primary/40 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-7 h-7 text-tertiary" />
            </div>

            <h3 className="font-headline text-2xl font-semibold text-on-surface mb-3 group-hover:text-tertiary transition-colors">
              {t('home.cards.create.title')}
            </h3>

            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              {t('home.cards.create.desc')}
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-tertiary">
            <span>{t('home.cards.create.action')}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Action Card 2: Update Entry */}
        <Link
          to="/update"
          className="group flex flex-col justify-between p-8 rounded-2xl bg-[#181a18]/85 backdrop-blur-xl border border-outline-variant/40 hover:border-tertiary transition-all duration-300 shadow-2xl hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/15 transition-colors" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-secondary-container/40 border border-secondary/40 flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
              <Search className="w-7 h-7 text-secondary" />
            </div>

            <h3 className="font-headline text-2xl font-semibold text-on-surface mb-3 group-hover:text-tertiary transition-colors">
              {t('home.cards.update.title')}
            </h3>

            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              {t('home.cards.update.desc')}
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-secondary">
            <span>{t('home.cards.update.action')}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Action Card 3: Download Sheet */}
        <Link
          to="/download"
          className="group flex flex-col justify-between p-8 rounded-2xl bg-[#181a18]/85 backdrop-blur-xl border border-outline-variant/40 hover:border-tertiary transition-all duration-300 shadow-2xl hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full blur-2xl group-hover:bg-tertiary/15 transition-colors" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-tertiary-container/40 border border-tertiary/40 flex items-center justify-center text-tertiary mb-6 group-hover:scale-110 transition-transform">
              <Download className="w-7 h-7 text-tertiary" />
            </div>

            <h3 className="font-headline text-2xl font-semibold text-on-surface mb-3 group-hover:text-tertiary transition-colors">
              {t('home.cards.download.title')}
            </h3>

            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              {t('home.cards.download.desc')}
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-tertiary">
            <span>{t('home.cards.download.action')}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
};
