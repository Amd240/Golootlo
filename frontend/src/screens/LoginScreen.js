import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const { login } = useAuth();
  const s = makeStyles(theme);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.logoWrap}>
          <Text style={s.logo}>Golootlo</Text>
          <Text style={s.tagline}>Welcome back! Log in to continue.</Text>
        </View>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <Text style={s.label}>Email</Text>
        <TextInput
          style={s.input}
          placeholder="you@example.com"
          placeholderTextColor={theme.subtext}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={s.label}>Password</Text>
        <TextInput
          style={s.input}
          placeholder="••••••••"
          placeholderTextColor={theme.subtext}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={s.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Log In</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={s.switchRow} onPress={() => navigation.navigate('Signup')}>
          <Text style={s.switchText}>
            Don't have an account? <Text style={s.switchLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: theme.background },
    container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    logoWrap: { alignItems: 'center', marginBottom: 32 },
    logo: { fontSize: 30, fontWeight: 'bold', color: '#6C63FF' },
    tagline: { fontSize: 14, color: theme.subtext, marginTop: 6 },
    label: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 6, marginTop: 14 },
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
    button: {
      backgroundColor: '#6C63FF',
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 26,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    switchRow: { alignItems: 'center', marginTop: 20 },
    switchText: { color: theme.subtext, fontSize: 14 },
    switchLink: { color: '#6C63FF', fontWeight: '700' },
    error: {
      color: '#E5484D',
      backgroundColor: 'rgba(229,72,77,0.1)',
      padding: 10,
      borderRadius: 8,
      marginBottom: 8,
      fontSize: 13,
      textAlign: 'center',
    },
  });
