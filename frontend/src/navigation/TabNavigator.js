import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import SearchScreen from '../screens/SearchScreen';
import WishlistScreen from '../screens/WishlistScreen.js';
import ProfileStackNavigator from './ProfileStackNavigator';

import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { useTheme } from '../ThemeContext';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const CategoriesStack = createNativeStackNavigator();

function HomeStackNavigator() {
  const { theme } = useTheme();
  return (
    <HomeStack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.card }, headerTintColor: theme.text }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Home' }} />
      <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
    </HomeStack.Navigator>
  );
}

function CategoriesStackNavigator() {
  const { theme } = useTheme();
  return (
    <CategoriesStack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.card }, headerTintColor: theme.text }}>
      <CategoriesStack.Screen name="CategoriesMain" component={CategoriesScreen} options={{ title: 'Categories' }} />
      <CategoriesStack.Screen name="ProductList" component={ProductListScreen} options={({ route }) => ({ title: route.params?.category || 'Products' })} />
      <CategoriesStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
    </CategoriesStack.Navigator>
  );
}

export default function TabNavigator() {
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Categories') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Cart') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Wishlist') iconName = focused ? 'heart' : 'heart-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: theme.subtext,
        tabBarStyle: { backgroundColor: theme.tabBar, borderTopColor: theme.border },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Categories" component={CategoriesStackNavigator} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} options={{ tabBarBadge: wishlist.length > 0 ? wishlist.length : undefined }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarBadge: cartCount > 0 ? cartCount : undefined }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}
