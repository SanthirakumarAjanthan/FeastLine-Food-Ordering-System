const express = require('express');
const { FoodItem } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/food  (public - customers browse the menu)
router.get('/', async (req, res) => {
  try {
    const items = await FoodItem.findAll({ order: [['category', 'ASC'], ['name', 'ASC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch food items', error: err.message });
  }
});

// @route GET /api/food/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await FoodItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Food item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch food item', error: err.message });
  }
});

// @route POST /api/food  (admin only - add new food item)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, category, price, imageUrl, isAvailable } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    const item = await FoodItem.create({ name, description, category, price, imageUrl, isAvailable });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create food item', error: err.message });
  }
});

// @route PUT /api/food/:id  (admin only - update food item)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await FoodItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Food item not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update food item', error: err.message });
  }
});

// @route DELETE /api/food/:id  (admin only - remove food item)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await FoodItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Food item not found' });
    await item.destroy();
    res.json({ message: 'Food item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete food item', error: err.message });
  }
});

module.exports = router;
