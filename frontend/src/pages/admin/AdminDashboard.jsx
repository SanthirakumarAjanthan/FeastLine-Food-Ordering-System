import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminOrders from './AdminOrders';
import AdminFoodManagement from './AdminFoodManagement';

export default function AdminDashboard() {
  const [tab, setTab] = useState('orders');
  const [stats, setStats] = useState({ totalOrders: 0, paidOrders: 0, revenue: 0, pendingOrders: 0 });

  useEffect(() => {
    api.get('/orders').then((res) => {
      const orders = res.data;
      const paid = orders.filter((o) => o.paymentStatus === 'paid');
      setStats({
        totalOrders: orders.length,
        paidOrders: paid.length,
        revenue: paid.reduce((sum, o) => sum + o.totalAmount, 0),
        pendingOrders: orders.filter((o) => o.paymentStatus === 'pending').length,
      });
    });
  }, []);

  return (
    <div className="page">
      <div className="container">
        <h2 className="section-title">Admin dashboard</h2>

        <div className="stat-grid">
          <div className="surface stat-card">
            <div className="stat-label">Total orders</div>
            <div className="stat-value">{stats.totalOrders}</div>
          </div>
          <div className="surface stat-card">
            <div className="stat-label">Paid orders</div>
            <div className="stat-value">{stats.paidOrders}</div>
          </div>
          <div className="surface stat-card">
            <div className="stat-label">Pending payment</div>
            <div className="stat-value">{stats.pendingOrders}</div>
          </div>
          <div className="surface stat-card">
            <div className="stat-label">Revenue (paid)</div>
            <div className="stat-value">Rs. {stats.revenue.toFixed(0)}</div>
          </div>
        </div>

        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
            Orders & Customers
          </button>
          <button className={`admin-tab ${tab === 'food' ? 'active' : ''}`} onClick={() => setTab('food')}>
            Manage Food Items
          </button>
        </div>

        {tab === 'orders' ? <AdminOrders /> : <AdminFoodManagement />}
      </div>
    </div>
  );
}
