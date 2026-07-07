import { useEffect, useState } from 'react';
import api from '../../api/axios';

const EMPTY_FORM = { name: '', description: '', category: 'Pizza', price: '', imageUrl: '', isAvailable: true };
const CATEGORIES = ['Pizza', 'Burger', 'Cake', 'Sides', 'Drinks', 'Other'];

export default function AdminFoodManagement() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadItems = () => {
    api.get('/food').then((res) => setItems(res.data));
  };

  useEffect(loadItems, []);

  const update = (field) => (e) => {
    const value = field === 'isAvailable' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editingId) {
        await api.put(`/food/${editingId}`, payload);
      } else {
        await api.post('/food', payload);
      }
      resetForm();
      loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save food item.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food item?')) return;
    await api.delete(`/food/${id}`);
    loadItems();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
      <div className="surface" style={{ padding: 24, height: 'fit-content' }}>
        <h3 style={{ marginBottom: 16 }}>{editingId ? 'Edit item' : 'Add new item'}</h3>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input required value={form.name} onChange={update('name')} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={2} value={form.description} onChange={update('description')} />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={update('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Price (Rs.)</label>
            <input type="number" min="0" step="0.01" required value={form.price} onChange={update('price')} />
          </div>
          <div className="form-group">
            <label>Image URL (optional)</label>
            <input value={form.imageUrl} onChange={update('imageUrl')} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              style={{ width: 'auto' }}
              checked={form.isAvailable}
              onChange={update('isAvailable')}
              id="isAvailable"
            />
            <label htmlFor="isAvailable" style={{ margin: 0 }}>Available on menu</label>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Update item' : 'Add item'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" style={{ color: 'var(--ink)', borderColor: 'var(--line)' }} onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="surface" style={{ padding: 24, overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Available</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>{item.description}</div>
                </td>
                <td>{item.category}</td>
                <td>Rs. {item.price.toFixed(2)}</td>
                <td>{item.isAvailable ? 'Yes' : 'No'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" style={{ color: 'var(--ink)', borderColor: 'var(--line)' }} onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                    <button className="remove-link" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
