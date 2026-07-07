const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class OrderItem extends Model {}

OrderItem.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const raw = this.getDataValue('price');
        return raw === null ? null : parseFloat(raw);
      },
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  },
  {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
  }
);

module.exports = OrderItem;
