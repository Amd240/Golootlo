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

export default function SignupScreen({ navigation }) {
  const { theme } = useTheme();
  const { register } = useAuth();
  const s = makeStyles(theme);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError('');
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
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
          <Text style={s.tagline}>Create an account to get started.</Text>
        </View>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <Text style={s.label}>Full Name</Text>
        <TextInput
          style={s.input}
          placeholder="Ahmed Awais"
          placeholderTextColor={theme.subtext}
          value={name}
          onChangeText={setName}
        />

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
          placeholder="At least 6 characters"
          placeholderTextColor={theme.subtext}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={s.label}>Confirm Password</Text>
        <TextInput
          style={s.input}
          placeholder="••••••••"
          placeholderTextColor={theme.subtext}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={s.button} onPress={handleSignup} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Sign Up</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={s.switchRow} onPress={() => navigation.navigate('Login')}>
          <Text style={s.switchText}>
            Already have an account? <Text style={s.switchLink}>Log In</Text>
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
    logoWrap: { alignItems: 'center', marginBottom: 28 },
    logo: { fontSize: 30, fontWeight: 'bold', color: '#6C63FF' },
    tagline: { fontSize: 14, color: theme.subtext, marginTop: 6 },
    label: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 6, marginTop: 12 },
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
      marginTop: 22,
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
