const express = require('express');
const { Order, OrderItem, User } = require('../models');
const { protect } = require('../middleware/auth');
const { generateCheckoutHash, verifyNotifySignature } = require('../utils/payhere');

const router = express.Router();

const ORDER_INCLUDE = [
  { model: OrderItem, as: 'items' },
  { model: User, as: 'customer', attributes: ['id', 'fullName', 'email', 'phone', 'address'] },
];

// @route POST /api/payment/initiate
// @desc  Customer confirms an order -> backend returns the PayHere checkout params
//        (including a signed hash) that the frontend uses to open the PayHere form.
router.post('/initiate', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findByPk(orderId, { include: ORDER_INCLUDE });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customer.id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized for this order' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const currency = 'LKR';

    const hash = generateCheckoutHash({
      merchantId,
      orderId: order.orderNumber,
      amount: order.totalAmount,
      currency,
      merchantSecret,
    });

    const [firstName, ...rest] = order.customer.fullName.split(' ');

    const payhereParams = {
      sandbox: process.env.PAYHERE_MODE !== 'live',
      merchant_id: merchantId,
      return_url: process.env.PAYHERE_RETURN_URL,
      cancel_url: process.env.PAYHERE_CANCEL_URL,
      notify_url: process.env.PAYHERE_NOTIFY_URL,
      order_id: order.orderNumber,
      items: order.items.map((i) => i.name).join(', ').slice(0, 200),
      amount: order.totalAmount.toFixed(2),
      currency,
      first_name: firstName || order.customer.fullName,
      last_name: rest.join(' ') || '-',
      email: order.customer.email,
      phone: order.customer.phone,
      address: order.deliveryAddress || 'N/A',
      city: 'N/A',
      country: 'Sri Lanka',
      hash,
      custom_1: String(order.id),
    };

    res.json({ payhereParams, orderId: order.id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to initiate payment', error: err.message });
  }
});

// @route POST /api/payment/notify
// @desc  PayHere server-to-server IPN callback. Verifies signature then updates order.
//        This must be a public URL PayHere sandbox can reach (e.g. via ngrok in dev).
router.post('/notify', async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      payment_id,
    } = req.body;

    const isValid = verifyNotifySignature({
      merchantId: merchant_id,
      orderId: order_id,
      payhereAmount: payhere_amount,
      payhereCurrency: payhere_currency,
      statusCode: status_code,
      merchantSecret: process.env.PAYHERE_MERCHANT_SECRET,
      md5sig,
    });

    if (!isValid) {
      console.warn('PayHere notify signature mismatch for order', order_id);
      return res.status(400).send('Invalid signature');
    }

    const order = await Order.findOne({ where: { orderNumber: order_id } });
    if (!order) return res.status(404).send('Order not found');

    // PayHere status codes: 2 = success, 0 = pending, -1 = cancelled, -2 = failed, -3 = charged back
    let updates = {};
    if (status_code === '2' || status_code === 2) {
      updates.paymentStatus = 'paid';
      updates.orderStatus = order.orderStatus === 'placed' ? 'confirmed' : order.orderStatus;
      updates.payhereTransactionId = payment_id || '';
    } else if (status_code === '0' || status_code === 0) {
      updates.paymentStatus = 'pending';
    } else {
      updates.paymentStatus = 'failed';
    }

    await order.update(updates);
    res.status(200).send('OK');
  } catch (err) {
    console.error('PayHere notify error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route GET /api/payment/status/:orderId  (frontend polls this after redirect back)
router.get('/status/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ paymentStatus: order.paymentStatus, orderStatus: order.orderStatus });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payment status', error: err.message });
  }
});

module.exports = router;
