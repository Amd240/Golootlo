import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { apiFetch } from '../config/api';

// No real payment processing exists (or is required) in this project - the
// backend only ever stores the last 4 digits for display, never a full card number.
export default function PaymentMethodsScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/payment-methods');
      setCards(data);
    } catch (err) {
      console.warn('Failed to load payment methods:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleAddCard = async () => {
    if (!cardNumber || !cardName || !expiry) {
      Alert.alert('Missing Info', 'Please fill in all card fields.');
      return;
    }
    setSaving(true);
    try {
      const newCard = await apiFetch('/payment-methods', {
        method: 'POST',
        body: { cardNumber, cardName, expiry },
      });
      setCards((prev) => [newCard, ...prev]);
      setCardNumber('');
      setCardName('');
      setExpiry('');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await apiFetch(`/payment-methods/${id}`, { method: 'DELETE' });
      setCards((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.sectionTitle}>Saved Cards</Text>
      {loading ? (
        <ActivityIndicator color="#6C63FF" />
      ) : cards.length === 0 ? (
        <Text style={s.emptyText}>No cards saved yet.</Text>
      ) : (
        cards.map((card) => (
          <View key={card._id} style={s.cardRow}>
            <Ionicons name="card-outline" size={22} color="#6C63FF" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.cardText}>•••• •••• •••• {card.last4}</Text>
              <Text style={s.cardSubtext}>{card.cardName} · exp {card.expiry}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(card._id)}>
              <Ionicons name="trash-outline" size={20} color="#E5484D" />
            </TouchableOpacity>
          </View>
        ))
      )}

      <Text style={s.sectionTitle}>Add a Card</Text>
      <Text style={s.label}>Card Number</Text>
      <TextInput style={s.input} value={cardNumber} onChangeText={setCardNumber} keyboardType="number-pad" placeholder="1234 5678 9012 3456" placeholderTextColor={theme.subtext} />

      <Text style={s.label}>Name on Card</Text>
      <TextInput style={s.input} value={cardName} onChangeText={setCardName} placeholderTextColor={theme.subtext} />

      <Text style={s.label}>Expiry (MM/YY)</Text>
      <TextInput style={s.input} value={expiry} onChangeText={setExpiry} placeholder="12/28" placeholderTextColor={theme.subtext} />

      <TouchableOpacity style={s.button} onPress={handleAddCard} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Add Card</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 12, marginTop: 8 },
  emptyText: { color: theme.subtext, fontSize: 13, marginBottom: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: theme.border },
  cardText: { fontSize: 14, fontWeight: '600', color: theme.text },
  cardSubtext: { fontSize: 12, color: theme.subtext, marginTop: 2 },
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
  button: { backgroundColor: '#6C63FF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 22 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
