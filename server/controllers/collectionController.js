const Collection = require('../models/Collection');
const Collector = require('../models/Collector');
const mongoose = require('mongoose');

// Utility helper to escape regex special characters for Unicode search
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

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

// POST /api/collections
const createCollection = async (req, res) => {
  try {
    const { name, nameLanguage, amount, amountPaid, pendingAmount, paymentVia, status, paidTo } = req.body;

    const finalPaymentVia = status === 'Pending' ? null : paymentVia;

    const newRecord = await Collection.create({
      name,
      nameLanguage: nameLanguage || 'EN',
      amount,
      amountPaid,
      pendingAmount,
      paymentVia: finalPaymentVia,
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
    const { sortBy, order, page, limit } = req.query;
    let sortOptions = { createdAt: -1 };

    if (sortBy === 'amountPaid') {
      sortOptions = { amountPaid: order === 'asc' ? 1 : -1 };
    }

    const filter = {};
    const pagination = await getPaginationData(Collection, filter, page, limit);

    const records = await Collection.find(filter)
      .populate('paidTo', 'name')
      .sort(sortOptions)
      .skip(pagination.skip)
      .limit(pagination.limit);

    return res.status(200).json({
      success: true,
      data: records,
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
    const { q, page, limit } = req.query;
    let filter = {};

    if (q && q.trim() !== '') {
      const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
      filter = { name: searchRegex };
    }

    const pagination = await getPaginationData(Collection, filter, page, limit);

    const records = await Collection.find(filter)
      .populate('paidTo', 'name')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    return res.status(200).json({
      success: true,
      data: records,
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
    const { page, limit } = req.query;
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

    const filter = { date: { $gte: startOfDay, $lte: endOfDay } };
    const pagination = await getPaginationData(Collection, filter, page, limit);

    const records = await Collection.find(filter)
      .populate('paidTo', 'name')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    return res.status(200).json({
      success: true,
      data: records,
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
    const { page, limit } = req.query;

    if (!mongoose.Types.ObjectId.isValid(collectorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid collector ID',
      });
    }

    const filter = { paidTo: collectorId };
    const pagination = await getPaginationData(Collection, filter, page, limit);

    const records = await Collection.find(filter)
      .populate('paidTo', 'name')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    return res.status(200).json({
      success: true,
      data: records,
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
    console.error('Error fetching collections by collector:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while searching collections by collector',
    });
  }
};

// GET /api/collections/export (Full dataset sorted by Amount Paid descending)
const exportCollections = async (req, res) => {
  try {
    const records = await Collection.find({})
      .populate('paidTo', 'name')
      .sort({ amountPaid: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('Error exporting collections:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while exporting collections',
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
    record.status = status;
    record.paymentVia = status === 'Pending' ? null : paymentVia;
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

// DELETE /api/collections/:id
const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid collection record ID',
      });
    }

    const deletedRecord = await Collection.findByIdAndDelete(id);
    if (!deletedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Collection record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Collection record deleted successfully',
      data: deletedRecord,
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting collection record',
    });
  }
};

module.exports = {
  createCollection,
  getCollections,
  searchCollections,
  getCollectionsByDate,
  getCollectionsByCollector,
  exportCollections,
  updateCollection,
  deleteCollection,
};
