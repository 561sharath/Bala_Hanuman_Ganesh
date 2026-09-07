const express = require('express');
const router = express.Router();
const {
  createCollection,
  getCollections,
  searchCollections,
  getCollectionsByDate,
  getCollectionsByCollector,
  exportCollections,
  updateCollection,
  deleteCollection,
} = require('../controllers/collectionController');
const { validateCollectionInput } = require('../middleware/validateCollection');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', getCollections);
router.get('/export', exportCollections);
router.get('/search', searchCollections);
router.get('/date/:date', getCollectionsByDate);
router.get('/collector/:collectorId', getCollectionsByCollector);

// Admin-only endpoints
router.post('/', requireAdmin, validateCollectionInput, createCollection);
router.put('/:id', requireAdmin, validateCollectionInput, updateCollection);
router.delete('/:id', requireAdmin, deleteCollection);

module.exports = router;
