import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';
import { apiFetch } from '../config/api';

export default function ShippingAddressScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/auth/addresses');
      setAddresses(data);
    } catch (err) {
      console.warn('Failed to load addresses:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleAdd = async () => {
    if (!fullName || !addressLine || !city) {
      Alert.alert('Missing Info', 'Please fill in at least name, address, and city.');
      return;
    }
    setSaving(true);
    try {
      const updated = await apiFetch('/auth/addresses', {
        method: 'POST',
        body: { fullName, addressLine, city, postalCode, phone },
      });
      setAddresses(updated);
      setFullName('');
      setAddressLine('');
      setCity('');
      setPostalCode('');
      setPhone('');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (addressId) => {
    Alert.alert('Remove Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const updated = await apiFetch(`/auth/addresses/${addressId}`, { method: 'DELETE' });
            setAddresses(updated);
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.sectionTitle}>Saved Addresses</Text>
      {loading ? (
        <ActivityIndicator color="#6C63FF" />
      ) : addresses.length === 0 ? (
        <Text style={s.emptyText}>No addresses saved yet.</Text>
      ) : (
        addresses.map((addr) => (
          <View key={addr._id} style={s.addressCard}>
            <View style={{ flex: 1 }}>
              <Text style={s.addressName}>{addr.fullName}</Text>
              <Text style={s.addressLine}>{addr.addressLine}, {addr.city} {addr.postalCode}</Text>
              {!!addr.phone && <Text style={s.addressPhone}>{addr.phone}</Text>}
            </View>
            <TouchableOpacity onPress={() => handleDelete(addr._id)}>
              <Text style={s.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <Text style={s.sectionTitle}>Add New Address</Text>
      <Text style={s.label}>Full Name</Text>
      <TextInput style={s.input} value={fullName} onChangeText={setFullName} placeholderTextColor={theme.subtext} />

      <Text style={s.label}>Address Line</Text>
      <TextInput style={s.input} value={addressLine} onChangeText={setAddressLine} placeholder="House no, street" placeholderTextColor={theme.subtext} />

      <Text style={s.label}>City</Text>
      <TextInput style={s.input} value={city} onChangeText={setCity} placeholderTextColor={theme.subtext} />

      <Text style={s.label}>Postal Code</Text>
      <TextInput style={s.input} value={postalCode} onChangeText={setPostalCode} keyboardType="number-pad" placeholderTextColor={theme.subtext} />

      <Text style={s.label}>Phone</Text>
      <TextInput style={s.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="03001234567" placeholderTextColor={theme.subtext} />

      <TouchableOpacity style={s.button} onPress={handleAdd} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Save Address</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 12, marginTop: 8 },
  emptyText: { color: theme.subtext, fontSize: 13, marginBottom: 12 },
  addressCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: theme.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: theme.border },
  addressName: { fontSize: 14, fontWeight: '700', color: theme.text },
  addressLine: { fontSize: 12, color: theme.subtext, marginTop: 2 },
  addressPhone: { fontSize: 12, color: theme.subtext, marginTop: 2 },
  removeText: { color: '#E5484D', fontSize: 12, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: theme.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
  },
  button: { backgroundColor: '#6C63FF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
