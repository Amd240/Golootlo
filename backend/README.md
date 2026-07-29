# Golootlo — Backend

A full-featured REST API for the Golootlo e-commerce mobile app, built with Node.js, Express, and MongoDB Atlas.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (via Mongoose)
- **Auth:** JWT (JSON Web Tokens) + bcryptjs for password hashing
- **File Uploads:** Multer
- **Validation:** express-validator
- **Security/Logging:** Helmet, Morgan

## Features

### Core
- User registration & login (JWT-based auth)
- Profile management (view/update profile, change password)
- Product catalog with categories
- Cart management
- Wishlist management
- Order placement & checkout
- Shipping address management (backend-persisted)
- Payment method management (backend-persisted)
- Role-based admin access control

### Admin Panel (protected routes)
- Dashboard stats (user/product/category/order counts, revenue)
- View all registered users
- Promote/demote users (set admin role)
- Delete users
- View all orders (store-wide)

### Bonus Features
- Product Reviews & Ratings
- Recently Viewed Products
- Skeleton Loading states (frontend-facing, backend supports fast paginated fetches)
- Debounced Search (backend search endpoint optimized for frequent queries)

## Project Structure

```
shopease-backend/
├── config/           # DB connection, environment config
├── controllers/      # Route logic (auth, products, admin, orders, etc.)
├── middleware/        # auth.js (JWT verification), admin.js (role check), upload.js, errorHandler.js
├── models/            # Mongoose schemas (User, Product, Order, Review, etc.)
├── routes/            # Express route definitions
├── uploads/           # Uploaded product images
├── tests/             # Test scripts
├── seed.js            # Database seeding script
├── server.js           # App entry point
├── .env.example        # Environment variable template
└── Golootlo.postman_collection.json   # Full API collection for testing
```

## Setup Instructions

1. **Clone the repo and install dependencies:**
   ```bash
   npm install
   ```

2. **Create your `.env` file** (copy `.env.example` and fill in real values):
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
   JWT_SECRET=your_long_random_secret_string
   JWT_EXPIRES_IN=30d
   ```
   ⚠️ Never commit `.env` — it's already excluded via `.gitignore`.

3. **Run in development mode** (auto-restarts on file changes):
   ```bash
   npm run dev
   ```

4. **Server runs on** `http://localhost:5000` by default. API base path: `/api`.

## API Testing

Import `Golootlo.postman_collection.json` into Postman to test all endpoints. Set up an environment with a `baseUrl` variable (e.g. `http://localhost:5000/api`) and a `token` variable (auto-populated after login, or paste manually).

## Admin Access

To grant a user admin privileges, an existing admin must call `PUT /admin/users/:id/role`. To bootstrap the very first admin account, manually set `isAdmin: true` on a user document directly in MongoDB Atlas.

## Notes

- Passwords are hashed with bcrypt before storage — never stored in plaintext.
- JWT tokens expire based on `JWT_EXPIRES_IN` in `.env` — log in again after expiry.
- All `/admin/*` routes require both a valid token (`protect` middleware) and `isAdmin: true` (`adminOnly` middleware).