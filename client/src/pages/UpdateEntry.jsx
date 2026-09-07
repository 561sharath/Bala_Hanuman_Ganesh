import React, { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, UserCheck, Edit3, Trash2, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  searchCollectionsByName,
  fetchCollectionsByDate,
  fetchCollectionsByCollector,
  fetchCollections,
  fetchCollectors,
  deleteCollectionRecord,
} from '../services/api';
import { EditCollectionModal } from '../components/EditCollectionModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Pagination } from '../components/Pagination';

export const UpdateEntry = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('name');
  const [searchName, setSearchName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCollector, setSelectedCollector] = useState('');
  const [collectors, setCollectors] = useState([]);

  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const minDate = `${currentYear}-01-01`;
  const maxDate = `${currentYear}-12-31`;

  useEffect(() => {
    loadCollectors();
  }, []);

  const loadCollectors = async () => {
    try {
      const res = await fetchCollectors();
      if (res.success) setCollectors(res.data);
    } catch (err) {
      console.error('Error fetching collectors:', err);
    }
  };

  const loadRecords = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      setError('');
      try {
        let res;
        if (activeTab === 'name') {
          res = await searchCollectionsByName(searchName.trim(), currentPage, 20);
        } else if (activeTab === 'date' && selectedDate) {
          res = await fetchCollectionsByDate(selectedDate, currentPage, 20);
        } else if (activeTab === 'collector' && selectedCollector) {
          res = await fetchCollectionsByCollector(selectedCollector, currentPage, 20);
        } else {
          res = await fetchCollections(currentPage, 20);
        }

        if (res && res.success) {
          setRecords(res.data);
          setPagination(res.pagination);
        }
      } catch (err) {
        setError(t('toasts.errorOccurred'));
      } finally {
        setLoading(false);
      }
    },
    [activeTab, searchName, selectedDate, selectedCollector]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadRecords(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchName, selectedDate, selectedCollector, activeTab, loadRecords]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadRecords(newPage);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchName('');
    setSelectedDate('');
    setSelectedCollector('');
    setPage(1);
  };

  const openEditModal = (record) => {
    setSelectedRecord(record);
    setIsEditOpen(true);
  };

  const handleEditSuccess = (updatedRecord) => {
    setRecords((prev) =>
      prev.map((item) => (item._id === updatedRecord._id ? updatedRecord : item))
    );
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

  const getStatusBadge = (status) => {
    if (status === 'Paid') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-tertiary/15 text-tertiary border border-tertiary/40 shadow-sm">
          {t('options.paid')}
        </span>
      );
    }
    if (status === 'Balance') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-error-container/60 text-error border border-error/50 shadow-sm">
          {t('options.balance')}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-secondary/20 text-secondary border border-secondary/40 shadow-sm">
        {t('options.pending')}
      </span>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 sm:py-6">
      <div className="bg-[#161816]/90 backdrop-blur-2xl border border-tertiary/40 rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-outline-variant/30 mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-secondary/20 text-secondary shadow-inner flex-shrink-0">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="font-headline text-xl sm:text-3xl font-bold text-on-surface leading-tight">
                {t('updateEntry.title')}
              </h2>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant">
                {t('updateEntry.subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={() => loadRecords(page)}
            className="self-end sm:self-auto px-3.5 py-2 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface-variant hover:text-tertiary transition-all text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search Tab Switcher */}
        <div className="grid grid-cols-3 bg-surface-container-high p-1 sm:p-1.5 rounded-2xl border border-outline-variant/40 mb-5 sm:mb-6 gap-1">
          <button
            onClick={() => handleTabChange('name')}
            className={`py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 ${
              activeTab === 'name'
                ? 'bg-primary-container text-on-primary-container shadow border border-primary/40'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Search className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{t('updateEntry.tabs.name')}</span>
          </button>

          <button
            onClick={() => handleTabChange('date')}
            className={`py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 ${
              activeTab === 'date'
                ? 'bg-primary-container text-on-primary-container shadow border border-primary/40'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{t('updateEntry.tabs.date')}</span>
          </button>

          <button
            onClick={() => handleTabChange('collector')}
            className={`py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 ${
              activeTab === 'collector'
                ? 'bg-primary-container text-on-primary-container shadow border border-primary/40'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{t('updateEntry.tabs.collector')}</span>
          </button>
        </div>

        {/* Search Inputs */}
        {activeTab === 'name' && (
          <div className="mb-5 sm:mb-6 relative">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder={t('updateEntry.searchPlaceholders.name')}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-surface-container-high border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/50 focus:border-tertiary focus:outline-none text-xs sm:text-sm font-medium transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        )}

        {activeTab === 'date' && (
          <div className="mb-5 sm:mb-6 max-w-sm">
            <input
              type="date"
              value={selectedDate}
              min={minDate}
              max={maxDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl bg-surface-container-high border border-outline-variant/40 text-on-surface focus:border-tertiary focus:outline-none text-xs sm:text-sm font-medium transition-all"
            />
          </div>
        )}

        {activeTab === 'collector' && (
          <div className="mb-5 sm:mb-6 max-w-md">
            <select
              value={selectedCollector}
              onChange={(e) => setSelectedCollector(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl bg-surface-container-high border border-outline-variant/40 text-on-surface focus:border-tertiary focus:outline-none text-xs sm:text-sm font-medium transition-all"
            >
              <option value="">{t('updateEntry.searchPlaceholders.collector')} (All)</option>
              {collectors.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="p-3 sm:p-4 mb-5 sm:mb-6 rounded-2xl bg-error-container/90 border border-error/50 text-on-error-container text-xs sm:text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-7 h-7 text-tertiary animate-spin" />
            <span className="text-xs sm:text-sm font-medium text-on-surface-variant">Searching records...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant/70 border border-dashed border-outline-variant/30 rounded-2xl p-6">
            <Search className="w-10 h-10 mx-auto mb-2 text-outline/50" />
            <p className="font-medium text-sm sm:text-base">{t('updateEntry.emptyState')}</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/60">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/80 text-on-surface-variant text-xs uppercase tracking-wider border-b border-outline-variant/30">
                    <th className="p-4">{t('updateEntry.table.name')}</th>
                    <th className="p-4">{t('updateEntry.table.amount')}</th>
                    <th className="p-4">{t('updateEntry.table.amountPaid')}</th>
                    <th className="p-4">{t('updateEntry.table.pendingAmount')}</th>
                    <th className="p-4">{t('updateEntry.table.paymentVia')}</th>
                    <th className="p-4">{t('updateEntry.table.status')}</th>
                    <th className="p-4">{t('updateEntry.table.paidTo')}</th>
                    <th className="p-4">{t('updateEntry.table.date')}</th>
                    <th className="p-4 text-center">{t('updateEntry.table.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-sm">
                  {records.map((item) => (
                    <tr key={item._id} className="hover:bg-surface-bright/30 transition-colors">
                      <td className="p-4 font-semibold text-on-surface">
                        {item.name}
                        {item.nameLanguage === 'TE' && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-tertiary/20 text-tertiary border border-tertiary/30">
                            తెలుగు
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-medium">₹{item.amount.toLocaleString('en-IN')}</td>
                      <td className="p-4 font-semibold text-tertiary">
                        ₹{item.amountPaid.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 font-medium text-error">
                        ₹{item.pendingAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface border border-outline-variant/30">
                          {item.status === 'Pending' ? '-' : item.paymentVia || '-'}
                        </span>
                      </td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4 font-medium text-on-surface-variant">
                        {item.paidTo?.name || '-'}
                      </td>
                      <td className="p-4 text-xs text-on-surface-variant">
                        {new Date(item.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                        })}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-xl bg-primary-container/40 border border-primary/30 text-primary hover:bg-primary hover:text-on-primary transition-all shadow-sm"
                            title={t('updateEntry.table.edit')}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDeletingRecord(item)}
                              className="p-2 rounded-xl bg-error-container/60 border border-error/40 text-error hover:bg-error hover:text-on-error transition-all shadow-sm"
                              title={t('updateEntry.table.delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 gap-3.5 md:hidden">
              {records.map((item) => (
                <div
                  key={item._id}
                  className="p-4 rounded-2xl bg-surface-container-high/90 border border-outline-variant/40 flex flex-col gap-3 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <h4 className="font-bold text-base text-on-surface leading-snug">
                        {item.name}
                      </h4>
                      <span className="text-[11px] text-on-surface-variant font-medium">
                        {new Date(item.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-xl bg-primary-container text-on-primary-container border border-primary/40 hover:bg-primary hover:text-on-primary transition-all text-xs font-bold shadow-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => setDeletingRecord(item)}
                          className="p-2 rounded-xl bg-error-container/60 text-error border border-error/40 hover:bg-error transition-all text-xs font-bold shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 py-2.5 border-y border-outline-variant/20 text-center bg-surface-container-lowest/50 rounded-xl px-2">
                    <div>
                      <span className="text-[10px] uppercase text-on-surface-variant font-bold block">
                        {t('updateEntry.table.amount')}
                      </span>
                      <p className="font-bold text-xs sm:text-sm text-on-surface mt-0.5">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-on-surface-variant font-bold block">
                        {t('updateEntry.table.amountPaid')}
                      </span>
                      <p className="font-bold text-xs sm:text-sm text-tertiary mt-0.5">
                        ₹{item.amountPaid.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-on-surface-variant font-bold block">
                        {t('updateEntry.table.pendingAmount')}
                      </span>
                      <p className="font-bold text-xs sm:text-sm text-error mt-0.5">
                        ₹{item.pendingAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface border border-outline-variant/30 text-[11px] font-semibold">
                        {item.status === 'Pending' ? '-' : item.paymentVia || '-'}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>

                    <span className="text-[11px] text-on-surface-variant font-medium">
                      {t('updateEntry.table.paidTo')}: <strong className="text-on-surface">{item.paidTo?.name || '-'}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Component */}
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <EditCollectionModal
        isOpen={isEditOpen}
        record={selectedRecord}
        onClose={() => setIsEditOpen(false)}
        onSuccess={handleEditSuccess}
      />

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
