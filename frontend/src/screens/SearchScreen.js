import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useProducts } from '../ProductsContext';
import { useCart } from '../CartContext';
import { useTheme } from '../ThemeContext';

const DEBOUNCE_MS = 400;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const navigation = useNavigation();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const { products } = useProducts();
  const s = makeStyles(theme);

  // Wait until the user pauses typing before updating the value that actually
  // drives filtering — avoids re-filtering the whole product list on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // True while the user has typed something new but the debounce timer hasn't fired yet
  const isDebouncing = query !== debouncedQuery;

  const results = debouncedQuery.length > 1
    ? products.filter(p =>
        p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : [];

  return (
    <View style={s.container}>
      <Text style={s.heading}>Search</Text>
      <View style={s.searchBar}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.input}
          placeholder="Search products..."
          placeholderTextColor={theme.subtext}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {isDebouncing && query.length > 1 && (
          <ActivityIndicator size="small" color="#6C63FF" style={{ marginRight: 8 }} />
        )}
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={s.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isDebouncing && debouncedQuery.length > 1 && results.length === 0 && (
        <Text style={s.noResults}>No results for "{debouncedQuery}"</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() => navigation.navigate('Home', { screen: 'ProductDetail', params: { product: item } })}
          >
            <Image source={{ uri: item.image }} style={s.image} />
            <View style={s.info}>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.category}>{item.category}</Text>
              <Text style={s.price}>PKR{item.price}</Text>
            </View>
            <TouchableOpacity style={s.addBtn} onPress={() => addToCart(item)}>
              <Text style={s.addBtnText}>+</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  heading: { fontSize: 22, fontWeight: 'bold', margin: 16, color: theme.text },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 12, marginBottom: 12, elevation: 2, borderWidth: 1, borderColor: theme.border },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, height: 46, fontSize: 15, color: theme.text },
  clearBtn: { fontSize: 16, color: theme.subtext, padding: 4 },
  noResults: { textAlign: 'center', color: theme.subtext, marginTop: 40, fontSize: 15 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 12, elevation: 2 },
  image: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f0f0f0' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, fontWeight: '600', color: theme.text },
  category: { fontSize: 12, color: theme.subtext, marginTop: 2 },
  price: { fontSize: 14, fontWeight: 'bold', color: '#6C63FF', marginTop: 4 },
  addBtn: { backgroundColor: '#6C63FF', width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
