import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" />
          FeastLine
        </Link>
        <div className="nav-links">
          <Link to="/menu">Menu</Link>
          {user && user.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
          {user && user.role === 'customer' && (
            <>
              <Link to="/orders">My Orders</Link>
              <Link to="/cart">
                Cart
                {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
              </Link>
            </>
          )}
          {user ? (
            <button onClick={handleLogout}>Logout ({user.fullName.split(' ')[0]})</button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
