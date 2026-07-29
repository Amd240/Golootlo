import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { apiFetch } from '../config/api';

const MENU_ITEMS = [
  { label: 'Edit Profile', screen: 'EditProfile' },
  { label: 'Shipping Address', screen: 'ShippingAddress' },
  { label: 'Payment Methods', screen: 'PaymentMethods' },
  { label: 'Notifications', screen: 'Notifications' },
  { label: 'Help & Support', screen: 'HelpSupport' },
];

const STATUS_COLOR = {
  pending: '#F9844A',
  processing: '#F9844A',
  shipped: '#6C63FF',
  delivered: '#2DC653',
  cancelled: '#E5484D',
};

export default function ProfileScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const s = makeStyles(theme);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const data = await apiFetch('/orders');
      setOrders(data);
    } catch (err) {
      console.warn('Failed to load orders:', err.message);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // Refetch every time the Profile tab comes into focus, so a fresh checkout shows up immediately
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const initials = (user?.name || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        <Text style={s.name}>{user?.name || 'ShopEase User'}</Text>
        <Text style={s.email}>{user?.email || ''}</Text>
      </View>

      {/* Dark Mode Toggle */}
      <Text style={s.sectionTitle}>Preferences</Text>
      <View style={s.menuItem}>
        <Text style={s.menuText}>🌙  Dark Mode</Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#ddd', true: '#6C63FF' }}
          thumbColor={isDark ? '#fff' : '#f4f3f4'}
        />
      </View>

      {/* Order History - real orders from the backend */}
      <Text style={s.sectionTitle}>Order History</Text>
      {loadingOrders ? (
        <View style={s.emptyState}>
          <ActivityIndicator color="#6C63FF" />
        </View>
      ) : orders.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>📦</Text>
          <Text style={s.emptyText}>No orders yet</Text>
          <Text style={s.emptySubtext}>Your orders will show up here once you check out.</Text>
        </View>
      ) : (
        orders.map((order) => (
          <View key={order._id} style={s.orderCard}>
            <View style={s.orderRow}>
              <Text style={s.orderId}>#{order._id.slice(-6).toUpperCase()}</Text>
              <Text style={[s.status, { color: STATUS_COLOR[order.status] || theme.subtext }]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
            <Text style={s.orderDate}>
              {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </Text>
            <Text style={s.orderTotal}>PKR {order.totalAmount.toFixed(2)}</Text>
          </View>
        ))
      )}

      {/* Account Options */}
      <Text style={s.sectionTitle}>Account</Text>
      {MENU_ITEMS.map((item) => (
        <TouchableOpacity key={item.screen} style={s.menuItem} onPress={() => navigation.navigate(item.screen)}>
          <Text style={s.menuText}>{item.label}</Text>
          <Text style={s.menuArrow}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={s.logoutButton} onPress={handleLogout}>
        <Text style={s.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { backgroundColor: '#6C63FF', alignItems: 'center', paddingVertical: 32, paddingTop: 48 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 16, marginTop: 20, marginBottom: 8, color: theme.text },
  emptyState: { backgroundColor: theme.card, marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 28, alignItems: 'center' },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 15, fontWeight: '700', color: theme.text, marginBottom: 4 },
  emptySubtext: { fontSize: 12, color: theme.subtext, textAlign: 'center' },
  orderCard: { backgroundColor: theme.card, marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 14, elevation: 2 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  orderId: { fontWeight: '700', color: theme.text },
  status: { fontSize: 13, fontWeight: '600' },
  orderDate: { fontSize: 12, color: theme.subtext, marginBottom: 4 },
  orderTotal: { fontSize: 15, fontWeight: 'bold', color: '#6C63FF' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.card, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 16, elevation: 1 },
  menuText: { fontSize: 14, color: theme.text },
  menuArrow: { fontSize: 18, color: theme.subtext },
  logoutButton: { marginHorizontal: 16, marginTop: 8, marginBottom: 28, backgroundColor: 'rgba(229,72,77,0.1)', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: '#E5484D', fontSize: 15, fontWeight: '700' },
});
