import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Switch, Button, TextInput, List, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import StorageService from '../services/StorageService';
import { AppSettings } from '../types';

const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    notificationsEnabled: true,
    strictMode: false,
    dailyGoal: 60,
    theme: 'auto',
  });
  const [dailyGoalInput, setDailyGoalInput] = useState('60');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const userSettings = await StorageService.getSettings();
    setSettings(userSettings);
    setDailyGoalInput(userSettings.dailyGoal.toString());
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await StorageService.updateSettings({ [key]: value });
  };

  const saveDailyGoal = async () => {
    const goal = parseInt(dailyGoalInput);
    if (isNaN(goal) || goal < 0) {
      Alert.alert('Eroare', 'Te rog introdu un număr valid de minute');
      return;
    }
    await updateSetting('dailyGoal', goal);
    Alert.alert('Succes', 'Obiectivul zilnic a fost actualizat');
  };

  const handleClearData = () => {
    Alert.alert(
      'Ștergere date',
      'Ești sigur că vrei să ștergi toate datele? Această acțiune nu poate fi anulată.',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAll();
            Alert.alert('Succes', 'Toate datele au fost șterse');
            loadSettings();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Notificări
          </Text>
          <List.Item
            title="Activează notificările"
            description="Primește notificări când aplicațiile se apropie de limită"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => updateSetting('notificationsEnabled', value)}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Mod strict
          </Text>
          <List.Item
            title="Activează modul strict"
            description="Blochează imediat aplicațiile când se atinge limita (fără notificări de avertizare)"
            left={(props) => <List.Icon {...props} icon="lock" />}
            right={() => (
              <Switch
                value={settings.strictMode}
                onValueChange={(value) => updateSetting('strictMode', value)}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Obiectiv zilnic
          </Text>
          <Text variant="bodySmall" style={styles.description}>
            Setează câte minute de activități mindfulness vrei să faci în fiecare zi
          </Text>
          <View style={styles.goalContainer}>
            <TextInput
              label="Minute pe zi"
              value={dailyGoalInput}
              onChangeText={setDailyGoalInput}
              keyboardType="numeric"
              mode="outlined"
              style={styles.goalInput}
            />
            <Button mode="contained" onPress={saveDailyGoal} style={styles.saveButton}>
              Salvează
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Despre aplicație
          </Text>
          <List.Item
            title="Versiune"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <Divider />
          <List.Item
            title="Politica de confidențialitate"
            left={(props) => <List.Icon {...props} icon="shield-account" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Info', 'Funcție în dezvoltare')}
          />
          <Divider />
          <List.Item
            title="Termeni și condiții"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Info', 'Funcție în dezvoltare')}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Date
          </Text>
          <Button
            mode="outlined"
            onPress={handleClearData}
            icon="delete"
            textColor={colors.error}
            style={styles.dangerButton}
          >
            Șterge toate datele
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    color: colors.textSecondary,
    marginBottom: 12,
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  goalInput: {
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
  },
  dangerButton: {
    borderColor: colors.error,
    marginTop: 8,
  },
  bottomPadding: {
    height: 20,
  },
});

export default SettingsScreen;
