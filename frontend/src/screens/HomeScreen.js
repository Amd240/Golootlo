import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Image, StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useProducts } from '../ProductsContext';
import { useCart } from '../CartContext';
import { useTheme } from '../ThemeContext';
import { useRecentlyViewed } from '../RecentlyViewedContext';
import Footer from '../components/Footer';
import { SkeletonBlock, SkeletonRow, SkeletonGrid } from '../components/Skeleton';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const { products, categories, featuredProducts, loading, error, refetch } = useProducts();
  const { recentlyViewed } = useRecentlyViewed();
  const s = makeStyles(theme);

  if (loading) {
    return (
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        <SkeletonBlock width="100%" height={190} borderRadius={24} style={{ margin: 16, marginBottom: 0 }} />
        <View style={s.sectionHeader}>
          <SkeletonBlock width={140} height={18} />
        </View>
        <SkeletonRow count={3} />
        <View style={s.sectionHeader}>
          <SkeletonBlock width={140} height={18} />
        </View>
        <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} width={92} height={98} borderRadius={16} style={{ marginRight: 12 }} />
          ))}
        </View>
        <View style={s.sectionHeader}>
          <SkeletonBlock width={140} height={18} />
        </View>
        <SkeletonGrid count={6} />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <View style={s.centered}>
        <Text style={s.errorText}>Couldn't load products.</Text>
        <TouchableOpacity style={s.retryBtn} onPress={refetch}>
          <Text style={s.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient colors={['#6C63FF', '#8B7CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
        <View style={s.heroCircleLarge} />
        <View style={s.heroCircleSmall} />
        <View style={s.heroContent}>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>UP TO 50% OFF</Text>
          </View>
          <Text style={s.heroTitle}>Elevate Your{'\n'}Everyday Style</Text>
          <Text style={s.heroSub}>Curated picks, honest prices.</Text>
          <TouchableOpacity style={s.heroCta} onPress={() => navigation.navigate('Categories')}>
            <Text style={s.heroCtaText}>Shop Now →</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Floating trust strip — overlaps the hero for a layered feel */}
      <View style={s.trustStrip}>
        <View style={s.trustItem}>
          <Text style={s.trustIcon}>🚚</Text>
          <Text style={s.trustText}>Free Shipping</Text>
        </View>
        <View style={s.trustDivider} />
        <View style={s.trustItem}>
          <Text style={s.trustIcon}>🔒</Text>
          <Text style={s.trustText}>Secure Payment</Text>
        </View>
        <View style={s.trustDivider} />
        <View style={s.trustItem}>
          <Text style={s.trustIcon}>↩️</Text>
          <Text style={s.trustText}>Easy Returns</Text>
        </View>
      </View>

      <View style={s.sectionHeader}>
        <View style={s.sectionTitleRow}>
          <View style={s.sectionAccent} />
          <Text style={s.sectionTitle}>Featured Products</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Categories')}><Text style={s.seeAll}>See all</Text></TouchableOpacity>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={featuredProducts}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.featuredCard}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
            activeOpacity={0.9}
          >
            <View style={s.imageContainer}>
              <Image source={{ uri: item.image }} style={s.featuredImage} />
              <View style={s.ratingBadge}>
                <Text style={s.ratingText}>⭐ {item.rating}</Text>
              </View>
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardCategory}>{item.category}</Text>
              <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
              <View style={s.cardFooter}>
                <Text style={s.cardPrice}>PKR{item.price}</Text>
                <TouchableOpacity style={s.addBtn} onPress={() => addToCart(item)}>
                  <Text style={s.addBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={s.sectionHeader}>
        <View style={s.sectionTitleRow}>
          <View style={s.sectionAccent} />
          <Text style={s.sectionTitle}>Shop by Category</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
          <Text style={s.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={s.categoryCard}
            onPress={() => navigation.navigate('Categories', { screen: 'ProductList', params: { category: cat.name } })}
          >
            <LinearGradient colors={['#EDEBFF', '#F7F6FF']} style={s.categoryIconBadge}>
              <Text style={s.categoryIcon}>{cat.icon || '🛍️'}</Text>
            </LinearGradient>
            <Text style={s.categoryName}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {recentlyViewed.length > 0 && (
        <>
          <View style={s.sectionHeader}>
            <View style={s.sectionTitleRow}>
              <View style={s.sectionAccent} />
              <Text style={s.sectionTitle}>Recently Viewed</Text>
            </View>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={recentlyViewed}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.featuredCard}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
                activeOpacity={0.9}
              >
                <View style={s.imageContainer}>
                  <Image source={{ uri: item.image }} style={s.featuredImage} />
                </View>
                <View style={s.cardBody}>
                  <Text style={s.cardCategory}>{item.category}</Text>
                  <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
                  <View style={s.cardFooter}>
                    <Text style={s.cardPrice}>PKR{item.price}</Text>
                    <TouchableOpacity style={s.addBtn} onPress={() => addToCart(item)}>
                      <Text style={s.addBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <View style={s.sectionHeader}>
        <View style={s.sectionTitleRow}>
          <View style={s.sectionAccent} />
          <Text style={s.sectionTitle}>All Products</Text>
        </View>
      </View>

      <View style={s.productsGrid}>
        {products.map(item => (
          <TouchableOpacity
            key={item.id}
            style={s.productCard}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
            activeOpacity={0.9}
          >
            <Image source={{ uri: item.image }} style={s.productImage} />
            <View style={s.productBody}>
              <Text style={s.productCategory}>{item.category}</Text>
              <Text style={s.productName} numberOfLines={2}>{item.name}</Text>
              <View style={s.productRatingRow}>
                <Text style={s.productRating}>⭐ {item.rating}</Text>
              </View>
              <View style={s.productFooter}>
                <Text style={s.productPrice}>PKR{item.price}</Text>
                <TouchableOpacity style={s.productAddBtn} onPress={() => addToCart(item)}>
                  <Text style={s.productAddBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Footer />
    </ScrollView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background, padding: 20 },
  errorText: { color: theme.subtext, fontSize: 14, marginBottom: 12 },
  retryBtn: { backgroundColor: '#6C63FF', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '700' },

  hero: { margin: 16, marginBottom: 0, borderRadius: 24, padding: 26, paddingVertical: 32, overflow: 'hidden', position: 'relative', shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
  heroCircleLarge: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: -50 },
  heroCircleSmall: { position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.08)', bottom: -20, left: -20 },
  heroContent: { position: 'relative' },
  heroBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 14 },
  heroBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  heroTitle: { fontSize: 30, fontWeight: '800', color: '#fff', lineHeight: 36, marginBottom: 10 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 20 },
  heroCta: { backgroundColor: '#fff', alignSelf: 'flex-start', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 },
  heroCtaText: { color: '#6C63FF', fontWeight: '800', fontSize: 14 },

  trustStrip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: theme.card, marginHorizontal: 24, marginTop: -22, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6,
    zIndex: 2,
  },
  trustItem: { alignItems: 'center', flex: 1 },
  trustIcon: { fontSize: 16, marginBottom: 4 },
  trustText: { fontSize: 10, fontWeight: '700', color: theme.text, textAlign: 'center' },
  trustDivider: { width: 1, height: 28, backgroundColor: theme.border },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 24, marginBottom: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionAccent: { width: 4, height: 18, borderRadius: 2, backgroundColor: '#6C63FF', marginRight: 8 },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: theme.text },
  seeAll: { fontSize: 13, color: '#6C63FF', fontWeight: '700' },

  featuredCard: { backgroundColor: theme.card, borderRadius: 18, marginRight: 14, width: 175, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 5 },
  imageContainer: { position: 'relative' },
  featuredImage: { width: '100%', height: 130, backgroundColor: '#f0f0f0' },
  ratingBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  ratingText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cardBody: { padding: 10 },
  cardCategory: { fontSize: 10, color: '#6C63FF', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2, letterSpacing: 0.4 },
  cardName: { fontSize: 13, fontWeight: '700', color: theme.text, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: 15, fontWeight: '800', color: theme.text },
  addBtn: { backgroundColor: '#6C63FF', width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold', lineHeight: 24 },

  categoryCard: { width: 92, backgroundColor: theme.card, borderRadius: 16, alignItems: 'center', paddingVertical: 18, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  categoryIconBadge: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  categoryIcon: { fontSize: 24 },
  categoryName: { fontSize: 12, fontWeight: '700', color: theme.text, textAlign: 'center' },

  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, paddingBottom: 8 },
  productCard: { backgroundColor: theme.card, borderRadius: 18, margin: 6, width: '46%', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  productImage: { width: '100%', height: 140, backgroundColor: '#f0f0f0' },
  productBody: { padding: 10 },
  productCategory: { fontSize: 10, color: '#6C63FF', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2, letterSpacing: 0.4 },
  productName: { fontSize: 13, fontWeight: '700', color: theme.text, marginBottom: 4, lineHeight: 18 },
  productRatingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  productRating: { fontSize: 11, color: theme.subtext },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 14, fontWeight: '800', color: theme.text },
  productAddBtn: { backgroundColor: '#6C63FF', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 5 },
  productAddBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
