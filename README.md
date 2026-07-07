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
- A free [PayHere Sandbox merchant account](https://www.payhere.lk/) (gives you a Merchant ID and Merchant Secret)
- [ngrok](https://ngrok.com/) or similar, **only if** you want PayHere's server-to-server
  notify webhook to reach your local machine during development (see below)

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

`npm run dev` (or `npm start`) also calls `sequelize.sync()` on boot, so tables are created/
updated automatically to match the models — you don't need to run migrations manually for
this project.

Default seeded admin login:
- Email: `admin@foodorder.com`
- Password: `Admin@123`

## 4. Frontend setup

```bash
cd frontend
cp .env.example .env   # points to http://localhost:5000/api by default
npm install
npm run dev             # starts the app on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

## 5. PayHere Sandbox configuration

1. Sign up for a sandbox merchant account at https://www.payhere.lk/.
2. Copy your **Merchant ID** and **Merchant Secret** into `backend/.env`:
   ```
   PAYHERE_MERCHANT_ID=xxxxxxx
   PAYHERE_MERCHANT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   PAYHERE_MODE=sandbox
   ```
3. PayHere needs to reach your **notify_url** (`PAYHERE_NOTIFY_URL`) as a public URL for the
   IPN (payment confirmation) webhook. For local development, expose your backend with ngrok:
   ```bash
   ngrok http 5000
   ```
   Then set `PAYHERE_NOTIFY_URL=https://<your-ngrok-id>.ngrok.io/api/payment/notify` in `.env`
   and restart the backend. Without this, the order will still be created, but the
   `paymentStatus` will stay `pending` until the webhook can reach your server.
4. Use PayHere's [sandbox test cards](https://support.payhere.lk/) to simulate a payment.

## 6. How the payment flow works

1. Customer adds items to cart and goes to Checkout.
2. Frontend calls `POST /api/orders` — creates an order (and its line items) in MySQL inside
   a transaction, with `paymentStatus: pending` (prices are recalculated server-side from the
   `food_items` table, never trusted from the client).
3. Frontend calls `POST /api/payment/initiate` — backend generates a signed MD5 hash per
   PayHere's checkout spec and returns the payment parameters.
4. Frontend calls `window.payhere.startPayment(params)` to open the PayHere Sandbox popup.
5. On completion, PayHere sends a **server-to-server** IPN request to `/api/payment/notify`.
   The backend verifies the signature and updates `paymentStatus` to `paid`/`failed`.
6. The customer is redirected to `/order-confirmation/:orderId`, which polls the order a few
   times in case the IPN hasn't arrived yet.

## 7. Database schema

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

## 8. Project structure

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

## 9. Notes on security
- Passwords are hashed with bcrypt; never stored in plain text.
- JWT is used for stateless authentication; admin-only routes are protected by role middleware.
- Order totals are always recalculated server-side — the frontend cart total is never trusted.
- Order creation runs inside a database transaction, so an order and its line items are
  always created together or not at all.
- PayHere's IPN signature is verified server-side before an order is marked as paid.

---

## Submission details (fill in before submitting)

- **Full Name:**
- **Email Address:**
- **Phone Number:**
- **GitHub Repository Link:**
- **Demo Video Link (Google Drive):**
"# FeastLine-Food-Ordering-System" 
"# FeastLine-Food-Ordering-System" 
