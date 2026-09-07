const Collector = require('../models/Collector');

// GET /api/collectors
const getCollectors = async (req, res) => {
  try {
    const collectors = await Collector.find({}).sort({ isDefault: -1, name: 1 });
    return res.status(200).json({
      success: true,
      count: collectors.length,
      data: collectors,
    });
  } catch (error) {
    console.error('Error fetching collectors:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching collectors',
    });
  }
};

// POST /api/collectors
const createCollector = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Collector name is required',
      });
    }

    const trimmedName = name.trim();
    if (trimmedName.length > 70) {
      return res.status(400).json({
        success: false,
        message: 'Collector name cannot exceed 70 characters',
      });
    }

    const existing = await Collector.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Collector with this name already exists',
        data: existing,
      });
    }

    const newCollector = await Collector.create({
      name: trimmedName,
      isDefault: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Collector added successfully',
      data: newCollector,
    });
  } catch (error) {
    console.error('Error creating collector:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating collector',
    });
  }
};

module.exports = {
  getCollectors,
  createCollector,
};
