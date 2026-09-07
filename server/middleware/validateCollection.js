const mongoose = require('mongoose');

const validateCollectionInput = (req, res, next) => {
  const { name, amount, amountPaid, paymentVia, status, paidTo } = req.body;
  const errors = [];

  // Name validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Name is required');
  } else if (name.trim().length > 70) {
    errors.push('Name cannot exceed 70 characters');
  }

  // Amount validation
  const parsedAmount = Number(amount);
  if (amount === undefined || amount === null || isNaN(parsedAmount)) {
    errors.push('Amount is required and must be a number');
  } else if (parsedAmount < 0) {
    errors.push('Amount cannot be negative');
  } else if (parsedAmount > 100000) {
    errors.push('Amount cannot exceed ₹1,00,000');
  }

  // Amount Paid validation
  const parsedAmountPaid = Number(amountPaid);
  if (amountPaid === undefined || amountPaid === null || isNaN(parsedAmountPaid)) {
    errors.push('Amount Paid is required and must be a number');
  } else if (parsedAmountPaid < 0) {
    errors.push('Amount Paid cannot be negative');
  } else if (parsedAmountPaid > 100000) {
    errors.push('Amount Paid cannot exceed ₹1,00,000');
  } else if (parsedAmountPaid > parsedAmount) {
    errors.push('Amount Paid cannot be greater than Amount');
  }

  // Payment Via validation
  if (!paymentVia || !['UPI', 'Cash'].includes(paymentVia)) {
    errors.push('Payment Via must be either UPI or Cash');
  }

  // Status validation
  if (!status || !['Paid', 'Pending', 'Balance'].includes(status)) {
    errors.push('Status must be Paid, Pending, or Balance');
  }

  // Paid To validation
  if (!paidTo || !mongoose.Types.ObjectId.isValid(paidTo)) {
    errors.push('Valid Paid To collector ID is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Automatically attach calculated pendingAmount
  req.body.pendingAmount = parsedAmount - parsedAmountPaid;
  req.body.amount = parsedAmount;
  req.body.amountPaid = parsedAmountPaid;

  next();
};

module.exports = { validateCollectionInput };
