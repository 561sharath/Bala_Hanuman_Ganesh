const Collection = require('../models/Collection');
const Collector = require('../models/Collector');
const mongoose = require('mongoose');

// Utility helper to escape regex special characters for Unicode search
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// POST /api/collections
const createCollection = async (req, res) => {
  try {
    const { name, nameLanguage, amount, amountPaid, pendingAmount, paymentVia, status, paidTo } = req.body;

    const newRecord = await Collection.create({
      name,
      nameLanguage: nameLanguage || 'EN',
      amount,
      amountPaid,
      pendingAmount,
      paymentVia,
      status,
      paidTo,
      date: new Date(),
    });

    const populatedRecord = await Collection.findById(newRecord._id).populate('paidTo', 'name');

    return res.status(201).json({
      success: true,
      message: 'Record saved successfully',
      data: populatedRecord,
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while saving collection record',
    });
  }
};

// GET /api/collections
const getCollections = async (req, res) => {
  try {
    const { sortBy, order } = req.query;
    let sortOptions = { createdAt: -1 };

    if (sortBy === 'amountPaid') {
      sortOptions = { amountPaid: order === 'asc' ? 1 : -1 };
    }

    const records = await Collection.find({})
      .populate('paidTo', 'name')
      .sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching collections',
    });
  }
};

// GET /api/collections/search?q=...
const searchCollections = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      const allRecords = await Collection.find({}).populate('paidTo', 'name').sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: allRecords.length,
        data: allRecords,
      });
    }

    const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
    const records = await Collection.find({ name: searchRegex })
      .populate('paidTo', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('Error searching collections:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while searching collections',
    });
  }
};

// GET /api/collections/date/:date (Date format: YYYY-MM-DD)
const getCollectionsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);

    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    const currentYear = new Date().getFullYear();
    const selectedYear = targetDate.getFullYear();

    if (selectedYear !== currentYear) {
      return res.status(400).json({
        success: false,
        message: `Date must belong to the current year (${currentYear})`,
      });
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await Collection.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('paidTo', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('Error fetching collections by date:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while searching collections by date',
    });
  }
};

// GET /api/collections/collector/:collectorId
const getCollectionsByCollector = async (req, res) => {
  try {
    const { collectorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(collectorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid collector ID',
      });
    }

    const records = await Collection.find({ paidTo: collectorId })
      .populate('paidTo', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('Error fetching collections by collector:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while searching collections by collector',
    });
  }
};

// PUT /api/collections/:id
const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid collection record ID',
      });
    }

    const record = await Collection.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Collection record not found',
      });
    }

    const { name, nameLanguage, amount, amountPaid, pendingAmount, paymentVia, status, paidTo } = req.body;

    record.name = name;
    if (nameLanguage) record.nameLanguage = nameLanguage;
    record.amount = amount;
    record.amountPaid = amountPaid;
    record.pendingAmount = pendingAmount;
    record.paymentVia = paymentVia;
    record.status = status;
    record.paidTo = paidTo;

    await record.save();

    const updatedRecord = await Collection.findById(record._id).populate('paidTo', 'name');

    return res.status(200).json({
      success: true,
      message: 'Record updated successfully',
      data: updatedRecord,
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating collection record',
    });
  }
};

module.exports = {
  createCollection,
  getCollections,
  searchCollections,
  getCollectionsByDate,
  getCollectionsByCollector,
  updateCollection,
};
