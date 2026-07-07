const User = require('./User');
const FoodItem = require('./FoodItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// A customer (User) has many Orders
User.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

// An Order has many OrderItems (line items)
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// An OrderItem references the FoodItem it was created from
FoodItem.hasMany(OrderItem, { foreignKey: 'foodItemId', as: 'orderItems' });
OrderItem.belongsTo(FoodItem, { foreignKey: 'foodItemId', as: 'foodItem' });

module.exports = { User, FoodItem, Order, OrderItem };
