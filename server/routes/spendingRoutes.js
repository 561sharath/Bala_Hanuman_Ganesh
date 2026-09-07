const express = require('express');
const router = express.Router();
const {
  createSpending,
  getSpendings,
  updateSpending,
  deleteSpending,
} = require('../controllers/spendingController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', getSpendings);
router.post('/', requireAdmin, createSpending);
router.put('/:id', requireAdmin, updateSpending);
router.delete('/:id', requireAdmin, deleteSpending);

module.exports = router;
