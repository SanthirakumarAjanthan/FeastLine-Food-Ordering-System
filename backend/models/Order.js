const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Order extends Model {}

Order.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderNumber: { type: DataTypes.STRING, allowNull: false, unique: true, field: 'order_number' },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount',
      get() {
        const raw = this.getDataValue('totalAmount');
        return raw === null ? null : parseFloat(raw);
      },
    },
    deliveryAddress: { type: DataTypes.STRING, allowNull: false, field: 'delivery_address' },
    contactPhone: { type: DataTypes.STRING, allowNull: false, field: 'contact_phone' },

    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'cancelled'),
      defaultValue: 'pending',
      field: 'payment_status',
    },
    paymentMethod: { type: DataTypes.STRING, defaultValue: 'PayHere', field: 'payment_method' },
    payhereTransactionId: { type: DataTypes.STRING, defaultValue: '', field: 'payhere_transaction_id' },

    orderStatus: {
      type: DataTypes.ENUM('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
      defaultValue: 'placed',
      field: 'order_status',
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
  }
);

module.exports = Order;
