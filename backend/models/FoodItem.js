const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class FoodItem extends Model {}

FoodItem.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    category: {
      type: DataTypes.ENUM('Pizza', 'Cake', 'Burger', 'Drinks', 'Sides', 'Other'),
      defaultValue: 'Other',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
      get() {
        const raw = this.getDataValue('price');
        return raw === null ? null : parseFloat(raw);
      },
    },
    imageUrl: { type: DataTypes.STRING, defaultValue: '', field: 'image_url' },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_available' },
  },
  {
    sequelize,
    modelName: 'FoodItem',
    tableName: 'food_items',
  }
);

module.exports = FoodItem;
