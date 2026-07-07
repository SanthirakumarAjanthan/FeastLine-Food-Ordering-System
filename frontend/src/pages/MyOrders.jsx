import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders/my')
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="container">
        <h2 className="section-title">My orders</h2>
        {loading && <p style={{ color: 'rgba(251,243,231,0.7)' }}>Loading…</p>}
        {!loading && orders.length === 0 && (
          <div className="surface empty-state">
            <p>You haven't placed any orders yet.</p>
            <Link to="/menu" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
              Browse the menu
            </Link>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map((order) => (
            <Link
              to={`/order-confirmation/${order.id}`}
              key={order.id}
              className="surface"
              style={{ padding: 20, display: 'block' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <strong>{order.orderNumber}</strong>
                  <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge badge-${order.paymentStatus}`}>{order.paymentStatus}</span>
                  <span className={`badge badge-${order.orderStatus}`}>{order.orderStatus.replace(/_/g, ' ')}</span>
                  <strong>Rs. {order.totalAmount.toFixed(2)}</strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
