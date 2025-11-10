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

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const { register, isLoading } = useAuth();
  const { isTablet } = useResponsive();

  const validateName = (name: string): boolean => {
    if (!name.trim()) {
      setNameError('Name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    setNameError('');
    return true;
  };

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

  const validateConfirmPassword = (confirmPassword: string): boolean => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleRegister = async () => {
    // Validate all inputs
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      // Navigation will be handled automatically by auth state change
      Alert.alert('Success', 'Account created successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
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
          <Spacer size="xl" />

          {/* Header */}
          <Column align="center">
            <MaterialCommunityIcons
              name="account-plus"
              size={isTablet ? 100 : 70}
              color={Theme.colors.primary}
            />
            <Spacer size="md" />
            <Text variant="h1" weight="bold" align="center">
              Create Account
            </Text>
            <Spacer size="sm" />
            <Text variant="body1" align="center" color={Theme.colors.textSecondary}>
              Join MindfulTime and start your mindfulness journey
            </Text>
          </Column>

          <Spacer size="xl" />

          {/* Registration Form Card */}
          <Card>
            <Column>
              <Text variant="h3" weight="600">
                Register
              </Text>
              <Spacer size="lg" />

              {/* Name Input */}
              <TextInput
                label="Full Name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) validateName(text);
                }}
                onBlur={() => validateName(name)}
                mode="outlined"
                autoCapitalize="words"
                error={!!nameError}
                disabled={isLoading}
                left={<TextInput.Icon icon="account" />}
                style={styles.input}
              />
              {nameError ? (
                <Text variant="caption" color={Theme.colors.error} style={styles.errorText}>
                  {nameError}
                </Text>
              ) : null}

              <Spacer size="md" />

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
                  // Re-validate confirm password if it's already filled
                  if (confirmPassword) validateConfirmPassword(confirmPassword);
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

              <Spacer size="md" />

              {/* Confirm Password Input */}
              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) validateConfirmPassword(text);
                }}
                onBlur={() => validateConfirmPassword(confirmPassword)}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                error={!!confirmPasswordError}
                disabled={isLoading}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                style={styles.input}
              />
              {confirmPasswordError ? (
                <Text variant="caption" color={Theme.colors.error} style={styles.errorText}>
                  {confirmPasswordError}
                </Text>
              ) : null}

              <Spacer size="xl" />

              {/* Register Button */}
              <Button
                title="Create Account"
                onPress={handleRegister}
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
                fullWidth
              />
            </Column>
          </Card>

          <Spacer size="lg" />

          {/* Login Link */}
          <Column align="center">
            <Text variant="body2" color={Theme.colors.textSecondary}>
              Already have an account?
            </Text>
            <Spacer size="sm" />
            <Button
              title="Login"
              onPress={navigateToLogin}
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
});

export default RegisterScreen;
