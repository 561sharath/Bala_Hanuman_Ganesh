import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Download,
  ArrowRight,
  Receipt,
  PiggyBank,
  FileCheck2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center py-6">
      
      {/* Hero Centerpiece */}
      <div className="w-full max-w-4xl mx-auto mb-8 p-8 sm:p-12 rounded-3xl bg-[#181a18]/85 backdrop-blur-2xl shadow-2xl border border-tertiary/40 text-center relative overflow-hidden group">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-tertiary/20 via-primary/10 to-transparent blur-xl pointer-events-none" />

        <div className="flex flex-col items-center relative z-10">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-tertiary via-primary to-tertiary shadow-2xl mb-6 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
            <img
              src="/logo.png"
              alt="Sri Bala Hanuman Vinayaka Seva Samithi Emblem"
              className="w-full h-full rounded-full object-cover shadow-md border-2 border-tertiary"
            />
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface tracking-wide leading-tight">
            {t('home.title')}
          </h1>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Track Collection (All Users) */}
        <Link
          to="/track-collection"
          className="group flex flex-col justify-between p-7 rounded-2xl bg-[#181a18]/85 backdrop-blur-xl border border-outline-variant/40 hover:border-tertiary transition-all duration-300 shadow-2xl hover:-translate-y-1 relative overflow-hidden"
        >
          <div>
            <div className="w-13 h-13 p-3 rounded-2xl bg-tertiary/20 border border-tertiary/40 flex items-center justify-center text-tertiary mb-5 group-hover:scale-110 transition-transform">
              <Receipt className="w-7 h-7 text-tertiary" />
            </div>

            <h3 className="font-headline text-2xl font-semibold text-on-surface mb-2 group-hover:text-tertiary transition-colors">
              {t('home.cards.trackCollection.title')}
            </h3>

            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              {t('home.cards.trackCollection.desc')}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-tertiary">
            <span>{t('home.cards.trackCollection.action')}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Track Spendings (All Users / Admin) */}
        <Link
          to="/track-spendings"
          className="group flex flex-col justify-between p-7 rounded-2xl bg-[#181a18]/85 backdrop-blur-xl border border-outline-variant/40 hover:border-tertiary transition-all duration-300 shadow-2xl hover:-translate-y-1 relative overflow-hidden"
        >
          <div>
            <div className="w-13 h-13 p-3 rounded-2xl bg-tertiary/20 border border-tertiary/40 flex items-center justify-center text-tertiary mb-5 group-hover:scale-110 transition-transform">
              <PiggyBank className="w-7 h-7 text-tertiary" />
            </div>

            <h3 className="font-headline text-2xl font-semibold text-on-surface mb-2 group-hover:text-tertiary transition-colors">
              {t('home.cards.trackSpendings.title')}
            </h3>

            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              {t('home.cards.trackSpendings.desc')}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-tertiary">
            <span>{t('home.cards.trackSpendings.action')}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Admin Only Cards */}
        {isAdmin && (
          <>
            {/* Create Entry */}
            <Link
              to="/create"
              className="group flex flex-col justify-between p-7 rounded-2xl bg-[#181a18]/85 backdrop-blur-xl border border-outline-variant/40 hover:border-tertiary transition-all duration-300 shadow-2xl hover:-translate-y-1 relative overflow-hidden"
            >
              <div>
                <div className="w-13 h-13 p-3 rounded-2xl bg-primary-container/40 border border-primary/40 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-7 h-7 text-tertiary" />
                </div>

                <h3 className="font-headline text-2xl font-semibold text-on-surface mb-2 group-hover:text-tertiary transition-colors">
                  {t('home.cards.create.title')}
                </h3>

                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  {t('home.cards.create.desc')}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-tertiary">
                <span>{t('home.cards.create.action')}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Update Entry */}
            <Link
              to="/update"
              className="group flex flex-col justify-between p-7 rounded-2xl bg-[#181a18]/85 backdrop-blur-xl border border-outline-variant/40 hover:border-tertiary transition-all duration-300 shadow-2xl hover:-translate-y-1 relative overflow-hidden"
            >
              <div>
                <div className="w-13 h-13 p-3 rounded-2xl bg-secondary-container/40 border border-secondary/40 flex items-center justify-center text-secondary mb-5 group-hover:scale-110 transition-transform">
                  <Search className="w-7 h-7 text-secondary" />
                </div>

                <h3 className="font-headline text-2xl font-semibold text-on-surface mb-2 group-hover:text-tertiary transition-colors">
                  {t('home.cards.update.title')}
                </h3>

                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  {t('home.cards.update.desc')}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-secondary">
                <span>{t('home.cards.update.action')}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Update Spendings */}
            <Link
              to="/update-spendings"
              className="group flex flex-col justify-between p-7 rounded-2xl bg-[#181a18]/85 backdrop-blur-xl border border-outline-variant/40 hover:border-tertiary transition-all duration-300 shadow-2xl hover:-translate-y-1 relative overflow-hidden"
            >
              <div>
                <div className="w-13 h-13 p-3 rounded-2xl bg-secondary-container/40 border border-secondary/40 flex items-center justify-center text-secondary mb-5 group-hover:scale-110 transition-transform">
                  <FileCheck2 className="w-7 h-7 text-secondary" />
                </div>

                <h3 className="font-headline text-2xl font-semibold text-on-surface mb-2 group-hover:text-tertiary transition-colors">
                  {t('home.cards.updateSpendings.title')}
                </h3>

                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  {t('home.cards.updateSpendings.desc')}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-secondary">
                <span>{t('home.cards.updateSpendings.action')}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Download Sheet */}
            <Link
              to="/download"
              className="group flex flex-col justify-between p-7 rounded-2xl bg-[#181a18]/85 backdrop-blur-xl border border-outline-variant/40 hover:border-tertiary transition-all duration-300 shadow-2xl hover:-translate-y-1 relative overflow-hidden"
            >
              <div>
                <div className="w-13 h-13 p-3 rounded-2xl bg-tertiary-container/40 border border-tertiary/40 flex items-center justify-center text-tertiary mb-5 group-hover:scale-110 transition-transform">
                  <Download className="w-7 h-7 text-tertiary" />
                </div>

                <h3 className="font-headline text-2xl font-semibold text-on-surface mb-2 group-hover:text-tertiary transition-colors">
                  {t('home.cards.download.title')}
                </h3>

                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  {t('home.cards.download.desc')}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-tertiary">
                <span>{t('home.cards.download.action')}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
