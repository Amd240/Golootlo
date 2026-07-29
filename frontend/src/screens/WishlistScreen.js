import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWishlist } from '../WishlistContext';
import { useCart } from '../CartContext';
import { useTheme } from '../ThemeContext';

export default function WishlistScreen() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const s = makeStyles(theme);

  if (wishlist.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyIcon}>❤️</Text>
        <Text style={s.emptyTitle}>No favorites yet</Text>
        <Text style={s.emptySubtitle}>Tap the heart on any product to save it here</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.heading}>My Wishlist</Text>
      <FlatList
        data={wishlist}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <View style={s.card}>
            <TouchableOpacity
              style={s.imageWrap}
              onPress={() => navigation.navigate('Home', { screen: 'ProductDetail', params: { product: item } })}
            >
              <Image source={{ uri: item.image }} style={s.image} />
            </TouchableOpacity>
            <View style={s.info}>
              <Text style={s.category}>{item.category}</Text>
              <Text style={s.name} numberOfLines={2}>{item.name}</Text>
              <Text style={s.rating}>⭐ {item.rating}</Text>
              <Text style={s.price}>PKR{item.price}</Text>
            </View>
            <View style={s.actions}>
              <TouchableOpacity style={s.removeBtn} onPress={() => removeFromWishlist(item.id)}>
                <Text style={s.removeBtnText}>♥</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.cartBtn} onPress={() => addToCart(item)}>
                <Text style={s.cartBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  heading: { fontSize: 22, fontWeight: 'bold', margin: 16, color: theme.text },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { flexDirection: 'row', backgroundColor: theme.card, borderRadius: 16, marginBottom: 12, overflow: 'hidden', elevation: 2 },
  imageWrap: { width: 100 },
  image: { width: 100, height: 110, backgroundColor: '#f0f0f0' },
  info: { flex: 1, padding: 10, justifyContent: 'center' },
  category: { fontSize: 10, color: '#6C63FF', fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  name: { fontSize: 13, fontWeight: '700', color: theme.text, marginBottom: 4 },
  rating: { fontSize: 11, color: theme.subtext, marginBottom: 4 },
  price: { fontSize: 15, fontWeight: 'bold', color: '#6C63FF' },
  actions: { justifyContent: 'space-around', alignItems: 'center', padding: 10 },
  removeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffe5e5', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  removeBtnText: { fontSize: 18, color: '#e53935' },
  cartBtn: { backgroundColor: '#6C63FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  cartBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background, padding: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: theme.subtext, textAlign: 'center' },
});
