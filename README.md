# FeastLine — Food Ordering System

A full-stack food ordering web app with two roles (Customer & Admin), built with
**React.js**, **Node.js/Express**, **MySQL**, and **PayHere Sandbox** payments.

## Features

**Customer**
- Register / Login (JWT auth)
- Browse food items by category (Pizza, Burger, Cake, Sides, Drinks)
- Add to cart, checkout, and pay via PayHere Sandbox
- View order confirmation and live payment/order status
- View personal order history

**Admin**
- Separate admin login
- Dashboard with order/revenue stats
- View all customer orders, customer details, and payment status
- Update order fulfillment status (placed → confirmed → preparing → out for delivery → delivered)
- Add / edit / delete / toggle availability of food items

## Tech Stack
- **Frontend:** React 18 (Vite), React Router, Axios
- **Backend:** Node.js, Express
- **Database:** MySQL (Sequelize ORM)
- **Auth:** JWT + bcrypt password hashing
- **Payments:** PayHere Sandbox (checkout + IPN webhook signature verification)

---

## 1. Prerequisites
- Node.js 18+
- MySQL 8.0+ (or MariaDB) running locally, or a hosted MySQL instance

## 2. Database setup

Create the database (tables are then created automatically by the backend on startup):

```sql
CREATE DATABASE food_ordering_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

A reference schema is also provided at `backend/schema.sql` if you'd rather create the
tables manually instead of relying on Sequelize's auto-sync.

## 3. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env with your MySQL credentials and PayHere sandbox credentials
npm install
npm run seed      # creates the tables (if needed), sample food items, and an admin account
npm run dev        # starts the API on http://localhost:5000
```

## 4. Frontend setup

```bash
cd frontend
cp .env.example .env   # points to http://localhost:5000/api by default
npm install
npm run dev             # starts the app on http://localhost:5173
```

Open `http://localhost:5173` in your browser.


## 4. Database schema

```
users            (id, full_name, email, phone, password, role, address, timestamps)
food_items       (id, name, description, category, price, image_url, is_available, timestamps)
orders           (id, order_number, customerId -> users.id, total_amount, delivery_address,
                  contact_phone, payment_status, payment_method, payhere_transaction_id,
                  order_status, timestamps)
order_items      (id, orderId -> orders.id, foodItemId -> food_items.id, name, price,
                  quantity, timestamps)
```
`order_items` stores a snapshot of each item's name/price at the time of purchase, so later
price changes to a food item never affect historical orders.

## 5. Project structure

```
food-ordering-system/
├── backend/
│   ├── config/db.js          # Sequelize (MySQL) connection
│   ├── models/                # User, FoodItem, Order, OrderItem + associations (index.js)
│   ├── middleware/auth.js     # JWT auth + admin-only guard
│   ├── routes/                # auth, food, orders, payment endpoints
│   ├── utils/payhere.js       # PayHere hash generation & signature verification
│   ├── seed/seedFood.js       # sample data + admin seeding script
│   ├── schema.sql              # reference SQL schema (optional manual setup)
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.js        # axios instance with JWT interceptor
        ├── context/            # AuthContext, CartContext
        ├── components/         # Navbar, FoodCard, ProtectedRoute
        └── pages/               # customer pages + pages/admin
```

## 6. Notes on security
- Passwords are hashed with bcrypt; never stored in plain text.
- JWT is used for stateless authentication; admin-only routes are protected by role middleware.
- Order totals are always recalculated server-side — the frontend cart total is never trusted.
- Order creation runs inside a database transaction, so an order and its line items are
  always created together or not at all.
- PayHere's IPN signature is verified server-side before an order is marked as paid.

---

