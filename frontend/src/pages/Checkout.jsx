import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    setPlacing(true);
    try {
      // 1. Create the order in our own DB (payment status: pending)
      const orderPayload = {
        items: items.map((i) => ({ foodItemId: i.foodItemId, quantity: i.quantity })),
        deliveryAddress: address,
        contactPhone: phone,
      };
      const { data: order } = await api.post('/orders', orderPayload);

      // 2. Ask backend for signed PayHere checkout params
      const { data } = await api.post('/payment/initiate', { orderId: order.id });
      const { payhereParams } = data;

      if (!window.payhere) {
        setError('PayHere SDK failed to load. Check your internet connection.');
        setPlacing(false);
        return;
      }

      window.payhere.onCompleted = function () {
        clearCart();
        navigate(`/order-confirmation/${order.id}`);
      };
      window.payhere.onDismissed = function () {
        setPlacing(false);
        setError('Payment was cancelled. You can try again from your order history.');
      };
      window.payhere.onError = function (msg) {
        setPlacing(false);
        setError(`Payment error: ${msg}`);
      };

      window.payhere.startPayment(payhereParams);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start checkout. Please try again.');
      setPlacing(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h2 className="section-title">Checkout</h2>
        <div className="surface form-card" style={{ maxWidth: 480 }}>
          <p style={{ marginBottom: 16, color: 'var(--ink-soft)' }}>
            Order total: <strong style={{ color: 'var(--chili)' }}>Rs. {totalAmount.toFixed(2)}</strong>
          </p>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handlePay}>
            <div className="form-group">
              <label>Delivery address</label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Contact phone</label>
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-block" disabled={placing}>
              {placing ? 'Opening PayHere…' : `Pay Rs. ${totalAmount.toFixed(2)} with PayHere`}
            </button>
          </form>
          <p className="form-footnote">Payments are processed securely via PayHere Sandbox.</p>
        </div>
      </div>
    </div>
  );
}
