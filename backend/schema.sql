-- Reference schema for the Food Ordering System (MySQL)
-- NOTE: The backend automatically creates/updates these tables on startup via
-- Sequelize's sync(). This file is provided purely as a reference, or for
-- manual setup if you prefer not to rely on auto-sync.

CREATE DATABASE IF NOT EXISTS food_ordering_system
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE food_ordering_system;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  address VARCHAR(500) DEFAULT '',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS food_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category ENUM('Pizza', 'Cake', 'Burger', 'Drinks', 'Sides', 'Other') DEFAULT 'Other',
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500) DEFAULT '',
  is_available BOOLEAN DEFAULT TRUE,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(100) NOT NULL UNIQUE,
  customerId INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_address VARCHAR(500) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'PayHere',
  payhere_transaction_id VARCHAR(255) DEFAULT '',
  order_status ENUM('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'placed',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customerId) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  foodItemId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_food_item FOREIGN KEY (foodItemId) REFERENCES food_items(id)
) ENGINE=InnoDB;
