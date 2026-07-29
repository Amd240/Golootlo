import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useProducts } from '../ProductsContext';
import { useCart } from '../CartContext';
import { useTheme } from '../ThemeContext';
import { SkeletonGrid } from '../components/Skeleton';

export default function ProductListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params;
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const { getProductsByCategory, loading } = useProducts();
  const s = makeStyles(theme);
  const filtered = getProductsByCategory(category);

  if (loading) {
    return (
      <ScrollView style={s.container}>
        <SkeletonGrid count={6} />
      </ScrollView>
    );
  }

  return (
    <View style={s.container}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={s.grid}
        ListEmptyComponent={<Text style={s.empty}>No products found.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
          >
            <Image source={{ uri: item.image }} style={s.image} />
            <View style={s.body}>
              <Text style={s.category}>{item.category}</Text>
              <Text style={s.name}>{item.name}</Text>
              <View style={s.row}>
                <Text style={s.rating}>⭐ {item.rating}</Text>
              </View>
              <View style={s.footer}>
                <Text style={s.price}>PKR{item.price}</Text>
                <TouchableOpacity style={s.addBtn} onPress={() => addToCart(item)}>
                  <Text style={s.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background },
  grid: { padding: 8 },
  card: { flex: 1, margin: 6, backgroundColor: theme.card, borderRadius: 16, overflow: 'hidden', elevation: 2 },
  image: { width: '100%', height: 130, backgroundColor: '#f0f0f0' },
  body: { padding: 10 },
  category: { fontSize: 10, color: '#6C63FF', fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  name: { fontSize: 13, fontWeight: '700', color: theme.text, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rating: { fontSize: 11, color: theme.subtext },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 14, fontWeight: 'bold', color: theme.text },
  addBtn: { backgroundColor: '#6C63FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 40, color: theme.subtext },
});
