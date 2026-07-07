import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, removeItem, totalAmount } = useCart();
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="container">
        <h2 className="section-title">Your cart</h2>

        {items.length === 0 ? (
          <div className="surface empty-state">
            <p>Your cart is empty.</p>
            <Link to="/menu" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
              Browse the menu
            </Link>
          </div>
        ) : (
          <div className="surface ticket" style={{ maxWidth: 560 }}>
            {items.map((item) => (
              <div className="cart-row" key={item.foodItemId}>
                <div>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-meta">
                    Rs. {item.price.toFixed(2)} × {item.quantity}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>Rs. {(item.price * item.quantity).toFixed(2)}</div>
                  <button className="remove-link" onClick={() => removeItem(item.foodItemId)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="cart-total-row">
              <span>Total</span>
              <span>Rs. {totalAmount.toFixed(2)}</span>
            </div>
            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: 20 }}
              onClick={() => navigate('/checkout')}
            >
              Proceed to checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
