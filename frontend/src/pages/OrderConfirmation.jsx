import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let attempts = 0;
    let timer;

    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
        // Poll a few times in case the PayHere IPN hasn't landed yet
        if (data.paymentStatus === 'pending' && attempts < 6) {
          attempts += 1;
          timer = setTimeout(fetchOrder, 2500);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load order.');
      }
    };

    fetchOrder();
    return () => clearTimeout(timer);
  }, [orderId]);

  if (error) {
    return (
      <div className="page container">
        <div className="form-error">{error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page container">
        <p style={{ color: 'rgba(251,243,231,0.7)' }}>Loading your order…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="surface ticket" style={{ maxWidth: 560 }}>
          <p className="eyebrow">
            {order.paymentStatus === 'paid' ? 'Payment successful' : 'Order received'}
          </p>
          <h2 style={{ margin: '8px 0 4px' }}>Thank you{order.paymentStatus === 'paid' ? '!' : ''}</h2>
          <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>
            Order <strong>{order.orderNumber}</strong>
          </p>

          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <span className={`badge badge-${order.paymentStatus}`}>Payment: {order.paymentStatus}</span>
            <span className={`badge badge-${order.orderStatus}`}>Status: {order.orderStatus.replace(/_/g, ' ')}</span>
          </div>

          {order.items.map((item) => (
            <div className="cart-row" key={item.name}>
              <div>
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-meta">Qty {item.quantity}</div>
              </div>
              <div>Rs. {(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
          <div className="cart-total-row">
            <span>Total</span>
            <span>Rs. {order.totalAmount.toFixed(2)}</span>
          </div>

          {order.paymentStatus === 'pending' && (
            <p style={{ marginTop: 16, fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
              Waiting for payment confirmation from PayHere. This page will update automatically.
            </p>
          )}

          <Link to="/orders" className="btn btn-secondary" style={{ marginTop: 20, color: 'var(--ink)', borderColor: 'var(--line)' }}>
            View all my orders
          </Link>
        </div>
      </div>
    </div>
  );
}
