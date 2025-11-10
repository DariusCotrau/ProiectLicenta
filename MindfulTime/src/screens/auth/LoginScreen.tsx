import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/useAuth';
import { Theme } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';
import {
  Container,
  Card,
  Text,
  Button,
  Spacer,
  Column,
} from '../../components/common';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login, isLoading } = useAuth();
  const { isTablet, getFontSize } = useResponsive();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      await login({ email: email.trim().toLowerCase(), password });
      // Navigation will be handled automatically by auth state change
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      Alert.alert('Login Failed', errorMessage);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Container padding>
          <Spacer size="xxl" />
          <Spacer size="xxl" />

          {/* App Logo/Title */}
          <Column align="center">
            <MaterialCommunityIcons
              name="meditation"
              size={isTablet ? 120 : 80}
              color={Theme.colors.primary}
            />
            <Spacer size="md" />
            <Text variant="h1" weight="bold" align="center">
              MindfulTime
            </Text>
            <Spacer size="sm" />
            <Text variant="body1" align="center" color={Theme.colors.textSecondary}>
              Welcome back! Please login to continue.
            </Text>
          </Column>

          <Spacer size="xl" />

          {/* Login Form Card */}
          <Card>
            <Column>
              <Text variant="h3" weight="600">
                Login
              </Text>
              <Spacer size="lg" />

              {/* Email Input */}
              <TextInput
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) validateEmail(text);
                }}
                onBlur={() => validateEmail(email)}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={!!emailError}
                disabled={isLoading}
                left={<TextInput.Icon icon="email" />}
                style={styles.input}
              />
              {emailError ? (
                <Text variant="caption" color={Theme.colors.error} style={styles.errorText}>
                  {emailError}
                </Text>
              ) : null}

              <Spacer size="md" />

              {/* Password Input */}
              <TextInput
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) validatePassword(text);
                }}
                onBlur={() => validatePassword(password)}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                error={!!passwordError}
                disabled={isLoading}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
              />
              {passwordError ? (
                <Text variant="caption" color={Theme.colors.error} style={styles.errorText}>
                  {passwordError}
                </Text>
              ) : null}

              <Spacer size="xl" />

              {/* Login Button */}
              <Button
                title="Login"
                onPress={handleLogin}
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
                fullWidth
              />
            </Column>
          </Card>

          <Spacer size="lg" />

          {/* Demo Users Info Card */}
          <Card>
            <Column>
              <Text variant="body2" weight="600" align="center">
                Demo Users
              </Text>
              <Spacer size="sm" />
              <Text variant="caption" color={Theme.colors.textSecondary} align="center">
                Use these credentials to login:
              </Text>
              <Spacer size="md" />
              <View style={styles.demoUserContainer}>
                <Text variant="caption" color={Theme.colors.textSecondary}>
                  • admin@mindfultime.com / password123
                </Text>
                <Text variant="caption" color={Theme.colors.textSecondary}>
                  • user@example.com / password123
                </Text>
                <Text variant="caption" color={Theme.colors.textSecondary}>
                  • test@test.com / test123
                </Text>
              </View>
            </Column>
          </Card>

          <Spacer size="lg" />

          {/* Register Link */}
          <Column align="center">
            <Text variant="body2" color={Theme.colors.textSecondary}>
              Don't have an account?
            </Text>
            <Spacer size="sm" />
            <Button
              title="Create Account"
              onPress={navigateToRegister}
              variant="text"
              disabled={isLoading}
            />
          </Column>

          <Spacer size="xl" />
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  input: {
    backgroundColor: Theme.colors.surface,
  },
  errorText: {
    marginTop: Theme.spacing.xs,
    marginLeft: Theme.spacing.sm,
  },
  demoUserContainer: {
    gap: Theme.spacing.xs,
  },
});

export default LoginScreen;
