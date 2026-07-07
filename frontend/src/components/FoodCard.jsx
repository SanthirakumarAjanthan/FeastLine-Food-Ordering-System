import { useCart } from '../context/CartContext';

export default function FoodCard({ item }) {
  const { items, addItem, decreaseItem } = useCart();
  const cartItem = items.find((i) => i.foodItemId === item.id);

  return (
    <div className="surface food-card">
      <div className="food-card-top">
        <span className="food-tag">{item.category}</span>
        <span className="food-price">Rs. {item.price.toFixed(2)}</span>
      </div>
      <h3 className="food-name">{item.name}</h3>
      <p className="food-desc">{item.description}</p>
      <div className="food-card-footer">
        {cartItem ? (
          <div className="qty-control">
            <button className="qty-btn" onClick={() => decreaseItem(item.id)}>−</button>
            <span>{cartItem.quantity}</span>
            <button className="qty-btn" onClick={() => addItem(item)}>+</button>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => addItem(item)}>
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
}
