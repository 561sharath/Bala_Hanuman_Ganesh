import React, { useState, useEffect } from 'react';
import { X, Edit3, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { updateSpendingRecord } from '../services/api';

export const EditSpendingModal = ({ isOpen, spending, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    itemName: '',
    amountSpent: '',
    date: '',
    spentBy: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && spending) {
      const dateObj = spending.date ? new Date(spending.date) : new Date();
      const dateStr = dateObj.toISOString().split('T')[0];
      setFormData({
        itemName: spending.itemName || '',
        amountSpent: spending.amountSpent ?? '',
        date: dateStr,
        spentBy: spending.spentBy || '',
      });
      setError('');
    }
  }, [isOpen, spending]);

  if (!isOpen || !spending) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { itemName, amountSpent, date, spentBy } = formData;

    if (!itemName || itemName.trim() === '') {
      setError(t('validation.itemNameRequired'));
      return;
    }
    if (itemName.trim().length > 100) {
      setError(t('validation.itemNameMax'));
      return;
    }

    const numAmount = Number(amountSpent);
    if (amountSpent === '' || isNaN(numAmount) || numAmount < 0 || numAmount > 100000) {
      setError(t('validation.amountSpentRequired'));
      return;
    }

    if (!spentBy || spentBy.trim() === '') {
      setError(t('validation.spentByRequired'));
      return;
    }
    if (spentBy.trim().length > 70) {
      setError(t('validation.spentByMax'));
      return;
    }

    setLoading(true);
    try {
      const res = await updateSpendingRecord(spending._id, {
        itemName: itemName.trim(),
        amountSpent: numAmount,
        date,
        spentBy: spentBy.trim(),
      });

      if (res.success) {
        showToast(t('toasts.spendingUpdated'), 'success');
        onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('toasts.errorOccurred');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center p-4 pt-24 pb-12 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-[#161816] border border-tertiary/40 rounded-2xl p-6 shadow-2xl relative my-0 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-tertiary/20 text-tertiary border border-tertiary/30">
              <Edit3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-headline font-semibold text-on-surface">
              {t('modals.editSpending.title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-xl bg-error-container/80 border border-error/50 text-on-error-container text-sm">
              {error}
            </div>
          )}

          {/* Item Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              {t('trackSpendings.fields.itemName')} <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#212421] border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:border-tertiary"
              required
            />
          </div>

          {/* Amount Spent */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              {t('trackSpendings.fields.amountSpent')} <span className="text-error">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="100000"
              value={formData.amountSpent}
              onChange={(e) => setFormData({ ...formData, amountSpent: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#212421] border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:border-tertiary"
              required
            />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              {t('trackSpendings.fields.date')} <span className="text-error">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#212421] border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:border-tertiary"
              required
            />
          </div>

          {/* Spent By */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              {t('trackSpendings.fields.spentBy')} <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formData.spentBy}
              onChange={(e) => setFormData({ ...formData, spentBy: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#212421] border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:border-tertiary"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface-variant font-bold text-sm hover:bg-surface-bright/50 transition-colors"
            >
              {t('modals.editSpending.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm hover:bg-primary-container/90 transition-all border border-primary/50 shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('modals.editSpending.saving')}</span>
                </>
              ) : (
                <span>{t('modals.editSpending.save')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
