import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Pagination = ({ pagination, onPageChange }) => {
  const { t } = useLanguage();

  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, limit, totalRecords, totalPages, hasNextPage, hasPreviousPage } = pagination;

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalRecords);

  // Generate page numbers range around current page
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-outline-variant/30 text-xs sm:text-sm text-on-surface-variant">
      
      {/* Records info string */}
      <div className="font-medium text-center sm:text-left">
        {t('pagination.showing')} <span className="font-bold text-on-surface">{startRecord}</span> {t('pagination.to')}{' '}
        <span className="font-bold text-on-surface">{endRecord}</span> {t('pagination.of')}{' '}
        <span className="font-bold text-tertiary">{totalRecords}</span> {t('pagination.records')}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-outline-variant/40 bg-[#1e211e] text-on-surface hover:bg-tertiary/20 hover:border-tertiary disabled:opacity-40 disabled:hover:bg-[#1e211e] disabled:hover:border-outline-variant/40 transition-all font-semibold active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('pagination.previous')}</span>
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-bold transition-all text-xs sm:text-sm flex items-center justify-center border ${
              num === page
                ? 'bg-primary-container text-on-primary-container border-primary shadow-md scale-105'
                : 'bg-[#1e211e] text-on-surface border-outline-variant/30 hover:border-tertiary hover:bg-tertiary/20'
            }`}
          >
            {num}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-outline-variant/40 bg-[#1e211e] text-on-surface hover:bg-tertiary/20 hover:border-tertiary disabled:opacity-40 disabled:hover:bg-[#1e211e] disabled:hover:border-outline-variant/40 transition-all font-semibold active:scale-95"
        >
          <span className="hidden sm:inline">{t('pagination.next')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
