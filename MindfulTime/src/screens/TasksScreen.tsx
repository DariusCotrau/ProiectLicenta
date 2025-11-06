import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { MindfulTask, TaskCategory } from '../types';
import TaskService from '../services/TaskService';
import { TASK_CATEGORY_LABELS } from '../constants/tasks';
import { Theme } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';
import {
  Card,
  Text,
  Button,
  Chip,
  Row,
  Column,
  Spacer,
} from '../components/common';

const TasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<MindfulTask[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const { getIconSize, isSmall, isTablet } = useResponsive();

  useEffect(() => {
    loadTasks();
  }, [selectedCategory]);

  const loadTasks = async () => {
    if (selectedCategory === 'all') {
      const allTasks = await TaskService.getAllTasks();
      setTasks(allTasks);
    } else {
      const filteredTasks = await TaskService.getTasksByCategory(selectedCategory);
      setTasks(filteredTasks);
    }
  };

  const handleCompleteTask = async (task: MindfulTask) => {
    if (task.requiresPhoto) {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permisiune necesară',
          'Trebuie să acorzi permisiune pentru cameră pentru a completa această activitate.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        await completeTaskWithPhoto(task, result.assets[0].uri);
      }
    } else {
      Alert.alert(
        'Completează activitatea',
        `Ai completat "${task.title}"?`,
        [
          { text: 'Anulează', style: 'cancel' },
          {
            text: 'Da, am completat',
            onPress: () => completeTaskWithPhoto(task),
          },
        ]
      );
    }
  };

  const completeTaskWithPhoto = async (task: MindfulTask, photoUri?: string) => {
    setLoading(true);
    try {
      await TaskService.completeTask(task, photoUri);
      Alert.alert(
        'Felicitări!',
        `Ai câștigat ${task.timeReward} minute suplimentare!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Eroare', 'Nu am putut salva activitatea. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  const getTaskIcon = (category: TaskCategory): keyof typeof MaterialCommunityIcons.glyphMap => {
    const icons: Record<TaskCategory, keyof typeof MaterialCommunityIcons.glyphMap> = {
      [TaskCategory.OUTDOOR]: 'tree',
      [TaskCategory.READING]: 'book-open-variant',
      [TaskCategory.EXERCISE]: 'dumbbell',
      [TaskCategory.MEDITATION]: 'meditation',
      [TaskCategory.CREATIVE]: 'palette',
      [TaskCategory.SOCIAL]: 'account-group',
      [TaskCategory.CUSTOM]: 'star',
    };
    return icons[category] || 'check';
  };

  const getCategoryColor = (category: TaskCategory): string => {
    const categoryColors: Record<TaskCategory, string> = {
      [TaskCategory.OUTDOOR]: Theme.colors.outdoor,
      [TaskCategory.READING]: Theme.colors.reading,
      [TaskCategory.EXERCISE]: Theme.colors.exercise,
      [TaskCategory.MEDITATION]: Theme.colors.meditation,
      [TaskCategory.CREATIVE]: Theme.colors.creative,
      [TaskCategory.SOCIAL]: Theme.colors.social,
      [TaskCategory.CUSTOM]: Theme.colors.custom,
    };
    return categoryColors[category] || Theme.colors.primary;
  };

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Theme.spacing.md,
          paddingVertical: Theme.spacing.sm,
        }}
        style={{ flexGrow: 0 }}
      >
        <Row spacing={Theme.spacing.sm}>
          <Chip
            label="Toate"
            selected={selectedCategory === 'all'}
            onPress={() => setSelectedCategory('all')}
            color={Theme.colors.primary}
          />
          {Object.values(TaskCategory).map((category) => (
            <Chip
              key={category}
              label={TASK_CATEGORY_LABELS[category]}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              color={getCategoryColor(category)}
            />
          ))}
        </Row>
      </ScrollView>

      {/* Tasks List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: Theme.spacing.md,
          paddingBottom: Theme.spacing.xl,
        }}
      >
        {tasks.map((task) => (
          <Card key={task.id} elevation="md" margin={false} style={{ marginBottom: Theme.spacing.md }}>
            <Column spacing={Theme.spacing.md}>
              {/* Task Header */}
              <Row spacing={Theme.spacing.md} align="flex-start">
                <View
                  style={{
                    width: getIconSize(isSmall ? 48 : 60),
                    height: getIconSize(isSmall ? 48 : 60),
                    borderRadius: getIconSize(isSmall ? 24 : 30),
                    backgroundColor: getCategoryColor(task.category),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <MaterialCommunityIcons
                    name={getTaskIcon(task.category)}
                    size={getIconSize(isSmall ? 24 : 30)}
                    color="#FFFFFF"
                  />
                </View>
                <Column spacing={Theme.spacing.xs} style={{ flex: 1 }}>
                  <Text variant="h4" weight="600">
                    {task.title}
                  </Text>
                  <Text variant="body2" color={Theme.colors.textSecondary}>
                    {task.description}
                  </Text>
                </Column>
              </Row>

              {/* Task Footer */}
              <Row justify="space-between" align="center">
                <Row spacing={Theme.spacing.xs} align="center">
                  <MaterialCommunityIcons
                    name="clock-plus"
                    size={getIconSize(20)}
                    color={Theme.colors.success}
                  />
                  <Text variant="body1" weight="600" color={Theme.colors.success}>
                    +{task.timeReward} min
                  </Text>
                </Row>
                {task.requiresPhoto && (
                  <Chip
                    label="Necesită foto"
                    icon="camera"
                    color={Theme.colors.info}
                  />
                )}
              </Row>

              {/* Complete Button */}
              <Button
                title="Completează"
                onPress={() => handleCompleteTask(task)}
                loading={loading}
                disabled={loading}
                fullWidth
                icon="check-circle"
              />
            </Column>
          </Card>
        ))}

        {/* Empty State */}
        {tasks.length === 0 && (
          <Column spacing={Theme.spacing.md} align="center" style={{ paddingVertical: Theme.spacing.xxl * 2 }}>
            <MaterialCommunityIcons
              name="clipboard-text-off"
              size={getIconSize(80)}
              color={Theme.colors.textSecondary}
            />
            <Text variant="h4" color={Theme.colors.textSecondary} align="center">
              Nu există activități în această categorie
            </Text>
          </Column>
        )}
      </ScrollView>
    </View>
  );
};

export default TasksScreen;
