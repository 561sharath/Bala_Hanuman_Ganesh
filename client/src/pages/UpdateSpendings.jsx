import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Calendar,
  User,
  Edit,
  Trash2,
  Loader2,
  FileCheck2,
  Wallet
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchSpendings, deleteSpendingRecord } from '../services/api';
import { Pagination } from '../components/Pagination';
import { EditSpendingModal } from '../components/EditSpendingModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const UpdateSpendings = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [spentByQuery, setSpentByQuery] = useState('');

  const [spendings, setSpendings] = useState([]);
  const [summary, setSummary] = useState({ totalSpendings: 0 });
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Modals state
  const [editingSpending, setEditingSpending] = useState(null);
  const [deletingSpending, setDeletingSpending] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadSpendings = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
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
          if (res.summary) {
            setSummary(res.summary);
          }
        }
      } catch (err) {
        console.error('Error loading spendings:', err);
      } finally {
        setLoading(false);
      }
    },
    [activeTab, searchQuery, selectedDate, spentByQuery]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadSpendings(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, spentByQuery, selectedDate, activeTab, loadSpendings]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadSpendings(newPage);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSelectedDate('');
    setSpentByQuery('');
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSpending) return;
    setDeleteLoading(true);
    try {
      const res = await deleteSpendingRecord(deletingSpending._id);
      if (res.success) {
        showToast(t('toasts.spendingDeleted'), 'success');
        setDeletingSpending(null);
        if (spendings.length === 1 && page > 1) {
          const fallbackPage = page - 1;
          setPage(fallbackPage);
          loadSpendings(fallbackPage);
        } else {
          loadSpendings(page);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('toasts.errorOccurred');
      showToast(msg, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 sm:py-8">
      
      {/* Top Total Spendings Summary Card */}
      <div className="mb-6">
        <div className="bg-[#181b18]/90 backdrop-blur-xl border border-tertiary/40 rounded-2xl p-5 shadow-xl flex items-center justify-between max-w-md">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">
              Total Spendings Amount
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-tertiary mt-1">
              ₹{summary.totalSpendings.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-tertiary/20 text-tertiary border border-tertiary/40">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Outer Card */}
      <div className="bg-[#161816]/95 backdrop-blur-xl border border-tertiary/40 rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Header Bar */}
        <div className="flex items-center gap-4 pb-6 border-b border-outline-variant/30">
          <div className="p-3 rounded-2xl bg-tertiary/20 text-tertiary border border-tertiary/40 shadow-lg">
            <FileCheck2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
              {t('updateSpendings.title')}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              {t('updateSpendings.subtitle')}
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

        {/* Search Controls Bar */}
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

        {/* Content Area */}
        {loading ? (
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
                    {isAdmin && <th className="py-3.5 px-4 text-right">{t('updateSpendings.table.action')}</th>}
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
                        {isAdmin && (
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingSpending(s)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-tertiary/20 text-tertiary border border-tertiary/40 hover:bg-tertiary/30 font-bold text-xs transition-all active:scale-95"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>{t('updateSpendings.table.edit')}</span>
                              </button>
                              <button
                                onClick={() => setDeletingSpending(s)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-error-container/60 text-error border border-error/40 hover:bg-error/20 font-bold text-xs transition-all active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{t('updateSpendings.table.delete')}</span>
                              </button>
                            </div>
                          </td>
                        )}
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

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="text-on-surface-variant">
                        <span className="font-semibold text-on-surface">{t('trackSpendings.fields.spentBy')}:</span> {s.spentBy}
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingSpending(s)}
                            className="p-2 rounded-xl bg-tertiary/20 text-tertiary border border-tertiary/40 hover:bg-tertiary/30 transition-all active:scale-95"
                            aria-label="Edit Spending"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingSpending(s)}
                            className="p-2 rounded-xl bg-error-container/60 text-error border border-error/40 hover:bg-error/20 transition-all active:scale-95"
                            aria-label="Delete Spending"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
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

      {/* Edit Spending Modal */}
      <EditSpendingModal
        isOpen={!!editingSpending}
        spending={editingSpending}
        onClose={() => setEditingSpending(null)}
        onSuccess={() => loadSpendings(page)}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingSpending}
        title={t('deleteModal.confirmTitle')}
        message={t('deleteModal.confirmSpending')}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingSpending(null)}
        loading={deleteLoading}
      />
    </div>
  );
};
