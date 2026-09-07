import React, { useState, useEffect, useCallback } from 'react';
import { PiggyBank, Loader2, Calendar, Save, Search, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createSpendingRecord, fetchSpendings } from '../services/api';
import { Pagination } from '../components/Pagination';

export const TrackSpendings = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  // Admin Form State
  const [formData, setFormData] = useState({
    itemName: '',
    amountSpent: '',
    date: getTodayStr(),
    spentBy: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Normal User View / Read-only Search State
  const [activeTab, setActiveTab] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [spentByQuery, setSpentByQuery] = useState('');

  const [spendings, setSpendings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [page, setPage] = useState(1);

  const loadSpendingsList = useCallback(
    async (currentPage = 1) => {
      setListLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 20,
        };

        if (activeTab === 'name' && searchQuery.trim()) {
          params.q = searchQuery.trim();
        } else if (activeTab === 'date' && selectedDate) {
          params.date = selectedDate;
        } else if (activeTab === 'spentBy' && spentByQuery.trim()) {
          params.spentBy = spentByQuery.trim();
        }

        const res = await fetchSpendings(params);
        if (res.success) {
          setSpendings(res.data);
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Error fetching spendings list:', err);
      } finally {
        setListLoading(false);
      }
    },
    [activeTab, searchQuery, selectedDate, spentByQuery]
  );

  useEffect(() => {
    if (!isAdmin) {
      const timer = setTimeout(() => {
        setPage(1);
        loadSpendingsList(1);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isAdmin, searchQuery, selectedDate, spentByQuery, activeTab, loadSpendingsList]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadSpendingsList(newPage);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSelectedDate('');
    setSpentByQuery('');
    setPage(1);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const { itemName, amountSpent, date, spentBy } = formData;

    if (!itemName || itemName.trim() === '') {
      setFormError(t('validation.itemNameRequired'));
      return;
    }
    if (itemName.trim().length > 100) {
      setFormError(t('validation.itemNameMax'));
      return;
    }

    const numAmount = Number(amountSpent);
    if (amountSpent === '' || isNaN(numAmount) || numAmount < 0 || numAmount > 100000) {
      setFormError(t('validation.amountSpentRequired'));
      return;
    }

    if (!spentBy || spentBy.trim() === '') {
      setFormError(t('validation.spentByRequired'));
      return;
    }
    if (spentBy.trim().length > 70) {
      setFormError(t('validation.spentByMax'));
      return;
    }

    setFormLoading(true);
    try {
      const res = await createSpendingRecord({
        itemName: itemName.trim(),
        amountSpent: numAmount,
        date,
        spentBy: spentBy.trim(),
      });

      if (res.success) {
        showToast(t('toasts.spendingSaved'), 'success');
        setFormData({
          itemName: '',
          amountSpent: '',
          date: getTodayStr(),
          spentBy: '',
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('toasts.errorOccurred');
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // Render Admin Create Spending Form
  if (isAdmin) {
    return (
      <div className="w-full max-w-3xl mx-auto py-4 sm:py-8">
        <div className="bg-[#161816]/95 backdrop-blur-xl border border-tertiary/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-tertiary via-primary-container to-secondary" />

          {/* Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-outline-variant/30">
            <div className="p-3 rounded-2xl bg-tertiary/20 text-tertiary border border-tertiary/40 shadow-lg">
              <PiggyBank className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
                {t('trackSpendings.title')}
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                {t('trackSpendings.subtitle')}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="mt-6 flex flex-col gap-5">
            {formError && (
              <div className="p-4 rounded-2xl bg-error-container/90 border border-error/50 text-on-error-container text-sm font-medium animate-in fade-in">
                {formError}
              </div>
            )}

            {/* Item Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-tertiary">
                {t('trackSpendings.fields.itemName')} <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                placeholder={t('trackSpendings.fields.itemNamePlaceholder')}
                maxLength={100}
                className="w-full px-4 py-3 bg-[#212421] border border-outline-variant/40 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary font-bold transition-all"
                required
              />
            </div>

            {/* Amount Spent */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-tertiary">
                {t('trackSpendings.fields.amountSpent')} <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-tertiary text-base">₹</span>
                <input
                  type="number"
                  min="0"
                  max="100000"
                  value={formData.amountSpent}
                  onChange={(e) => setFormData({ ...formData, amountSpent: e.target.value })}
                  placeholder={t('trackSpendings.fields.amountSpentPlaceholder')}
                  className="w-full pl-9 pr-4 py-3 bg-[#212421] border border-outline-variant/40 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary font-bold transition-all"
                  required
                />
              </div>
            </div>

            {/* Date (Today - Readonly) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-tertiary">
                {t('trackSpendings.fields.date')} <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="date"
                  value={formData.date}
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-[#212421] border border-outline-variant/30 rounded-2xl text-sm text-on-surface-variant font-bold cursor-not-allowed opacity-75"
                />
              </div>
            </div>

            {/* Spent By */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-tertiary">
                {t('trackSpendings.fields.spentBy')} <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.spentBy}
                onChange={(e) => setFormData({ ...formData, spentBy: e.target.value })}
                placeholder={t('trackSpendings.fields.spentByPlaceholder')}
                maxLength={70}
                className="w-full px-4 py-3 bg-[#212421] border border-outline-variant/40 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary font-bold transition-all"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-4 rounded-2xl bg-primary-container text-on-primary-container font-bold text-base hover:bg-primary-container/90 transition-all border border-primary/50 shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('trackSpendings.buttons.saving')}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{t('trackSpendings.buttons.save')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render Normal User Read-Only Track Spendings Page (No edit, no delete, titled "Track Spendings")
  return (
    <div className="w-full max-w-6xl mx-auto py-4 sm:py-8">
      <div className="bg-[#161816]/95 backdrop-blur-xl border border-tertiary/40 rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center gap-4 pb-6 border-b border-outline-variant/30">
          <div className="p-3 rounded-2xl bg-tertiary/20 text-tertiary border border-tertiary/40 shadow-lg">
            <PiggyBank className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
              {t('trackSpendings.title')}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              View and track all Samithi spending records
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-outline-variant/30 pb-4">
          <button
            onClick={() => handleTabChange('name')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
              activeTab === 'name'
                ? 'bg-primary-container text-on-primary-container border-primary shadow-md scale-[1.02]'
                : 'bg-[#212421] text-on-surface-variant border-outline-variant/40 hover:text-on-surface'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>{t('updateSpendings.tabs.name')}</span>
          </button>

          <button
            onClick={() => handleTabChange('date')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
              activeTab === 'date'
                ? 'bg-primary-container text-on-primary-container border-primary shadow-md scale-[1.02]'
                : 'bg-[#212421] text-on-surface-variant border-outline-variant/40 hover:text-on-surface'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t('updateSpendings.tabs.date')}</span>
          </button>

          <button
            onClick={() => handleTabChange('spentBy')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
              activeTab === 'spentBy'
                ? 'bg-primary-container text-on-primary-container border-primary shadow-md scale-[1.02]'
                : 'bg-[#212421] text-on-surface-variant border-outline-variant/40 hover:text-on-surface'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('updateSpendings.tabs.spentBy')}</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="mt-4">
          {activeTab === 'name' && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('updateSpendings.searchPlaceholders.name')}
                className="w-full pl-10 pr-4 py-3 bg-[#212421] border border-tertiary/40 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary font-bold transition-all shadow-inner"
              />
            </div>
          )}

          {activeTab === 'date' && (
            <div className="relative max-w-sm">
              <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#212421] border border-tertiary/40 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-tertiary font-bold transition-all shadow-inner"
              />
            </div>
          )}

          {activeTab === 'spentBy' && (
            <div className="relative">
              <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
              <input
                type="text"
                value={spentByQuery}
                onChange={(e) => setSpentByQuery(e.target.value)}
                placeholder={t('updateSpendings.searchPlaceholders.spentBy')}
                className="w-full pl-10 pr-4 py-3 bg-[#212421] border border-tertiary/40 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary font-bold transition-all shadow-inner"
              />
            </div>
          )}
        </div>

        {/* Results Area */}
        {listLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-tertiary">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm font-bold">Loading spending records...</span>
          </div>
        ) : spendings.length === 0 ? (
          <div className="py-16 text-center text-on-surface-variant text-sm font-medium">
            {t('updateSpendings.emptyState')}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block mt-6 overflow-x-auto rounded-2xl border border-outline-variant/30">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#212421] text-tertiary font-bold text-xs uppercase tracking-wider border-b border-outline-variant/30">
                    <th className="py-3.5 px-4">{t('updateSpendings.table.itemName')}</th>
                    <th className="py-3.5 px-4">{t('updateSpendings.table.amountSpent')}</th>
                    <th className="py-3.5 px-4">{t('updateSpendings.table.date')}</th>
                    <th className="py-3.5 px-4">{t('updateSpendings.table.spentBy')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 bg-[#191c19]">
                  {spendings.map((s) => {
                    const formattedDate = new Date(s.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                    });

                    return (
                      <tr key={s._id} className="hover:bg-tertiary/10 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-on-surface">{s.itemName}</td>
                        <td className="py-3.5 px-4 font-bold text-tertiary">₹{s.amountSpent.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 text-on-surface-variant font-medium">{formattedDate}</td>
                        <td className="py-3.5 px-4 text-on-surface font-semibold">{s.spentBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards View */}
            <div className="md:hidden mt-6 flex flex-col gap-4">
              {spendings.map((s) => {
                const formattedDate = new Date(s.date).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                });

                return (
                  <div
                    key={s._id}
                    className="p-4 bg-[#1f221f] border border-outline-variant/30 rounded-2xl shadow-lg flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-outline-variant/20 pb-2.5">
                      <div>
                        <h3 className="font-bold text-base text-on-surface">{s.itemName}</h3>
                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                          {formattedDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-tertiary">
                          ₹{s.amountSpent.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-on-surface-variant pt-1">
                      <span className="font-semibold text-on-surface">{t('trackSpendings.fields.spentBy')}:</span> {s.spentBy}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reusable Server-side Pagination Bar */}
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};
