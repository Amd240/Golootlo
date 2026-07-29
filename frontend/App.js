import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { CartProvider } from './src/CartContext';
import { ThemeProvider } from './src/ThemeContext';
import { WishlistProvider } from './src/WishlistContext';
import { AuthProvider } from './src/AuthContext';
import { ProductsProvider } from './src/ProductsContext';
import { RecentlyViewedProvider } from './src/RecentlyViewedContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProductsProvider>
          <RecentlyViewedProvider>
            <WishlistProvider>
              <CartProvider>
                <NavigationContainer>
                  <RootNavigator />
                </NavigationContainer>
              </CartProvider>
            </WishlistProvider>
          </RecentlyViewedProvider>
        </ProductsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
