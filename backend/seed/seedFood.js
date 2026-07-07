require('dotenv').config();
const { sequelize, connectDB } = require('../config/db');
const { User, FoodItem } = require('../models');

const sampleFood = [
  { name: 'Margherita Pizza', description: 'Classic tomato, mozzarella & basil', category: 'Pizza', price: 1450, imageUrl: '' },
  { name: 'Pepperoni Pizza', description: 'Loaded with spicy pepperoni', category: 'Pizza', price: 1650, imageUrl: '' },
  { name: 'BBQ Chicken Pizza', description: 'Smoky BBQ chicken & onions', category: 'Pizza', price: 1750, imageUrl: '' },
  { name: 'Classic Cheeseburger', description: 'Beef patty, cheddar, house sauce', category: 'Burger', price: 950, imageUrl: '' },
  { name: 'Crispy Chicken Burger', description: 'Fried chicken fillet, slaw, mayo', category: 'Burger', price: 890, imageUrl: '' },
  { name: 'Double Beef Burger', description: 'Two patties, double cheese', category: 'Burger', price: 1250, imageUrl: '' },
  { name: 'Chocolate Fudge Cake', description: 'Rich dark chocolate layer cake', category: 'Cake', price: 650, imageUrl: '' },
  { name: 'Red Velvet Cake', description: 'Cream cheese frosting', category: 'Cake', price: 700, imageUrl: '' },
  { name: 'Vanilla Cupcake', description: 'Buttercream topped cupcake', category: 'Cake', price: 250, imageUrl: '' },
  { name: 'French Fries', description: 'Crispy salted fries', category: 'Sides', price: 400, imageUrl: '' },
  { name: 'Coca-Cola (330ml)', description: 'Chilled soft drink', category: 'Drinks', price: 200, imageUrl: '' },
];

async function seed() {
  await connectDB();
  // Creates tables if they don't exist yet (safe to run repeatedly).
  await sequelize.sync();

  // Only seed if the table is empty — avoids FK conflicts with existing orders
  // that reference food items, and keeps re-running the seed script safe.
  const existingCount = await FoodItem.count();
  if (existingCount === 0) {
    await FoodItem.bulkCreate(sampleFood);
    console.log(`Seeded ${sampleFood.length} food items.`);
  } else {
    console.log(`Food items already present (${existingCount}), skipping seed.`);
  }

  const adminEmail = 'admin@foodorder.com';
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await User.create({
      fullName: 'System Admin',
      email: adminEmail,
      phone: '0700000000',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log(`Admin created -> email: ${adminEmail} | password: Admin@123`);
  } else {
    console.log('Admin user already exists, skipping.');
  }

  await sequelize.close();
  console.log('Seeding complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
