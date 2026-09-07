const Spending = require('../models/Spending');
const mongoose = require('mongoose');

// Utility helper to escape regex special characters
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// Helper to aggregate spending summary total
const getSpendingSummary = async (queryFilter = {}) => {
  const result = await Spending.aggregate([
    { $match: queryFilter },
    {
      $group: {
        _id: null,
        totalSpendings: { $sum: '$amountSpent' },
      },
    },
  ]);

  if (result.length > 0) {
    return {
      totalSpendings: result[0].totalSpendings || 0,
    };
  }
  return {
    totalSpendings: 0,
  };
};

// Utility helper for pagination building
const getPaginationData = async (model, queryFilter, pageQuery, limitQuery) => {
  const page = Math.max(1, parseInt(pageQuery, 10) || 1);
  const limit = Math.max(1, parseInt(limitQuery, 10) || 20);
  const skip = (page - 1) * limit;

  const totalRecords = await model.countDocuments(queryFilter);
  const totalPages = Math.ceil(totalRecords / limit) || 1;

  return {
    page,
    limit,
    skip,
    totalRecords,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

// POST /api/spendings (Admin Only)
const createSpending = async (req, res) => {
  try {
    const { itemName, amountSpent, spentBy } = req.body;

    if (!itemName || itemName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Item name is required.' });
    }
    if (itemName.trim().length > 100) {
      return res.status(400).json({ success: false, message: 'Item name cannot exceed 100 characters.' });
    }

    const numAmount = Number(amountSpent);
    if (amountSpent === '' || isNaN(numAmount) || numAmount < 0 || numAmount > 100000) {
      return res.status(400).json({ success: false, message: 'Amount spent must be between 0 and 100,000.' });
    }

    if (!spentBy || spentBy.trim() === '') {
      return res.status(400).json({ success: false, message: 'Spent by is required.' });
    }
    if (spentBy.trim().length > 70) {
      return res.status(400).json({ success: false, message: 'Spent by cannot exceed 70 characters.' });
    }

    const newSpending = await Spending.create({
      itemName: itemName.trim(),
      amountSpent: numAmount,
      date: new Date(),
      spentBy: spentBy.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Spending record saved successfully',
      data: newSpending,
    });
  } catch (error) {
    console.error('Error creating spending:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while saving spending record',
    });
  }
};

// GET /api/spendings (Paginated & Filterable with Summary)
const getSpendings = async (req, res) => {
  try {
    const { q, date, spentBy, page, limit } = req.query;
    const filter = {};

    if (q && q.trim() !== '') {
      const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
      filter.itemName = searchRegex;
    }

    if (spentBy && spentBy.trim() !== '') {
      const spentByRegex = new RegExp(escapeRegex(spentBy.trim()), 'i');
      filter.spentBy = spentByRegex;
    }

    if (date && date.trim() !== '') {
      const targetDate = new Date(date);
      if (!isNaN(targetDate.getTime())) {
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.date = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    const pagination = await getPaginationData(Spending, filter, page, limit);
    const summary = await getSpendingSummary(filter);

    const records = await Spending.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    return res.status(200).json({
      success: true,
      data: records,
      summary,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalRecords: pagination.totalRecords,
        totalPages: pagination.totalPages,
        hasNextPage: pagination.hasNextPage,
        hasPreviousPage: pagination.hasPreviousPage,
      },
    });
  } catch (error) {
    console.error('Error fetching spendings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching spending records',
    });
  }
};

// PUT /api/spendings/:id (Admin Only)
const updateSpending = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid spending record ID' });
    }

    const spending = await Spending.findById(id);
    if (!spending) {
      return res.status(404).json({ success: false, message: 'Spending record not found' });
    }

    const { itemName, amountSpent, spentBy, date } = req.body;

    if (!itemName || itemName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Item name is required.' });
    }

    const numAmount = Number(amountSpent);
    if (amountSpent === '' || isNaN(numAmount) || numAmount < 0 || numAmount > 100000) {
      return res.status(400).json({ success: false, message: 'Amount spent must be between 0 and 100,000.' });
    }

    if (!spentBy || spentBy.trim() === '') {
      return res.status(400).json({ success: false, message: 'Spent by is required.' });
    }

    spending.itemName = itemName.trim();
    spending.amountSpent = numAmount;
    spending.spentBy = spentBy.trim();
    if (date) {
      spending.date = new Date(date);
    }

    await spending.save();

    return res.status(200).json({
      success: true,
      message: 'Spending record updated successfully',
      data: spending,
    });
  } catch (error) {
    console.error('Error updating spending:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating spending record',
    });
  }
};

// DELETE /api/spendings/:id (Admin Only)
const deleteSpending = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid spending record ID' });
    }

    const deletedRecord = await Spending.findByIdAndDelete(id);
    if (!deletedRecord) {
      return res.status(404).json({ success: false, message: 'Spending record not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Spending record deleted successfully',
      data: deletedRecord,
    });
  } catch (error) {
    console.error('Error deleting spending:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting spending record',
    });
  }
};

module.exports = {
  createSpending,
  getSpendings,
  updateSpending,
  deleteSpending,
};
