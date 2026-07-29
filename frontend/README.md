# Golootlo — Frontend (Mobile App)

A React Native e-commerce app built with Expo, connecting to the Golootlo backend API for a full shopping experience.

## Tech Stack

- **Framework:** React Native (Expo, blank template)
- **Navigation:** React Navigation
- **State Management:** React Context API (Theme, Cart, Wishlist, Auth)
- **API Communication:** Fetch/Axios against the Golootlo backend REST API
- **Auth:** JWT stored client-side, attached to authenticated requests

## Features

### Core
- User registration & login
- Browse products by category
- Product detail view
- Add to cart / wishlist
- Checkout flow with order placement
- Profile management (view/update, change password)
- Shipping address management
- Payment method management
- Light/dark theme support (ThemeContext)

### Bonus Features
- **Product Reviews & Ratings** — view and submit reviews on product pages
- **Recently Viewed Products** — tracks and displays recently browsed items
- **Skeleton Loading** — placeholder loading states while data fetches, instead of blank screens/spinners
- **Debounced Search** — search input waits for typing to pause before querying, reducing redundant API calls

## Project Structure

```
golootlo-frontend/
├── assets/            # Images, icons, fonts
├── components/         # Reusable UI components (ProductCard, SkeletonLoader, etc.)
├── context/            # ThemeContext, CartContext, WishlistContext, AuthContext
├── navigation/          # React Navigation stack/tab configuration
├── screens/            # App screens (Home, ProductDetail, Cart, Checkout, Profile, etc.)
├── services/ or api/    # API call functions (axios/fetch wrappers)
├── app.json             # Expo app config (name, icon, splash, etc.)
└── App.js               # App entry point
```

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure the API base URL.**
   Find wherever the API URL is set (likely in a `config.js`, `constants.js`, or `.env` file) and point it at your backend:
   - If testing on a physical device on the same Wi-Fi as your backend: use your machine's local network IP, e.g. `http://192.168.x.x:5000/api`
   - If using an emulator on the same machine as the backend: `http://localhost:5000/api` may work, but Android emulators often need `http://10.0.2.2:5000/api` instead.

3. **Start the Expo dev server:**
   ```bash
   npx expo start
   ```

4. **Run on a device/simulator:**
   - Scan the QR code with the Expo Go app (physical device), or
   - Press `a` for Android emulator / `i` for iOS simulator (in the terminal running Expo)

## Backend Dependency

This app requires the Golootlo backend to be running (see `README-backend.md`). Make sure:
- The backend server is up (`npm run dev` in the backend folder)
- The API base URL in this app matches wherever that backend is reachable
- CORS is enabled on the backend for your dev environment (should already be handled)

## Notes

- The app was rebranded from "ShopEase" to "Golootlo" — this affects `app.json`, screen titles, and any hardcoded branding strings.
- Auth tokens are stored client-side after login; expired tokens will require re-login.