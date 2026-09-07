import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const DeleteConfirmModal = ({ isOpen, title, message, onConfirm, onClose, loading }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-start justify-center p-4 pt-24 pb-12 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md bg-[#161816] border border-error/50 rounded-2xl p-6 shadow-2xl relative my-0 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Warning Icon & Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/30">
          <div className="p-3 rounded-full bg-error-container/80 text-error border border-error/40 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-headline font-bold text-on-surface">
              {title || t('deleteModal.confirmTitle')}
            </h3>
          </div>
        </div>

        {/* Message */}
        <div className="py-4 text-sm text-on-surface-variant font-medium">
          {message}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface-variant font-bold text-sm hover:bg-surface-bright/40 transition-colors disabled:opacity-50"
          >
            {t('deleteModal.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-error text-on-error font-bold text-sm hover:bg-error/90 transition-all shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('deleteModal.deleting')}</span>
              </>
            ) : (
              <span>{t('deleteModal.delete')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
