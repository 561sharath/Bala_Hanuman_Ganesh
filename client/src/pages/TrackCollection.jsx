import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Calendar,
  User,
  Loader2,
  Receipt,
  Edit,
  Trash2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  searchCollectionsByName,
  fetchCollectionsByDate,
  fetchCollectionsByCollector,
  fetchCollectors,
  deleteCollectionRecord,
} from '../services/api';
import { Pagination } from '../components/Pagination';
import { EditCollectionModal } from '../components/EditCollectionModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const TrackCollection = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('name');
  const [nameQuery, setNameQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCollector, setSelectedCollector] = useState('');

  const [records, setRecords] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Modals state
  const [editingRecord, setEditingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadCollectorsList();
  }, []);

  const loadCollectorsList = async () => {
    try {
      const res = await fetchCollectors();
      if (res.success) {
        setCollectors(res.data);
      }
    } catch (err) {
      console.error('Error fetching collectors:', err);
    }
  };

  const loadRecords = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      try {
        let res;
        if (activeTab === 'name') {
          res = await searchCollectionsByName(nameQuery.trim(), currentPage, 20);
        } else if (activeTab === 'date' && selectedDate) {
          res = await fetchCollectionsByDate(selectedDate, currentPage, 20);
        } else if (activeTab === 'collector' && selectedCollector) {
          res = await fetchCollectionsByCollector(selectedCollector, currentPage, 20);
        } else {
          res = await searchCollectionsByName('', currentPage, 20);
        }

        if (res && res.success) {
          setRecords(res.data);
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Error fetching track collections:', err);
      } finally {
        setLoading(false);
      }
    },
    [activeTab, nameQuery, selectedDate, selectedCollector]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadRecords(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [nameQuery, selectedDate, selectedCollector, activeTab, loadRecords]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadRecords(newPage);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setNameQuery('');
    setSelectedDate('');
    setSelectedCollector('');
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRecord) return;
    setDeleteLoading(true);
    try {
      const res = await deleteCollectionRecord(deletingRecord._id);
      if (res.success) {
        showToast(t('toasts.recordDeleted'), 'success');
        setDeletingRecord(null);
        if (records.length === 1 && page > 1) {
          const fallbackPage = page - 1;
          setPage(fallbackPage);
          loadRecords(fallbackPage);
        } else {
          loadRecords(page);
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
      <div className="bg-[#161816]/95 backdrop-blur-xl border border-tertiary/40 rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center gap-4 pb-6 border-b border-outline-variant/30">
          <div className="p-3 rounded-2xl bg-tertiary/20 text-tertiary border border-tertiary/40 shadow-lg">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
              {t('trackCollection.title')}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              {t('trackCollection.subtitle')}
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
            <span>{t('updateEntry.tabs.name')}</span>
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
            <span>{t('updateEntry.tabs.date')}</span>
          </button>

          <button
            onClick={() => handleTabChange('collector')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
              activeTab === 'collector'
                ? 'bg-primary-container text-on-primary-container border-primary shadow-md scale-[1.02]'
                : 'bg-[#212421] text-on-surface-variant border-outline-variant/40 hover:text-on-surface'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('updateEntry.tabs.collector')}</span>
          </button>
        </div>

        {/* Filter Search Inputs */}
        <div className="mt-4">
          {activeTab === 'name' && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
              <input
                type="text"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder={t('updateEntry.searchPlaceholders.name')}
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

          {activeTab === 'collector' && (
            <div className="relative max-w-md">
              <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
              <select
                value={selectedCollector}
                onChange={(e) => setSelectedCollector(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-3 bg-[#212421] border border-tertiary/40 rounded-2xl text-sm text-on-surface focus:outline-none focus:border-tertiary font-bold transition-all shadow-inner cursor-pointer"
              >
                <option value="">{t('updateEntry.searchPlaceholders.collector')}</option>
                {collectors.map((c) => (
                  <option key={c._id} value={c._id} className="bg-[#161816]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Results Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-tertiary">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm font-bold">Loading collection records...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center text-on-surface-variant text-sm font-medium">
            {t('updateEntry.emptyState')}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block mt-6 overflow-x-auto rounded-2xl border border-outline-variant/30">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#212421] text-tertiary font-bold text-xs uppercase tracking-wider border-b border-outline-variant/30">
                    <th className="py-3.5 px-4">{t('updateEntry.table.name')}</th>
                    <th className="py-3.5 px-4">{t('updateEntry.table.amount')}</th>
                    <th className="py-3.5 px-4">{t('updateEntry.table.amountPaid')}</th>
                    <th className="py-3.5 px-4">{t('updateEntry.table.pendingAmount')}</th>
                    <th className="py-3.5 px-4">{t('updateEntry.table.paymentVia')}</th>
                    <th className="py-3.5 px-4">{t('updateEntry.table.status')}</th>
                    <th className="py-3.5 px-4">{t('updateEntry.table.paidTo')}</th>
                    <th className="py-3.5 px-4">{t('updateEntry.table.date')}</th>
                    {isAdmin && <th className="py-3.5 px-4 text-right">{t('updateEntry.table.action')}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 bg-[#191c19]">
                  {records.map((r) => {
                    const formattedDate = new Date(r.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                    });

                    return (
                      <tr key={r._id} className="hover:bg-tertiary/10 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-on-surface">{r.name}</td>
                        <td className="py-3.5 px-4 font-bold text-on-surface">₹{r.amount.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 font-bold text-tertiary">₹{r.amountPaid.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 font-bold text-secondary">₹{r.pendingAmount.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 text-on-surface-variant font-semibold">
                          {r.status === 'Pending' ? '-' : r.paymentVia || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              r.status === 'Paid'
                                ? 'bg-tertiary/20 text-tertiary border border-tertiary/40'
                                : r.status === 'Pending'
                                ? 'bg-secondary/20 text-secondary border border-secondary/40'
                                : 'bg-error-container/60 text-error border border-error/40'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-on-surface font-semibold">{r.paidTo?.name || '-'}</td>
                        <td className="py-3.5 px-4 text-on-surface-variant text-xs">{formattedDate}</td>

                        {/* Admin Only Actions */}
                        {isAdmin && (
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingRecord(r)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-tertiary/20 text-tertiary border border-tertiary/40 hover:bg-tertiary/30 font-bold text-xs transition-all active:scale-95"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>{t('updateEntry.table.edit')}</span>
                              </button>
                              <button
                                onClick={() => setDeletingRecord(r)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-error-container/60 text-error border border-error/40 hover:bg-error/20 font-bold text-xs transition-all active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{t('updateEntry.table.delete')}</span>
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

            {/* Mobile Responsive Cards */}
            <div className="md:hidden mt-6 flex flex-col gap-4">
              {records.map((r) => {
                const formattedDate = new Date(r.date).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                });

                return (
                  <div
                    key={r._id}
                    className="p-4 bg-[#1f221f] border border-outline-variant/30 rounded-2xl shadow-lg flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-outline-variant/20 pb-2.5">
                      <div>
                        <h3 className="font-bold text-base text-on-surface">{r.name}</h3>
                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                          {formattedDate} • Paid To: <span className="text-tertiary font-bold">{r.paidTo?.name || '-'}</span>
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                          r.status === 'Paid'
                            ? 'bg-tertiary/20 text-tertiary border border-tertiary/40'
                            : r.status === 'Pending'
                            ? 'bg-secondary/20 text-secondary border border-secondary/40'
                            : 'bg-error-container/60 text-error border border-error/40'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center bg-[#161816] p-2.5 rounded-xl border border-outline-variant/20">
                      <div>
                        <span className="block text-[10px] text-on-surface-variant uppercase font-bold">Total</span>
                        <span className="text-xs font-bold text-on-surface">₹{r.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-on-surface-variant uppercase font-bold">Paid</span>
                        <span className="text-xs font-bold text-tertiary">₹{r.amountPaid.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-on-surface-variant uppercase font-bold">Pending</span>
                        <span className="text-xs font-bold text-secondary">₹{r.pendingAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="text-on-surface-variant">
                        <span className="font-semibold text-on-surface">Via:</span> {r.status === 'Pending' ? '-' : r.paymentVia || '-'}
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingRecord(r)}
                            className="p-2 rounded-xl bg-tertiary/20 text-tertiary border border-tertiary/40 hover:bg-tertiary/30 transition-all active:scale-95"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingRecord(r)}
                            className="p-2 rounded-xl bg-error-container/60 text-error border border-error/40 hover:bg-error/20 transition-all active:scale-95"
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

            {/* Pagination Component */}
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Edit Collection Modal */}
      <EditCollectionModal
        isOpen={!!editingRecord}
        record={editingRecord}
        onClose={() => setEditingRecord(null)}
        onSuccess={() => loadRecords(page)}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingRecord}
        title={t('deleteModal.confirmTitle')}
        message={t('deleteModal.confirmCollection')}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingRecord(null)}
        loading={deleteLoading}
      />
    </div>
  );
};
