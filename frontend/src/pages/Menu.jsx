import { useEffect, useState } from 'react';
import api from '../api/axios';
import FoodCard from '../components/FoodCard';

const CATEGORIES = ['All', 'Pizza', 'Burger', 'Cake', 'Sides', 'Drinks', 'Other'];

export default function Menu() {
  const [foodItems, setFoodItems] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/food')
      .then((res) => setFoodItems(res.data))
      .catch(() => setError('Could not load the menu. Is the backend server running?'))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    category === 'All' ? foodItems : foodItems.filter((f) => f.category === category);

  return (
    <div className="page">
      <div className="hero container">
        <p className="eyebrow">Today's menu</p>
        <h1>Pizza, burgers, and cake — ready when you are.</h1>
        <p>Order online and pay securely through PayHere. Track your food from kitchen to doorstep.</p>
      </div>

      <div className="container">
        <div className="pill-row">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`pill ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && <p style={{ color: 'rgba(251,243,231,0.7)' }}>Loading menu…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">No items in this category yet.</div>
        )}

        <div className="food-grid">
          {filtered.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
