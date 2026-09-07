const express = require('express');
const router = express.Router();
const {
  createCollection,
  getCollections,
  searchCollections,
  getCollectionsByDate,
  getCollectionsByCollector,
  updateCollection,
} = require('../controllers/collectionController');
const { validateCollectionInput } = require('../middleware/validateCollection');

router.get('/', getCollections);
router.post('/', validateCollectionInput, createCollection);
router.get('/search', searchCollections);
router.get('/date/:date', getCollectionsByDate);
router.get('/collector/:collectorId', getCollectionsByCollector);
router.put('/:id', validateCollectionInput, updateCollection);

module.exports = router;
