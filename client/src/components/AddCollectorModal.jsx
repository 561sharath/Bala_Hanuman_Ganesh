import React, { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { addCollector } from '../services/api';

export const AddCollectorModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || name.trim() === '') {
      setError(t('validation.collectorNameRequired'));
      return;
    }

    if (name.trim().length > 70) {
      setError(t('validation.nameMax'));
      return;
    }

    setLoading(true);
    try {
      const res = await addCollector(name.trim());
      if (res.success) {
        showToast(t('toasts.collectorAdded'), 'success');
        setName('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-surface-container/95 backdrop-blur-2xl border border-tertiary/40 rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-tertiary/20 text-tertiary">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-headline font-semibold text-on-surface">
              {t('modals.addCollector.title')}
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

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              {t('modals.addCollector.label')} <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('modals.addCollector.placeholder')}
              maxLength={70}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/40 text-on-surface focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/40 transition-all text-sm font-medium"
            >
              {t('modals.addCollector.cancel')}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container border border-primary/50 hover:bg-primary/90 hover:text-on-primary transition-all text-sm font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('modals.addCollector.saving')}</span>
                </>
              ) : (
                <span>{t('modals.addCollector.save')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
