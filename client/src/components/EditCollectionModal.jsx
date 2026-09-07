import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Loader2,
  CheckCircle2,
  Clock,
  Scale,
  Smartphone,
  Banknote,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { updateCollectionRecord, fetchCollectors } from '../services/api';
import { AddCollectorModal } from './AddCollectorModal';

export const EditCollectionModal = ({ isOpen, record, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    nameLanguage: 'EN',
    amount: '',
    amountPaid: '',
    pendingAmount: 0,
    paymentVia: 'UPI',
    status: 'Paid',
    paidTo: '',
  });

  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAddCollectorOpen, setIsAddCollectorOpen] = useState(false);

  useEffect(() => {
    if (isOpen && record) {
      setFormData({
        name: record.name || '',
        nameLanguage: record.nameLanguage || 'EN',
        amount: record.amount ?? '',
        amountPaid: record.amountPaid ?? '',
        pendingAmount: record.pendingAmount ?? 0,
        paymentVia: record.paymentVia || 'UPI',
        status: record.status || 'Paid',
        paidTo: record.paidTo?._id || record.paidTo || '',
      });
      loadCollectors();
    }
  }, [isOpen, record]);

  const loadCollectors = async () => {
    try {
      const res = await fetchCollectors();
      if (res.success) {
        setCollectors(res.data);
      }
    } catch (err) {
      console.error('Error loading collectors:', err);
    }
  };

  if (!isOpen || !record) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === 'amount') {
        const numAmt = value === '' ? 0 : Number(value);
        if (prev.status === 'Paid') {
          updated.amountPaid = value;
          updated.pendingAmount = 0;
        } else {
          const numPd = prev.amountPaid === '' ? 0 : Number(prev.amountPaid);
          updated.pendingAmount = Math.max(0, numAmt - numPd);
        }
      } else if (field === 'amountPaid') {
        const numAmt = prev.amount === '' ? 0 : Number(prev.amount);
        const numPd = value === '' ? 0 : Number(value);
        updated.pendingAmount = Math.max(0, numAmt - numPd);

        if (numPd < numAmt && prev.status === 'Paid') {
          updated.status = 'Balance';
        } else if (numPd >= numAmt && numAmt > 0) {
          updated.status = 'Paid';
        }
      } else if (field === 'status') {
        if (value === 'Paid') {
          updated.amountPaid = prev.amount;
          updated.pendingAmount = 0;
        } else {
          const numAmt = prev.amount === '' ? 0 : Number(prev.amount);
          const numPd = prev.amountPaid === '' ? 0 : Number(prev.amountPaid);
          updated.pendingAmount = Math.max(0, numAmt - numPd);
        }
      }

      return updated;
    });
  };

  const handleCollectorChange = (e) => {
    const val = e.target.value;
    if (val === 'ADD_NEW') {
      setIsAddCollectorOpen(true);
    } else {
      handleChange('paidTo', val);
    }
  };

  const handleCollectorAdded = (newCollector) => {
    setCollectors((prev) => [...prev, newCollector]);
    handleChange('paidTo', newCollector._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, amount, amountPaid, paymentVia, status, paidTo } = formData;

    if (!name || name.trim() === '') {
      setError(t('validation.nameRequired'));
      return;
    }
    if (name.trim().length > 70) {
      setError(t('validation.nameMax'));
      return;
    }

    const numAmount = Number(amount);
    if (amount === '' || isNaN(numAmount) || numAmount < 0 || numAmount > 100000) {
      setError(t('validation.amountRequired'));
      return;
    }

    const numPaid = Number(amountPaid);
    if (amountPaid === '' || isNaN(numPaid) || numPaid < 0 || numPaid > 100000) {
      setError(t('validation.amountPaidRequired'));
      return;
    }

    if (numPaid > numAmount) {
      setError(t('validation.amountPaidMax'));
      return;
    }

    if (!paidTo) {
      setError(t('validation.paidToRequired'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: numAmount,
        amountPaid: numPaid,
        pendingAmount: Math.max(0, numAmount - numPaid),
      };

      const res = await updateCollectionRecord(record._id, payload);
      if (res.success) {
        showToast(t('toasts.recordUpdated'), 'success');
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

  const formattedDate = record.date
    ? new Date(record.date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      })
    : '';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-md overflow-y-auto">
        <div className="w-full max-w-lg bg-[#161816] border border-tertiary/40 rounded-2xl p-6 shadow-2xl relative my-8">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-tertiary/20 text-tertiary">
                <Edit3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-headline font-semibold text-on-surface">
                {t('modals.editRecord.title')}
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

            {/* Date (Read-only) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                {t('createEntry.fields.date')}
              </label>
              <input
                type="text"
                value={formattedDate}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20 text-on-surface-variant cursor-not-allowed text-sm"
              />
            </div>

            {/* Donor Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                {t('createEntry.fields.name')} <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                maxLength={70}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1f221f] border border-tertiary/30 text-on-surface focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary text-sm"
              />
            </div>

            {/* Amount & Amount Paid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  {t('createEntry.fields.amount')} <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  min={0}
                  max={100000}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1f221f] border border-tertiary/30 text-on-surface focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  {t('createEntry.fields.amountPaid')} <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  value={formData.amountPaid}
                  onChange={(e) => handleChange('amountPaid', e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  min={0}
                  max={100000}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1f221f] border border-tertiary/30 text-on-surface focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary text-sm"
                />
              </div>
            </div>

            {/* Pending Amount (Calculated Read-only) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                {t('createEntry.fields.pendingAmount')}
              </label>
              <input
                type="number"
                value={formData.pendingAmount}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20 text-tertiary font-semibold text-sm cursor-not-allowed"
              />
            </div>

            {/* Payment Via Pill Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                {t('createEntry.fields.paymentVia')} <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#1f221f] border border-tertiary/30 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleChange('paymentVia', 'UPI')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
                    formData.paymentVia === 'UPI'
                      ? 'bg-gradient-to-r from-tertiary/30 to-primary-container text-tertiary border-tertiary shadow-md'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-bright/40'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-tertiary" />
                  <span>{t('options.upi')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('paymentVia', 'Cash')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
                    formData.paymentVia === 'Cash'
                      ? 'bg-gradient-to-r from-secondary/30 to-secondary-container text-secondary border-secondary shadow-md'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-bright/40'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-secondary" />
                  <span>{t('options.cash')}</span>
                </button>
              </div>
            </div>

            {/* Status 3-Way Selector Pills */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                {t('createEntry.fields.status')} <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-[#1f221f] border border-tertiary/30 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleChange('status', 'Paid')}
                  className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl font-bold text-xs transition-all border ${
                    formData.status === 'Paid'
                      ? 'bg-tertiary/20 text-tertiary border-tertiary shadow-md'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-bright/40'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-tertiary flex-shrink-0" />
                  <span className="truncate">{t('options.paid')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('status', 'Pending')}
                  className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl font-bold text-xs transition-all border ${
                    formData.status === 'Pending'
                      ? 'bg-secondary/20 text-secondary border-secondary shadow-md'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-bright/40'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                  <span className="truncate">{t('options.pending')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('status', 'Balance')}
                  className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl font-bold text-xs transition-all border ${
                    formData.status === 'Balance'
                      ? 'bg-error-container/60 text-error border-error shadow-md'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-bright/40'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-error flex-shrink-0" />
                  <span className="truncate">{t('options.balance')}</span>
                </button>
              </div>
            </div>

            {/* Paid To Collector */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                {t('createEntry.fields.paidTo')} <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.paidTo}
                  onChange={handleCollectorChange}
                  className="w-full appearance-none px-4 py-2.5 rounded-xl bg-[#1f221f] border border-tertiary/40 text-on-surface focus:border-tertiary focus:outline-none text-sm font-bold transition-all pr-10 cursor-pointer"
                >
                  <option value="">{t('createEntry.placeholders.selectCollector')}</option>
                  {collectors.map((c) => (
                    <option key={c._id} value={c._id} className="bg-[#161816]">
                      {c.name}
                    </option>
                  ))}
                  <option value="ADD_NEW" className="bg-[#161816] text-tertiary font-bold">
                    + {t('createEntry.buttons.addCollector')}
                  </option>
                </select>
                <ChevronDown className="w-4 h-4 text-tertiary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/40 transition-all text-sm font-medium"
              >
                {t('modals.editRecord.cancel')}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container border border-primary/50 hover:bg-primary/90 hover:text-on-primary transition-all text-sm font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('modals.editRecord.saving')}</span>
                  </>
                ) : (
                  <span>{t('modals.editRecord.save')}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <AddCollectorModal
        isOpen={isAddCollectorOpen}
        onClose={() => setIsAddCollectorOpen(false)}
        onSuccess={handleCollectorAdded}
      />
    </>
  );
};
