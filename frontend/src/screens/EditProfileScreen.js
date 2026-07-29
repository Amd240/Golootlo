import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';

export default function EditProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const { user, updateProfile, changePassword } = useAuth();
  const s = makeStyles(theme);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSaveProfile = async () => {
    setProfileError('');
    if (!name.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill in both password fields.');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Password Changed', 'Your password has been updated.');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.sectionTitle}>Profile Info</Text>
      {profileError ? <Text style={s.error}>{profileError}</Text> : null}

      <Text style={s.label}>Full Name</Text>
      <TextInput style={s.input} value={name} onChangeText={setName} placeholderTextColor={theme.subtext} />

      <Text style={s.label}>Phone</Text>
      <TextInput
        style={s.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="03001234567"
        placeholderTextColor={theme.subtext}
        keyboardType="phone-pad"
      />

      <Text style={s.label}>Email</Text>
      <View style={[s.input, s.disabledInput]}>
        <Text style={{ color: theme.subtext }}>{user?.email}</Text>
      </View>

      <TouchableOpacity style={s.button} onPress={handleSaveProfile} disabled={savingProfile}>
        {savingProfile ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Save Changes</Text>}
      </TouchableOpacity>

      <View style={s.divider} />

      <Text style={s.sectionTitle}>Change Password</Text>
      {passwordError ? <Text style={s.error}>{passwordError}</Text> : null}

      <Text style={s.label}>Current Password</Text>
      <TextInput style={s.input} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholderTextColor={theme.subtext} />

      <Text style={s.label}>New Password</Text>
      <TextInput style={s.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="At least 6 characters" placeholderTextColor={theme.subtext} />

      <TouchableOpacity style={s.button} onPress={handleChangePassword} disabled={savingPassword}>
        {savingPassword ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Update Password</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 12 },
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
  disabledInput: { justifyContent: 'center', opacity: 0.7 },
  button: { backgroundColor: '#6C63FF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 22 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  divider: { height: 1, backgroundColor: theme.border, marginVertical: 28 },
  error: {
    color: '#E5484D',
    backgroundColor: 'rgba(229,72,77,0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 13,
  },
});
