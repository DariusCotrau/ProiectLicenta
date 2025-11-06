import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../constants/colors';
import { MindfulTask, TaskCategory } from '../types';
import TaskService from '../services/TaskService';
import { TASK_CATEGORY_LABELS } from '../constants/tasks';

const TasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<MindfulTask[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [loading, setLoading] = useState(false);

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
      // Request camera permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permisiune necesară',
          'Trebuie să acorzi permisiune pentru cameră pentru a completa această activitate.'
        );
        return;
      }

      // Take photo
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

  const getTaskIcon = (category: TaskCategory): string => {
    const icons: Record<TaskCategory, string> = {
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
      [TaskCategory.OUTDOOR]: colors.outdoor,
      [TaskCategory.READING]: colors.reading,
      [TaskCategory.EXERCISE]: colors.exercise,
      [TaskCategory.MEDITATION]: colors.meditation,
      [TaskCategory.CREATIVE]: colors.creative,
      [TaskCategory.SOCIAL]: colors.social,
      [TaskCategory.CUSTOM]: colors.custom,
    };
    return categoryColors[category] || colors.primary;
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <Chip
          selected={selectedCategory === 'all'}
          onPress={() => setSelectedCategory('all')}
          style={styles.chip}
        >
          Toate
        </Chip>
        {Object.values(TaskCategory).map((category) => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={styles.chip}
          >
            {TASK_CATEGORY_LABELS[category]}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView style={styles.tasksList}>
        {tasks.map((task) => (
          <Card key={task.id} style={styles.taskCard}>
            <Card.Content>
              <View style={styles.taskHeader}>
                <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(task.category) }]}>
                  <MaterialCommunityIcons
                    name={getTaskIcon(task.category) as any}
                    size={30}
                    color="white"
                  />
                </View>
                <View style={styles.taskInfo}>
                  <Text variant="titleMedium" style={styles.taskTitle}>
                    {task.title}
                  </Text>
                  <Text variant="bodySmall" style={styles.taskDescription}>
                    {task.description}
                  </Text>
                </View>
              </View>

              <View style={styles.taskFooter}>
                <View style={styles.rewardContainer}>
                  <MaterialCommunityIcons name="clock-plus" size={20} color={colors.success} />
                  <Text variant="bodyMedium" style={styles.rewardText}>
                    +{task.timeReward} min
                  </Text>
                </View>
                {task.requiresPhoto && (
                  <Chip icon="camera" compact>
                    Necesită foto
                  </Chip>
                )}
              </View>

              <Button
                mode="contained"
                onPress={() => handleCompleteTask(task)}
                style={styles.completeButton}
                loading={loading}
                disabled={loading}
              >
                Completează
              </Button>
            </Card.Content>
          </Card>
        ))}

        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-off" size={64} color={colors.textSecondary} />
            <Text variant="bodyLarge" style={styles.emptyText}>
              Nu există activități în această categorie
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    padding: 16,
    paddingBottom: 8,
    maxHeight: 60,
  },
  chip: {
    marginRight: 8,
  },
  tasksList: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  taskCard: {
    marginBottom: 16,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskDescription: {
    color: colors.textSecondary,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: colors.success,
  },
  completeButton: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  bottomPadding: {
    height: 20,
  },
});

export default TasksScreen;
