import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
import { useCart } from '../CartContext';
import { useTheme } from '../ThemeContext';
import { apiFetch } from '../config/api';
import { useNavigation } from '@react-navigation/native';

export default function CartScreen() {
  const { cart, removeFromCart, updateQuantity, cartTotal, refreshCart, isOffline, pendingCount } = useCart();
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const [placingOrder, setPlacingOrder] = useState(false);
  const navigation = useNavigation();

  // Modal state for the address flow
  const [addressModal, setAddressModal] = useState({
    visible: false,
    mode: null, // 'noAddress' | 'chooseAddress'
    mostRecent: null,
  });

  const closeAddressModal = () => setAddressModal({ visible: false, mode: null, mostRecent: null });

  const handleCheckout = async () => {
    if (isOffline || pendingCount > 0) {
      Alert.alert(
        "You're offline",
        'Checkout needs an internet connection so your order reaches the store. Your cart changes are saved and will sync automatically once you\'re back online.'
      );
      return;
    }

    // Step 1: Fetch saved addresses first, before doing anything else
    let addresses = [];
    try {
      addresses = await apiFetch('/auth/addresses');
    } catch (err) {
      Alert.alert('Error', 'Could not check your saved addresses. Please try again.');
      return;
    }

    // Step 2: No addresses at all — block checkout, show custom modal
    if (addresses.length === 0) {
      setAddressModal({ visible: true, mode: 'noAddress', mostRecent: null });
      return;
    }

    // Step 3: They have at least one address — show custom modal to choose
    const mostRecent = addresses[addresses.length - 1];
    setAddressModal({ visible: true, mode: 'chooseAddress', mostRecent });
  };

  const goAddAddress = () => {
    closeAddressModal();
    navigation.navigate('Profile', { screen: 'ShippingAddress' });
  };

  const placeOrder = async (shippingAddress) => {
    closeAddressModal();
    setPlacingOrder(true);
    try {
      await apiFetch('/orders', {
        method: 'POST',
        body: { shippingAddress, paymentMethod: 'Cash on Delivery' },
      });

      Alert.alert('Order Placed!', 'Thank you for your purchase.');
      await refreshCart(); // backend already cleared the cart server-side
    } catch (err) {
      Alert.alert('Checkout Failed', err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyIcon}>🛒</Text>
        <Text style={s.emptyText}>Your cart is empty</Text>
        {isOffline && (
          <View style={[s.offlineBanner, { marginTop: 16 }]}>
            <Text style={s.offlineBannerText}>You're offline — showing your last saved cart.</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.heading}>My Cart</Text>
      {(isOffline || pendingCount > 0) && (
        <View style={s.offlineBanner}>
          <Text style={s.offlineBannerText}>
            {isOffline
              ? "You're offline — changes are saved and will sync when you're back online."
              : `Syncing ${pendingCount} change${pendingCount === 1 ? '' : 's'}...`}
          </Text>
        </View>
      )}

      <FlatList
        data={cart}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.info}>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.price}>PKR{item.price}</Text>
            </View>
            <View style={s.controls}>
              <TouchableOpacity style={s.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                <Text style={s.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={s.qty}>{item.quantity}</Text>
              <TouchableOpacity style={s.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                <Text style={s.qtyBtnText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.removeBtn} onPress={() => removeFromCart(item.id)}>
                <Text style={s.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={s.footer}>
        <Text style={s.total}>Total: PKR{cartTotal.toFixed(2)}</Text>
        <TouchableOpacity
          style={[s.checkoutBtn, (isOffline || pendingCount > 0) && s.checkoutBtnDisabled]}
          onPress={handleCheckout}
          disabled={placingOrder}
        >
          {placingOrder ? <ActivityIndicator color="#fff" /> : <Text style={s.checkoutText}>Checkout</Text>}
        </TouchableOpacity>
      </View>

      {/* Custom address modal — works reliably on web, unlike multi-button Alert.alert */}
      <Modal
        visible={addressModal.visible}
        transparent
        animationType="fade"
        onRequestClose={closeAddressModal}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            {addressModal.mode === 'noAddress' && (
              <>
                <Text style={s.modalTitle}>Address Required</Text>
                <Text style={s.modalMessage}>
                  You haven't added a shipping address yet. Please add one before placing your order.
                </Text>
                <View style={s.modalButtonRow}>
                  <TouchableOpacity style={s.modalBtnSecondary} onPress={closeAddressModal}>
                    <Text style={s.modalBtnSecondaryText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.modalBtnPrimary} onPress={goAddAddress}>
                    <Text style={s.modalBtnPrimaryText}>Add Address</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {addressModal.mode === 'chooseAddress' && addressModal.mostRecent && (
              <>
                <Text style={s.modalTitle}>Shipping Address</Text>
                <Text style={s.modalMessage}>Use your saved address?</Text>
                <View style={s.modalAddressCard}>
                  <Text style={s.modalAddressName}>{addressModal.mostRecent.fullName}</Text>
                  <Text style={s.modalAddressLine}>
                    {addressModal.mostRecent.addressLine}, {addressModal.mostRecent.city}
                  </Text>
                </View>
                <View style={s.modalButtonRow}>
                  <TouchableOpacity style={s.modalBtnSecondary} onPress={closeAddressModal}>
                    <Text style={s.modalBtnSecondaryText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.modalBtnSecondary} onPress={goAddAddress}>
                    <Text style={s.modalBtnSecondaryText}>Add New</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.modalBtnPrimary}
                    onPress={() => placeOrder(addressModal.mostRecent)}
                  >
                    <Text style={s.modalBtnPrimaryText}>Use This</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  heading: { fontSize: 22, fontWeight: 'bold', margin: 16, color: theme.text },
  card: { backgroundColor: theme.card, marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 14, elevation: 2 },
  info: { marginBottom: 10 },
  name: { fontSize: 15, fontWeight: '600', color: theme.text },
  price: { fontSize: 14, color: '#6C63FF', fontWeight: 'bold', marginTop: 2 },
  controls: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { backgroundColor: theme.background, width: 30, height: 30, borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border },
  qtyBtnText: { fontSize: 16, fontWeight: 'bold', color: theme.text },
  qty: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 12, color: theme.text },
  removeBtn: { marginLeft: 'auto', backgroundColor: '#ffe5e5', borderRadius: 6, padding: 6 },
  removeBtnText: { color: '#e53935', fontSize: 12, fontWeight: '600' },
  footer: { backgroundColor: theme.card, padding: 20, borderTopWidth: 1, borderTopColor: theme.border },
  total: { fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 12 },
  checkoutBtn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center' },
  checkoutBtnDisabled: { backgroundColor: '#A9A4E8' },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  offlineBanner: { backgroundColor: '#FFF3CD', marginHorizontal: 16, marginBottom: 10, borderRadius: 10, padding: 10 },
  offlineBannerText: { color: '#8A6D1D', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 18, color: theme.subtext },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalBox: { backgroundColor: theme.card, borderRadius: 16, padding: 20, width: '100%', maxWidth: 420 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 8 },
  modalMessage: { fontSize: 14, color: theme.subtext, marginBottom: 16, lineHeight: 20 },
  modalAddressCard: { backgroundColor: theme.background, borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: theme.border },
  modalAddressName: { fontSize: 14, fontWeight: '700', color: theme.text },
  modalAddressLine: { fontSize: 12, color: theme.subtext, marginTop: 2 },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' },
  modalBtnPrimary: { backgroundColor: '#6C63FF', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16 },
  modalBtnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  modalBtnSecondary: { backgroundColor: theme.background, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.border },
  modalBtnSecondaryText: { color: theme.text, fontWeight: '600', fontSize: 13 },
});