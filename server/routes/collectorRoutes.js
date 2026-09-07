const express = require('express');
const router = express.Router();
const { getCollectors, createCollector } = require('../controllers/collectorController');

router.get('/', getCollectors);
router.post('/', createCollector);

module.exports = router;
