import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (foodItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.foodItemId === foodItem.id);
      if (existing) {
        return prev.map((i) =>
          i.foodItemId === foodItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        { foodItemId: foodItem.id, name: foodItem.name, price: foodItem.price, quantity: 1 },
      ];
    });
  };

  const decreaseItem = (foodItemId) => {
    setItems((prev) =>
      prev
        .map((i) => (i.foodItemId === foodItemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (foodItemId) => {
    setItems((prev) => prev.filter((i) => i.foodItemId !== foodItemId));
  };

  const clearCart = () => setItems([]);

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, decreaseItem, removeItem, clearCart, totalAmount, totalCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
