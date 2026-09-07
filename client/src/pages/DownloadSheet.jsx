import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { fetchExportCollections } from '../services/api';
import { exportCollectionsToExcel } from '../utils/excelExporter';

export const DownloadSheet = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setDownloading(true);
    setError('');

    try {
      // Fetch full collection dataset sorted by amountPaid descending
      const res = await fetchExportCollections();

      if (!res.success || !res.data || res.data.length === 0) {
        setError(t('updateEntry.emptyState'));
        return;
      }

      exportCollectionsToExcel(res.data, t);
      showToast(t('toasts.excelDownloaded'), 'success');
    } catch (err) {
      console.error('Error exporting Excel:', err);
      setError(err.message || t('toasts.errorOccurred'));
    } finally {
      setDownloading(false);
    }
  };

  const infoItems = t('downloadSheet.infoItems') || [];

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      
      {/* Container Card */}
      <div className="bg-[#161816]/90 backdrop-blur-2xl border border-tertiary/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center flex flex-col items-center">
        
        {/* Decorative Top Ambient Light */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-b from-tertiary/20 via-primary/10 to-transparent blur-2xl pointer-events-none" />

        {/* Icon Emblem */}
        <div className="w-20 h-20 rounded-3xl bg-tertiary/20 border border-tertiary/40 flex items-center justify-center text-tertiary mb-6 shadow-xl relative z-10">
          <FileSpreadsheet className="w-10 h-10" />
        </div>

        {/* Title & Subtitle */}
        <h2 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface mb-3 relative z-10">
          {t('downloadSheet.title')}
        </h2>

        <p className="font-body text-base text-on-surface-variant max-w-lg mb-8 relative z-10">
          {t('downloadSheet.subtitle')}
        </p>

        {/* Specs Box */}
        <div className="w-full bg-[#212421] backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-6 text-left mb-8 relative z-10 shadow-inner">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-tertiary mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{t('downloadSheet.infoTitle')}</span>
          </h4>

          <ul className="flex flex-col gap-3 text-sm text-on-surface-variant">
            {Array.isArray(infoItems) &&
              infoItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
          </ul>
        </div>

        {error && (
          <div className="w-full p-4 mb-6 rounded-2xl bg-error-container/80 border border-error/50 text-on-error-container text-sm font-medium flex items-center justify-center gap-2 relative z-10">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-primary-container text-on-primary-container border border-primary/40 hover:bg-primary hover:text-on-primary transition-all duration-300 font-headline font-bold text-lg flex items-center justify-center gap-3 shadow-2xl relative z-10 disabled:opacity-50 active:scale-95"
        >
          {downloading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>{t('downloadSheet.downloading')}</span>
            </>
          ) : (
            <>
              <Download className="w-6 h-6 text-tertiary" />
              <span>{t('downloadSheet.button')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
