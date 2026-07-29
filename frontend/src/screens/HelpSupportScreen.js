import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';

const FAQS = [
  { q: 'How do I track my order?', a: 'Go to Profile > Order History to see the status of all your orders.' },
  { q: 'How do I return an item?', a: 'Contact support using the email below within 7 days of delivery to start a return.' },
  { q: 'What payment methods are supported?', a: 'You can save card details under Profile > Payment Methods. Cash on delivery is also available at checkout.' },
  { q: 'How do I change my password?', a: 'Go to Profile > Edit Profile and scroll to the Change Password section.' },
];

export default function HelpSupportScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.sectionTitle}>Frequently Asked Questions</Text>
      {FAQS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <TouchableOpacity
            key={item.q}
            style={s.faqCard}
            onPress={() => setOpenIndex(isOpen ? null : index)}
            activeOpacity={0.8}
          >
            <View style={s.faqHeader}>
              <Text style={s.faqQuestion}>{item.q}</Text>
              <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.subtext} />
            </View>
            {isOpen && <Text style={s.faqAnswer}>{item.a}</Text>}
          </TouchableOpacity>
        );
      })}

      <Text style={s.sectionTitle}>Still Need Help?</Text>
      <TouchableOpacity style={s.contactCard} onPress={() => Linking.openURL('mailto:support@golootlo.app')}>
        <Ionicons name="mail-outline" size={20} color="#6C63FF" style={{ marginRight: 10 }} />
        <Text style={s.contactText}>support@golootlo.app</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 12, marginTop: 8 },
  faqCard: { backgroundColor: theme.card, borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: theme.border },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 14, fontWeight: '600', color: theme.text, flex: 1, paddingRight: 8 },
  faqAnswer: { fontSize: 13, color: theme.subtext, marginTop: 10, lineHeight: 19 },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: theme.border },
  contactText: { fontSize: 14, fontWeight: '600', color: theme.text },
});
