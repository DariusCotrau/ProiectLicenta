import { MindfulTask, TaskCategory } from '../types';
import DatabaseService from '../database/DatabaseService';

/**
 * Initialize default tasks in the database
 * These are the base tasks available to all users
 */
export const initializeDefaultTasks = async (): Promise<void> => {
  try {
    // Check if tasks already exist
    const existingTasks = await DatabaseService.tasks.getTasks();
    if (existingTasks.length > 0) {
      console.log('Default tasks already exist, skipping initialization');
      return;
    }

    const defaultTasks: MindfulTask[] = [
      // Outdoor tasks
      {
        id: 'outdoor_walk',
        title: 'Go for a Walk',
        description: 'Take a 30-minute walk outside',
        category: TaskCategory.OUTDOOR,
        timeReward: 30,
        icon: '🚶',
        requiresPhoto: true,
      },
      {
        id: 'outdoor_run',
        title: 'Morning Run',
        description: 'Go for a refreshing morning run',
        category: TaskCategory.OUTDOOR,
        timeReward: 45,
        icon: '🏃',
        requiresPhoto: true,
      },
      {
        id: 'outdoor_bike',
        title: 'Bike Ride',
        description: 'Take a bike ride around your neighborhood',
        category: TaskCategory.OUTDOOR,
        timeReward: 60,
        icon: '🚴',
        requiresPhoto: true,
      },
      {
        id: 'outdoor_nature',
        title: 'Visit Nature',
        description: 'Spend time in a park or natural area',
        category: TaskCategory.OUTDOOR,
        timeReward: 45,
        icon: '🌳',
        requiresPhoto: true,
      },

      // Reading tasks
      {
        id: 'reading_book',
        title: 'Read a Book',
        description: 'Read for 30 minutes',
        category: TaskCategory.READING,
        timeReward: 30,
        icon: '📚',
        requiresPhoto: true,
      },
      {
        id: 'reading_article',
        title: 'Read Articles',
        description: 'Read educational articles or news',
        category: TaskCategory.READING,
        timeReward: 20,
        icon: '📰',
        requiresPhoto: false,
      },

      // Exercise tasks
      {
        id: 'exercise_yoga',
        title: 'Yoga Session',
        description: 'Practice yoga for 30 minutes',
        category: TaskCategory.EXERCISE,
        timeReward: 40,
        icon: '🧘',
        requiresPhoto: true,
      },
      {
        id: 'exercise_gym',
        title: 'Gym Workout',
        description: 'Complete a workout at the gym',
        category: TaskCategory.EXERCISE,
        timeReward: 60,
        icon: '💪',
        requiresPhoto: true,
      },
      {
        id: 'exercise_home',
        title: 'Home Exercise',
        description: 'Do a home workout routine',
        category: TaskCategory.EXERCISE,
        timeReward: 30,
        icon: '🏋️',
        requiresPhoto: false,
      },

      // Meditation tasks
      {
        id: 'meditation_short',
        title: 'Quick Meditation',
        description: '10-minute meditation session',
        category: TaskCategory.MEDITATION,
        timeReward: 15,
        icon: '🧘‍♀️',
        requiresPhoto: false,
      },
      {
        id: 'meditation_long',
        title: 'Deep Meditation',
        description: '30-minute meditation practice',
        category: TaskCategory.MEDITATION,
        timeReward: 40,
        icon: '🕉️',
        requiresPhoto: false,
      },
      {
        id: 'meditation_breathing',
        title: 'Breathing Exercise',
        description: 'Practice deep breathing exercises',
        category: TaskCategory.MEDITATION,
        timeReward: 10,
        icon: '💨',
        requiresPhoto: false,
      },

      // Creative tasks
      {
        id: 'creative_draw',
        title: 'Draw or Paint',
        description: 'Create some art',
        category: TaskCategory.CREATIVE,
        timeReward: 45,
        icon: '🎨',
        requiresPhoto: true,
      },
      {
        id: 'creative_music',
        title: 'Play Music',
        description: 'Practice an instrument or sing',
        category: TaskCategory.CREATIVE,
        timeReward: 30,
        icon: '🎵',
        requiresPhoto: false,
      },
      {
        id: 'creative_write',
        title: 'Creative Writing',
        description: 'Write a story, poem, or journal entry',
        category: TaskCategory.CREATIVE,
        timeReward: 30,
        icon: '✍️',
        requiresPhoto: false,
      },
      {
        id: 'creative_craft',
        title: 'Arts and Crafts',
        description: 'Work on a craft project',
        category: TaskCategory.CREATIVE,
        timeReward: 40,
        icon: '✂️',
        requiresPhoto: true,
      },

      // Social tasks
      {
        id: 'social_call',
        title: 'Call a Friend',
        description: 'Have a meaningful conversation',
        category: TaskCategory.SOCIAL,
        timeReward: 25,
        icon: '📞',
        requiresPhoto: false,
      },
      {
        id: 'social_meetup',
        title: 'Meet in Person',
        description: 'Spend time with friends or family',
        category: TaskCategory.SOCIAL,
        timeReward: 60,
        icon: '👥',
        requiresPhoto: true,
      },
      {
        id: 'social_volunteer',
        title: 'Volunteer',
        description: 'Help others in your community',
        category: TaskCategory.SOCIAL,
        timeReward: 90,
        icon: '🤝',
        requiresPhoto: true,
      },
    ];

    // Create all default tasks
    for (const task of defaultTasks) {
      await DatabaseService.tasks.createTask(task);
    }

    console.log(`Initialized ${defaultTasks.length} default tasks`);
  } catch (error) {
    console.error('Error initializing default tasks:', error);
  }
};
