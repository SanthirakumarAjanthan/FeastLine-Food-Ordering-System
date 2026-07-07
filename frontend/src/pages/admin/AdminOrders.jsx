import { useEffect, useState } from 'react';
import api from '../../api/axios';

const STATUS_OPTIONS = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = () => {
    setLoading(true);
    api
      .get('/orders')
      .then((res) => setOrders(res.data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadOrders, []);

  const handleStatusChange = async (orderId, orderStatus) => {
    setUpdatingId(orderId);
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { orderStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)));
    } catch {
      setError('Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p style={{ color: 'var(--ink-soft)' }}>Loading orders…</p>;

  return (
    <div className="surface" style={{ padding: 24, overflowX: 'auto' }}>
      {error && <div className="form-error">{error}</div>}
      {orders.length === 0 ? (
        <div className="empty-state">No orders placed yet.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>{order.orderNumber}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </td>
                <td>
                  <div>{order.customer?.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{order.customer?.email}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{order.customer?.phone}</div>
                </td>
                <td>
                  {order.items.map((i) => (
                    <div key={i.name} style={{ fontSize: '0.82rem' }}>
                      {i.quantity} × {i.name}
                    </div>
                  ))}
                </td>
                <td>
                  <strong>Rs. {order.totalAmount.toFixed(2)}</strong>
                </td>
                <td>
                  <span className={`badge badge-${order.paymentStatus}`}>{order.paymentStatus}</span>
                </td>
                <td>
                  <select
                    className="status-select"
                    value={order.orderStatus}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
