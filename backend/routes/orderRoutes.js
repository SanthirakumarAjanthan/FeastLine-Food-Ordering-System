const express = require('express');
const crypto = require('crypto');
const { sequelize } = require('../config/db');
const { Order, OrderItem, FoodItem, User } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

function generateOrderNumber() {
  const stamp = Date.now().toString().slice(-8);
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `ORD-${stamp}-${rand}`;
}

const ORDER_INCLUDE = [
  { model: OrderItem, as: 'items' },
  { model: User, as: 'customer', attributes: ['id', 'fullName', 'email', 'phone', 'address'] },
];

// @route POST /api/orders  (customer - place a new order, status starts pending payment)
router.post('/', protect, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { items, deliveryAddress, contactPhone } = req.body;
    if (!items || !items.length) {
      await t.rollback();
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Recalculate prices server-side from DB to avoid trusting client-sent totals
    let totalAmount = 0;
    const lineItems = [];
    for (const cartItem of items) {
      const foodItem = await FoodItem.findByPk(cartItem.foodItemId, { transaction: t });
      if (!foodItem || !foodItem.isAvailable) {
        await t.rollback();
        return res.status(400).json({ message: `Item unavailable: ${cartItem.foodItemId}` });
      }
      const quantity = Math.max(1, Number(cartItem.quantity) || 1);
      totalAmount += foodItem.price * quantity;
      lineItems.push({
        foodItemId: foodItem.id,
        name: foodItem.name,
        price: foodItem.price,
        quantity,
      });
    }

    const order = await Order.create(
      {
        orderNumber: generateOrderNumber(),
        customerId: req.user.id,
        totalAmount,
        deliveryAddress: deliveryAddress || req.user.address || '',
        contactPhone: contactPhone || req.user.phone,
        paymentStatus: 'pending',
        orderStatus: 'placed',
      },
      { transaction: t }
    );

    await OrderItem.bulkCreate(
      lineItems.map((li) => ({ ...li, orderId: order.id })),
      { transaction: t }
    );

    await t.commit();

    const fullOrder = await Order.findByPk(order.id, { include: ORDER_INCLUDE });
    res.status(201).json(fullOrder);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to place order', error: err.message });
  }
});

// @route GET /api/orders/my  (customer - view own order history)
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { customerId: req.user.id },
      include: ORDER_INCLUDE,
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

// @route GET /api/orders/:id  (customer - view single order, e.g. confirmation page)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: ORDER_INCLUDE });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
});

// @route GET /api/orders  (admin only - view all customer orders + payment status)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.findAll({ include: ORDER_INCLUDE, order: [['createdAt', 'DESC']] });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

// @route PUT /api/orders/:id/status  (admin only - update order fulfillment status)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const allowed = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!allowed.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await order.update({ orderStatus });
    const fullOrder = await Order.findByPk(order.id, { include: ORDER_INCLUDE });
    res.json(fullOrder);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status', error: err.message });
  }
});

module.exports = router;
