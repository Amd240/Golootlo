import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useProducts } from '../ProductsContext';
import { useTheme } from '../ThemeContext';
import { SkeletonBlock } from '../components/Skeleton';

const COLORS = ['#FF6B6B', '#6C63FF', '#48CAE4', '#2DC653', '#F9844A', '#9B5DE5'];

export default function CategoriesScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { categories, loading } = useProducts();
  const s = makeStyles(theme);

  if (loading) {
    return (
      <View style={s.container}>
        <Text style={s.heading}>All Categories</Text>
        <View style={[s.grid, { flexDirection: 'row', flexWrap: 'wrap' }]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} width="46%" height={120} borderRadius={16} style={{ margin: 6 }} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.heading}>All Categories</Text>
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={s.grid}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[s.card, { backgroundColor: COLORS[index % COLORS.length] }]}
            onPress={() => navigation.navigate('ProductList', { category: item.name })}
          >
            <Text style={s.cardName}>{item.name}</Text>
            <Text style={s.cardSub}>Shop now →</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background },
  heading: { fontSize: 22, fontWeight: 'bold', margin: 16, color: theme.text },
  grid: { paddingHorizontal: 12, paddingBottom: 24 },
  card: { flex: 1, margin: 6, borderRadius: 16, padding: 24, minHeight: 120, justifyContent: 'flex-end' },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  cardSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
});
