import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { apiFetch } from '../config/api';
import { useRecentlyViewed } from '../RecentlyViewedContext';
import { SkeletonProductCard } from '../components/Skeleton';

export default function ProductDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { product } = route.params;
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { trackView } = useRecentlyViewed();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const s = makeStyles(theme);
  const wishlisted = isWishlisted(product.id);

  useEffect(() => {
    trackView(product.id);
  }, [product.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setRelatedLoading(true);
      try {
        const data = await apiFetch(`/products/${product.id}/related`);
        if (!cancelled) {
          setRelated(
            data.map((p) => ({
              id: p._id,
              name: p.name,
              price: p.price,
              image: (p.images && p.images[0]) || 'https://via.placeholder.com/400x400.png?text=Golootlo',
              category: p.category?.name || 'Uncategorized',
              rating: p.rating ?? 0,
            }))
          );
        }
      } catch (err) {
        // Recommendations are a nice-to-have — fail silently
      } finally {
        if (!cancelled) setRelatedLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [product.id]);

  // Reviews & ratings
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Related products ("you may also like")
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const data = await apiFetch(`/products/${product.id}/reviews`);
      setReviews(data);
      const mine = user && data.find((r) => r.user === user._id || r.user === user.id);
      if (mine) {
        setMyRating(mine.rating);
        setMyComment(mine.comment || '');
      }
    } catch (err) {
      // Silently ignore — reviews are a nice-to-have, not core to the page
    } finally {
      setReviewsLoading(false);
    }
  }, [product.id, user]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign in required', 'Please log in to leave a review.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    if (myRating < 1) {
      Alert.alert('Choose a rating', 'Please tap a star to rate this product.');
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch(`/products/${product.id}/reviews`, {
        method: 'POST',
        body: { rating: myRating, comment: myComment },
      });
      await loadReviews();
    } catch (err) {
      Alert.alert('Couldn\'t submit review', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = () => {
    if (wishlisted) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  return (
    <ScrollView style={s.container}>
      <View style={s.imageContainer}>
        <Image source={{ uri: product.image }} style={s.image} />
        <TouchableOpacity style={s.heartBtn} onPress={handleWishlist}>
          <Text style={s.heartIcon}>{wishlisted ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>
      <View style={s.body}>
        <Text style={s.category}>{product.category}</Text>
        <Text style={s.name}>{product.name}</Text>
        <View style={s.row}>
          <Text style={s.price}>PKR{product.price}</Text>
          <Text style={s.rating}>⭐ {avgRating} {reviews.length > 0 ? `(${reviews.length})` : ''}</Text>
        </View>
        <Text style={s.descLabel}>Description</Text>
        <Text style={s.desc}>{product.description || 'No description available.'}</Text>
        <Text style={s.descLabel}>Quantity</Text>
        <View style={s.qtyRow}>
          <TouchableOpacity style={s.qtyBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}>
            <Text style={s.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={s.qtyText}>{quantity}</Text>
          <TouchableOpacity style={s.qtyBtn} onPress={() => setQuantity(q => q + 1)}>
            <Text style={s.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={s.btnRow}>
          <TouchableOpacity style={s.wishlistBtn} onPress={handleWishlist}>
            <Text style={s.wishlistBtnText}>{wishlisted ? '❤️ Wishlisted' : '🤍 Wishlist'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.cartBtn, added && s.cartBtnAdded]} onPress={handleAddToCart}>
            <Text style={s.cartBtnText}>{added ? '✓ Added!' : 'Add to Cart'}</Text>
          </TouchableOpacity>
        </View>

        {(relatedLoading || related.length > 0) && (
          <View style={s.relatedSection}>
            <Text style={s.descLabel}>You May Also Like</Text>
            {relatedLoading ? (
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <SkeletonProductCard width={140} imageHeight={100} style={{ marginRight: 12 }} />
                <SkeletonProductCard width={140} imageHeight={100} style={{ marginRight: 12 }} />
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                {related.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={s.relatedCard}
                    onPress={() => navigation.push('ProductDetail', { product: item })}
                  >
                    <Image source={{ uri: item.image }} style={s.relatedImage} />
                    <View style={s.relatedBody}>
                      <Text style={s.relatedName} numberOfLines={1}>{item.name}</Text>
                      <Text style={s.relatedPrice}>PKR{item.price}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Reviews & Ratings */}
        <View style={s.reviewsSection}>
          <Text style={s.descLabel}>Reviews {reviews.length > 0 ? `(${reviews.length})` : ''}</Text>

          <View style={s.writeReviewCard}>
            <Text style={s.writeReviewLabel}>Your rating</Text>
            <View style={s.starPicker}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity key={n} onPress={() => setMyRating(n)}>
                  <Text style={s.starPickerIcon}>{n <= myRating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={s.reviewInput}
              placeholder="Share your thoughts about this product (optional)"
              placeholderTextColor={theme.subtext}
              value={myComment}
              onChangeText={setMyComment}
              multiline
            />
            <TouchableOpacity style={s.submitReviewBtn} onPress={handleSubmitReview} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={s.submitReviewBtnText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>

          {reviewsLoading ? (
            <ActivityIndicator color="#6C63FF" style={{ marginTop: 16 }} />
          ) : reviews.length === 0 ? (
            <Text style={s.noReviewsText}>No reviews yet — be the first to share your experience.</Text>
          ) : (
            reviews.map((r) => (
              <View key={r._id} style={s.reviewItem}>
                <View style={s.reviewItemHeader}>
                  <Text style={s.reviewItemName}>{r.userName}</Text>
                  <Text style={s.reviewItemStars}>{'⭐'.repeat(r.rating)}</Text>
                </View>
                {!!r.comment && <Text style={s.reviewItemComment}>{r.comment}</Text>}
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 280, backgroundColor: '#f0f0f0' },
  heartBtn: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.9)', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  heartIcon: { fontSize: 22 },
  body: { padding: 20 },
  category: { fontSize: 12, color: '#6C63FF', fontWeight: '600', textTransform: 'uppercase', marginBottom: 6 },
  name: { fontSize: 22, fontWeight: 'bold', color: theme.text, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  price: { fontSize: 22, fontWeight: 'bold', color: '#6C63FF' },
  rating: { fontSize: 13, color: theme.subtext },
  descLabel: { fontSize: 15, fontWeight: '700', color: theme.text, marginBottom: 6 },
  desc: { fontSize: 14, color: theme.subtext, lineHeight: 22, marginBottom: 20 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  qtyBtn: { backgroundColor: theme.card, width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border },
  qtyBtnText: { fontSize: 20, color: theme.text },
  qtyText: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, color: theme.text },
  btnRow: { flexDirection: 'row', gap: 10 },
  wishlistBtn: { flex: 1, borderWidth: 2, borderColor: '#6C63FF', borderRadius: 12, padding: 14, alignItems: 'center' },
  wishlistBtnText: { color: '#6C63FF', fontSize: 14, fontWeight: 'bold' },
  cartBtn: { flex: 2, backgroundColor: '#6C63FF', borderRadius: 12, padding: 14, alignItems: 'center' },
  cartBtnAdded: { backgroundColor: '#2DC653' },
  cartBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  reviewsSection: { marginTop: 28 },
  relatedSection: { marginTop: 28 },
  relatedCard: { width: 140, backgroundColor: theme.card, borderRadius: 14, overflow: 'hidden', marginRight: 12, borderWidth: 1, borderColor: theme.border },
  relatedImage: { width: '100%', height: 100, backgroundColor: '#f0f0f0' },
  relatedBody: { padding: 8 },
  relatedName: { fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 2 },
  relatedPrice: { fontSize: 12, fontWeight: '800', color: '#6C63FF' },
  writeReviewCard: {
    backgroundColor: theme.card, borderRadius: 16, padding: 16, marginTop: 10, marginBottom: 20,
    borderWidth: 1, borderColor: theme.border,
  },
  writeReviewLabel: { fontSize: 13, fontWeight: '700', color: theme.text, marginBottom: 8 },
  starPicker: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  starPickerIcon: { fontSize: 26 },
  reviewInput: {
    borderWidth: 1, borderColor: theme.border, borderRadius: 10, padding: 10,
    minHeight: 60, textAlignVertical: 'top', color: theme.text, fontSize: 13, marginBottom: 12,
  },
  submitReviewBtn: { backgroundColor: '#6C63FF', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  submitReviewBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  noReviewsText: { color: theme.subtext, fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  reviewItem: { borderTopWidth: 1, borderTopColor: theme.border, paddingVertical: 12 },
  reviewItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewItemName: { fontSize: 13, fontWeight: '700', color: theme.text },
  reviewItemStars: { fontSize: 11 },
  reviewItemComment: { fontSize: 13, color: theme.subtext, lineHeight: 19 },
});
