import * as XLSX from 'xlsx';

/**
 * Export collection records to Excel sheet sorted by Amount Paid descending.
 * @param {Array} records - Array of collection documents
 * @param {Function} translate - Translation function t()
 */
export const exportCollectionsToExcel = (records, t) => {
  if (!records || records.length === 0) {
    throw new Error('No records available to export');
  }

  // Sort records by Amount Paid descending
  const sortedRecords = [...records].sort((a, b) => b.amountPaid - a.amountPaid);

  // Format data rows
  const excelData = sortedRecords.map((item) => {
    const formattedDate = item.date
      ? new Date(item.date).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      : '';

    return {
      [t('updateEntry.table.name')]: item.name,
      [t('createEntry.fields.nameLang')]: item.nameLanguage === 'TE' ? 'Telugu (తెలుగు)' : 'English',
      [`${t('updateEntry.table.amount')} (₹)`]: item.amount,
      [`${t('updateEntry.table.amountPaid')} (₹)`]: item.amountPaid,
      [`${t('updateEntry.table.pendingAmount')} (₹)`]: item.pendingAmount,
      [t('updateEntry.table.paymentVia')]: item.paymentVia === 'UPI' ? t('options.upi') : t('options.cash'),
      [t('updateEntry.table.status')]: item.status === 'Paid' ? t('options.paid') : t('options.pending'),
      [t('updateEntry.table.paidTo')]: item.paidTo ? item.paidTo.name : '',
      [t('updateEntry.table.date')]: formattedDate,
    };
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Auto-fit column widths
  const maxLen = (val) => (val ? val.toString().length : 10);
  const colWidths = Object.keys(excelData[0]).map((key) => {
    let max = key.length;
    excelData.forEach((row) => {
      const len = maxLen(row[key]);
      if (len > max) max = len;
    });
    return { wch: Math.min(Math.max(max + 4, 12), 40) };
  });

  worksheet['!cols'] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vinayaka Chanda Collections');

  // Trigger file download
  const filename = 'Sri_Bala_Hanuman_Vinayaka_Seve_Samithi_Collections.xlsx';
  XLSX.writeFile(workbook, filename);
};
