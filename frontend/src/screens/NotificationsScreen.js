import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';

const STORAGE_KEY = 'shopease_notification_prefs';

const DEFAULT_PREFS = {
  orderUpdates: true,
  promotions: false,
  wishlistReminders: true,
  newArrivals: false,
};

const LABELS = {
  orderUpdates: { title: 'Order Updates', subtitle: 'Get notified when your order status changes' },
  promotions: { title: 'Promotions & Deals', subtitle: 'Sales, discounts, and special offers' },
  wishlistReminders: { title: 'Wishlist Reminders', subtitle: 'Reminders about items in your wishlist' },
  newArrivals: { title: 'New Arrivals', subtitle: 'Be first to know about new products' },
};

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  useEffect(() => {
    const load = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setPrefs(JSON.parse(saved));
    };
    load();
  }, []);

  const toggle = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {Object.keys(LABELS).map((key) => (
        <View key={key} style={s.row}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={s.title}>{LABELS[key].title}</Text>
            <Text style={s.subtitle}>{LABELS[key].subtitle}</Text>
          </View>
          <Switch
            value={prefs[key]}
            onValueChange={() => toggle(key)}
            trackColor={{ false: '#ddd', true: '#6C63FF' }}
            thumbColor={prefs[key] ? '#fff' : '#f4f3f4'}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  title: { fontSize: 14, fontWeight: '600', color: theme.text },
  subtitle: { fontSize: 12, color: theme.subtext, marginTop: 3 },
});
