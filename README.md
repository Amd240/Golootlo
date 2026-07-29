# Golootlo

A full-stack e-commerce mobile app — React Native (Expo) frontend + Node.js/Express/MongoDB backend. Built as a course project, covering end-to-end functionality from authentication to checkout, plus an admin panel and several bonus features.

> Rebranded from an earlier working name, "ShopEase," to **Golootlo**.

## Repository Structure

This is a single monorepo containing both the frontend and backend as separate folders:

```
Golootlo/
├── backend/     ← Node.js/Express/MongoDB REST API
├── frontend/    ← React Native (Expo) mobile app
├── .gitignore
└── README.md    ← you are here
```

See `backend/README.md` and `frontend/README.md` for setup instructions specific to each half of the project.

## Tech Stack

**Frontend:** React Native (Expo), React Navigation, Context API (Theme/Cart/Wishlist/Auth)
**Backend:** Node.js, Express.js, MongoDB Atlas (Mongoose), JWT auth, bcrypt, Multer, Helmet, Morgan

## Core Features

- User registration, login, and profile management (JWT-based auth)
- Product catalog with categories, search, and product detail views
- Cart and wishlist management
- Checkout & order placement, with shipping address selection/validation
- Shipping address and payment method management (persisted server-side)
- Role-based admin panel (dashboard stats, user management, order oversight)

## Bonus Features

- Product Reviews & Ratings
- Recently Viewed Products
- Skeleton Loading states
- Debounced Search

## Quick Start

**1. Backend:**
```bash
cd backend
npm install
# create .env from .env.example and fill in real values
npm run dev
```

**2. Frontend:**
```bash
cd frontend
npm install
# point the API base URL (in config/) at your running backend
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `a`/`i` for an Android/iOS emulator.

## API Testing

Import `backend/Golootlo.postman_collection.json` into Postman to test all backend endpoints directly, independent of the mobile app.

## Notes for Reviewers

- `.env` files are intentionally excluded from this repo (see `.gitignore`) since they contain live database credentials and secrets. Use `.env.example` in `backend/` as a template.
- Admin access requires `isAdmin: true` on a user document — see `backend/README.md` for how this is granted.
