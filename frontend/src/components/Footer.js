import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';

const HELP_LINKS = ['Shipping', 'Refund', 'FAQ', 'Accessibility'];

const SOCIALS = [
  { icon: 'logo-twitter', url: 'https://twitter.com' },
  { icon: 'logo-instagram', url: 'https://instagram.com' },
  { icon: 'logo-youtube', url: 'https://youtube.com' },
  { icon: 'paper-plane-outline', url: 'https://t.me' },
  { icon: 'logo-pinterest', url: 'https://pinterest.com' },
];

export default function Footer() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const s = makeStyles(theme);

  const handleHelpPress = (label) => {
    // All help topics route into the existing Help & Support screen for now
    navigation.navigate('Profile', { screen: 'HelpSupport' });
  };

  return (
    <LinearGradient colors={['#F9D65C', '#F3C63E']} style={s.container}>
      {/* Rounded lip so the footer reads as a distinct raised layer under the page content */}
      <View style={s.topLip} />

      <View style={s.linksRow}>
        <View style={s.linksCol}>
          <Text style={s.heading}>Help</Text>
          {HELP_LINKS.map((label) => (
            <TouchableOpacity key={label} onPress={() => handleHelpPress(label)}>
              <Text style={s.link}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.linksCol}>
          <Text style={s.heading}>Stay Connected</Text>
          <View style={s.socialRow}>
            {SOCIALS.map((social) => (
              <TouchableOpacity key={social.icon} style={s.socialBtn} onPress={() => Linking.openURL(social.url)}>
                <Ionicons name={social.icon} size={16} color="#1A1A2E" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Contact info floats as its own white card for a layered, elevated feel */}
      <View style={s.contactCard}>
        <Text style={s.contactHeading}>Contact Us</Text>
        <TouchableOpacity style={s.row} onPress={() => Linking.openURL('tel:+923001234567')}>
          <View style={s.rowIconBadge}>
            <Ionicons name="call-outline" size={14} color="#6C63FF" />
          </View>
          <Text style={s.rowText}>+92 300 1234567</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.row} onPress={() => Linking.openURL('mailto:support@golootlo.app')}>
          <View style={s.rowIconBadge}>
            <Ionicons name="mail-outline" size={14} color="#6C63FF" />
          </View>
          <Text style={s.rowText}>support@golootlo.app</Text>
        </TouchableOpacity>
        <View style={[s.row, { marginBottom: 0 }]}>
          <View style={s.rowIconBadge}>
            <Ionicons name="location-outline" size={14} color="#6C63FF" />
          </View>
          <Text style={s.rowText}>Peshawar, Pakistan</Text>
        </View>
      </View>

      <View style={s.divider} />
      <Text style={s.copyright}>© 2026 Golootlo Ltd. All rights reserved.</Text>
    </LinearGradient>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { padding: 24, paddingTop: 32, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -18, position: 'relative' },
  topLip: { position: 'absolute', top: 10, alignSelf: 'center', width: 44, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.12)' },

  linksRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  linksCol: { flex: 1 },

  heading: { fontSize: 16, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 10 },
  link: { fontSize: 14, color: '#3A3550', marginBottom: 8 },

  socialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  socialBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },

  contactCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  contactHeading: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rowIconBadge: { width: 28, height: 28, borderRadius: 9, backgroundColor: '#F0EEFF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  rowText: { fontSize: 13, color: '#3A3550', fontWeight: '600' },

  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginBottom: 16 },
  copyright: { fontSize: 11, color: '#5A5470', textAlign: 'center' },
});
