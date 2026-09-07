import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Loader2,
  Calendar,
  UserPlus,
  CheckCircle2,
  Clock,
  Scale,
  Smartphone,
  Banknote,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { createCollectionRecord, fetchCollectors } from '../services/api';
import { AddCollectorModal } from '../components/AddCollectorModal';

export const CreateEntry = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    nameLanguage: 'EN',
    amount: '',
    amountPaid: '',
    pendingAmount: '',
    paymentVia: 'UPI',
    status: 'Paid',
    paidTo: '',
  });

  const [collectors, setCollectors] = useState([]);
  const [lastSelectedPaidTo, setLastSelectedPaidTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAddCollectorOpen, setIsAddCollectorOpen] = useState(false);

  useEffect(() => {
    loadCollectors();
  }, []);

  const loadCollectors = async (selectId = null) => {
    try {
      const res = await fetchCollectors();
      if (res.success) {
        setCollectors(res.data);
        if (selectId) {
          setFormData((prev) => ({ ...prev, paidTo: selectId }));
          setLastSelectedPaidTo(selectId);
        } else if (res.data.length > 0 && !formData.paidTo) {
          const defaultId = lastSelectedPaidTo || res.data[0]._id;
          setFormData((prev) => ({ ...prev, paidTo: defaultId }));
        }
      }
    } catch (err) {
      console.error('Error fetching collectors:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === 'amount') {
        if (value === '') {
          updated.amountPaid = '';
          updated.pendingAmount = '';
        } else {
          const numAmt = Number(value);
          if (prev.status === 'Paid') {
            updated.amountPaid = value;
            updated.pendingAmount = 0;
          } else if (prev.status === 'Pending') {
            updated.amountPaid = 0;
            updated.pendingAmount = numAmt;
          } else {
            const numPd = prev.amountPaid === '' ? 0 : Number(prev.amountPaid);
            updated.pendingAmount = Math.max(0, numAmt - numPd);
          }
        }
      } else if (field === 'amountPaid') {
        if (prev.amount === '') {
          updated.pendingAmount = '';
        } else {
          const numAmt = Number(prev.amount);
          const numPd = value === '' ? 0 : Number(value);
          updated.pendingAmount = Math.max(0, numAmt - numPd);

          if (value === '' || numPd === 0) {
            updated.status = 'Pending';
          } else if (numPd < numAmt) {
            updated.status = 'Balance';
          } else if (numPd >= numAmt && numAmt > 0) {
            updated.status = 'Paid';
          }
        }
      } else if (field === 'status') {
        if (prev.amount === '') {
          updated.amountPaid = '';
          updated.pendingAmount = '';
        } else {
          const numAmt = Number(prev.amount);
          if (value === 'Paid') {
            updated.amountPaid = prev.amount;
            updated.pendingAmount = 0;
          } else if (value === 'Pending') {
            updated.amountPaid = 0;
            updated.pendingAmount = numAmt;
          } else if (value === 'Balance') {
            const numPd = prev.amountPaid === '' ? 0 : Number(prev.amountPaid);
            updated.pendingAmount = Math.max(0, numAmt - numPd);
          }
        }
      }

      if (field === 'paidTo' && value !== 'ADD_NEW') {
        setLastSelectedPaidTo(value);
      }

      return updated;
    });
  };

  const handleCollectorSelect = (e) => {
    const val = e.target.value;
    if (val === 'ADD_NEW') {
      setIsAddCollectorOpen(true);
    } else {
      handleInputChange('paidTo', val);
    }
  };

  const handleCollectorAdded = (newCollector) => {
    setCollectors((prev) => [...prev, newCollector]);
    handleInputChange('paidTo', newCollector._id);
    setLastSelectedPaidTo(newCollector._id);
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

    const numPaid = status === 'Pending' && (amountPaid === '' || amountPaid === 0 || amountPaid === '0')
      ? 0
      : Number(amountPaid);

    if ((amountPaid === '' && status !== 'Pending') || isNaN(numPaid) || numPaid < 0 || numPaid > 100000) {
      setError(t('validation.amountPaidRequired'));
      return;
    }

    if (numPaid > numAmount) {
      setError(t('validation.amountPaidMax'));
      return;
    }

    if (!paidTo || paidTo === 'ADD_NEW') {
      setError(t('validation.paidToRequired'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        name: name.trim(),
        amount: numAmount,
        amountPaid: numPaid,
        pendingAmount: Math.max(0, numAmount - numPaid),
      };

      const res = await createCollectionRecord(payload);
      if (res.success) {
        showToast(t('toasts.recordSaved'), 'success');

        setFormData({
          name: '',
          nameLanguage: 'EN',
          amount: '',
          amountPaid: '',
          pendingAmount: '',
          paymentVia: 'UPI',
          status: 'Paid',
          paidTo: paidTo || lastSelectedPaidTo,
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('toasts.errorOccurred');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

  return (
    <div className="w-full max-w-3xl mx-auto py-4 sm:py-6">
      
      {/* Container Card */}
      <div className="bg-[#161816]/95 backdrop-blur-2xl border border-tertiary/40 rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-outline-variant/30 mb-5 sm:mb-6">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-tertiary/20 text-tertiary shadow-inner flex-shrink-0">
            <PlusCircle className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h2 className="font-headline text-xl sm:text-3xl font-bold text-on-surface leading-tight">
              {t('createEntry.title')}
            </h2>
            <p className="font-body text-xs sm:text-sm text-on-surface-variant">
              {t('createEntry.subtitle')}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
          {error && (
            <div className="p-3 sm:p-4 rounded-2xl bg-error-container/90 border border-error/50 text-on-error-container text-xs sm:text-sm font-medium">
              {error}
            </div>
          )}

          {/* Date & Name Language Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Auto Date (Read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-tertiary" />
                {t('createEntry.fields.date')}
              </label>
              <input
                type="text"
                value={todayFormatted}
                disabled
                className="w-full px-3.5 py-3 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/40 text-tertiary font-bold cursor-not-allowed text-xs sm:text-sm shadow-inner"
              />
            </div>

            {/* Name Language Toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {t('createEntry.fields.nameLang')}
              </label>
              <div className="flex bg-[#1f221f] rounded-xl p-1 border border-tertiary/30">
                <button
                  type="button"
                  onClick={() => handleInputChange('nameLanguage', 'EN')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    formData.nameLanguage === 'EN'
                      ? 'bg-primary-container text-on-primary-container border border-primary/50 shadow-md'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('nameLanguage', 'TE')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    formData.nameLanguage === 'TE'
                      ? 'bg-primary-container text-on-primary-container border border-primary/50 shadow-md'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  తెలుగు
                </button>
              </div>
            </div>
          </div>

          {/* Donor Name Field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {t('createEntry.fields.name')} <span className="text-error">*</span>
              </label>
              <span className="text-[11px] text-on-surface-variant font-medium">
                {formData.name.length} / 70
              </span>
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('createEntry.fields.namePlaceholder')}
              maxLength={70}
              className="w-full px-3.5 py-3 rounded-xl bg-[#1f221f] border border-tertiary/30 text-on-surface placeholder:text-on-surface-variant/50 focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary text-xs sm:text-sm font-medium transition-all"
            />
          </div>

          {/* Amounts Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {t('createEntry.fields.amount')} <span className="text-error">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                onWheel={(e) => e.target.blur()}
                placeholder={t('createEntry.fields.amountPlaceholder')}
                min={0}
                max={100000}
                className="w-full px-3.5 py-3 rounded-xl bg-[#1f221f] border border-tertiary/30 text-on-surface placeholder:text-on-surface-variant/50 focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary text-xs sm:text-sm font-medium transition-all"
              />
            </div>

            {/* Amount Paid */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {t('createEntry.fields.amountPaid')} <span className="text-error">*</span>
              </label>
              <input
                type="number"
                value={formData.amountPaid}
                onChange={(e) => handleInputChange('amountPaid', e.target.value)}
                onWheel={(e) => e.target.blur()}
                placeholder={t('createEntry.fields.amountPaidPlaceholder')}
                min={0}
                max={100000}
                className="w-full px-3.5 py-3 rounded-xl bg-[#1f221f] border border-tertiary/30 text-on-surface placeholder:text-on-surface-variant/50 focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary text-xs sm:text-sm font-medium transition-all"
              />
            </div>

            {/* Pending Amount (Auto Calculated Read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {t('createEntry.fields.pendingAmount')}
              </label>
              <input
                type="number"
                value={formData.pendingAmount}
                readOnly
                placeholder="0"
                className="w-full px-3.5 py-3 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/40 text-tertiary font-extrabold text-sm sm:text-base cursor-not-allowed shadow-inner"
              />
            </div>
          </div>

          {/* Premium UI Option Selectors: Payment Via & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Custom Payment Via Pill Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {t('createEntry.fields.paymentVia')} <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#1f221f] border border-tertiary/30 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleInputChange('paymentVia', 'UPI')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
                    formData.paymentVia === 'UPI'
                      ? 'bg-gradient-to-r from-tertiary/30 to-primary-container text-tertiary border-tertiary shadow-lg scale-[1.02]'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-bright/40'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-tertiary" />
                  <span>{t('options.upi')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('paymentVia', 'Cash')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
                    formData.paymentVia === 'Cash'
                      ? 'bg-gradient-to-r from-secondary/30 to-secondary-container text-secondary border-secondary shadow-lg scale-[1.02]'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-bright/40'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-secondary" />
                  <span>{t('options.cash')}</span>
                </button>
              </div>
            </div>

            {/* Custom Status 3-Way Selector Pills (Paid / Pending / Balance) */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {t('createEntry.fields.status')} <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-[#1f221f] border border-tertiary/30 shadow-inner">
                
                {/* Option 1: Paid */}
                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'Paid')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1.5 rounded-xl font-bold text-xs transition-all border ${
                    formData.status === 'Paid'
                      ? 'bg-tertiary/20 text-tertiary border-tertiary shadow-lg scale-[1.02]'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-bright/40'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-tertiary flex-shrink-0" />
                  <span className="truncate">{t('options.paid')}</span>
                </button>

                {/* Option 2: Pending */}
                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'Pending')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1.5 rounded-xl font-bold text-xs transition-all border ${
                    formData.status === 'Pending'
                      ? 'bg-secondary/20 text-secondary border-secondary shadow-lg scale-[1.02]'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-bright/40'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                  <span className="truncate">{t('options.pending')}</span>
                </button>

                {/* Option 3: Balance */}
                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'Balance')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1.5 rounded-xl font-bold text-xs transition-all border ${
                    formData.status === 'Balance'
                      ? 'bg-error-container/60 text-error border-error shadow-lg scale-[1.02]'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface hover:bg-surface-bright/40'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-error flex-shrink-0" />
                  <span className="truncate">{t('options.balance')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Paid To Collector Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {t('createEntry.fields.paidTo')} <span className="text-error">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <select
                  value={formData.paidTo}
                  onChange={handleCollectorSelect}
                  className="w-full appearance-none px-4 py-3 rounded-xl bg-[#1f221f] border border-tertiary/40 text-on-surface focus:border-tertiary focus:outline-none text-xs sm:text-sm font-bold transition-all pr-10 cursor-pointer shadow-sm"
                >
                  <option value="">{t('createEntry.placeholders.selectCollector')}</option>
                  {collectors.map((c) => (
                    <option key={c._id} value={c._id} className="bg-[#161816] text-on-surface py-2">
                      {c.name}
                    </option>
                  ))}
                  <option value="ADD_NEW" className="bg-[#161816] text-tertiary font-bold">
                    + {t('createEntry.buttons.addCollector')}
                  </option>
                </select>
                <ChevronDown className="w-4 h-4 text-tertiary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={() => setIsAddCollectorOpen(true)}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-surface-container-high border border-tertiary/40 text-tertiary hover:bg-tertiary/20 transition-all flex items-center justify-center gap-1.5 text-xs font-bold whitespace-nowrap shadow-sm"
              >
                <UserPlus className="w-4 h-4 flex-shrink-0" />
                <span>{t('createEntry.buttons.addCollector')}</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 sm:pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 sm:py-4 rounded-2xl bg-primary-container text-on-primary-container border border-primary/40 hover:bg-primary hover:text-on-primary transition-all duration-300 font-headline font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('createEntry.buttons.saving')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-tertiary" />
                  <span>{t('createEntry.buttons.save')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <AddCollectorModal
        isOpen={isAddCollectorOpen}
        onClose={() => setIsAddCollectorOpen(false)}
        onSuccess={handleCollectorAdded}
      />
    </div>
  );
};
