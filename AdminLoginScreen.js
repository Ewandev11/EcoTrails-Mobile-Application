import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import BackgroundSlideshow from '../../components/BackgroundSlideshow';
import AppHeader from '../../components/appheader';
import {
  CARD_ELEVATION,
  CARD_RADIUS,
  COLORS,
  scale,
  scaleFont,
  SPACING,
} from '../constants/theme';

const ADMIN_LOGIN_API = 'https://ecotrails-dev-users-func20250717225342.azurewebsites.net/api/api/user/login?';

export default function AdminLoginScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const cardWidth = width - SPACING.md * 2;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const payload = { Email: email, PasswordHash: password };
      const response = await fetch(ADMIN_LOGIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let json = {};
      try {
        json = JSON.parse(text);
      } catch {
        json = { message: text, raw: text };
      }

      console.log('Login Response:', json);

      if (response.ok && (json.success || json.message?.toLowerCase().includes('success'))) {
        if (!json.role) {
          Alert.alert('Login Failed', 'Role information missing from server response.');
        } else if (json.role !== 'Admin') {
          Alert.alert('Access Denied', 'You are not authorized as admin.');
        } else {
          Alert.alert('Admin Login Successful', 'Welcome Admin!', [
            { text: 'OK', onPress: () => navigation.replace('AdminDashboard') },
          ]);
        }
      } else {
        Alert.alert('Login Failed', json.message || json.error || text || 'Unknown error occurred.');
      }
    } catch (err) {
      Alert.alert('Login Failed', 'Network or server error.');
      console.error('Admin Login error', err);
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <BackgroundSlideshow />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppHeader navigation={navigation} />
        <View style={styles.center}>
          <View style={[styles.card, { width: cardWidth }]}>
            <Text style={styles.title}>🔒 Admin Login</Text>
            <Text style={styles.subtitle}>Administrator access to EcoTrails</Text>

            <TextInput
              style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
              placeholder="Admin Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef?.current?.focus()}
              blurOnSubmit={false}
            />
            <TextInput
              ref={(ref) => (passwordInputRef = ref)}
              style={[styles.input, focusedInput === 'password' && styles.inputFocused]}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login as Admin'}</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Not an admin?{' '}
              <Text style={styles.footerLink} onPress={() => navigation.replace('Login')}>
                Click here for User Login
              </Text>
            </Text>

            <TouchableOpacity onPress={() => navigation.replace('Login')} style={{ marginTop: scale(16) }} activeOpacity={0.8}>
              <Text style={styles.userLoginText}>User? Login here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

let passwordInputRef = null;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: CARD_RADIUS,
    elevation: CARD_ELEVATION,
    alignItems: 'center',
    opacity: 0.98,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    marginVertical: SPACING.lg,
    padding: SPACING.lg,
  },
  title: {
    color: COLORS.primary,
    fontWeight: '900',
    marginBottom: scale(12),
    textAlign: 'center',
    fontSize: scaleFont(24),
    letterSpacing: 0.7,
  },
  subtitle: {
    color: '#666',
    fontSize: scaleFont(16),
    marginBottom: scale(20),
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: scaleFont(22),
  },
  input: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: scale(10),
    paddingHorizontal: scale(18),
    paddingVertical: scale(14),
    fontSize: scaleFont(16),
    marginBottom: scale(14),
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#222',
  },
  inputFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: scale(16),
    borderRadius: scale(12),
    marginTop: scale(8),
    marginBottom: scale(14),
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  buttonDisabled: {
    backgroundColor: '#9ccc9c',
    shadowOpacity: 0,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: scaleFont(17),
    letterSpacing: 1,
  },
  footerText: {
    marginTop: scale(6),
    fontSize: scaleFont(14),
    color: '#555',
    textAlign: 'center',
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  userLoginText: {
    color: '#1565C0',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: scaleFont(14),
  },
});
