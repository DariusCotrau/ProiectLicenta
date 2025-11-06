# Ghid de Dezvoltare - MindfulTime

## Arhitectura Aplicației

### Overview

MindfulTime folosește o arhitectură în straturi (layered architecture):

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│    (Screens, Components, UI)        │
├─────────────────────────────────────┤
│         Navigation Layer            │
│    (React Navigation, Routing)      │
├─────────────────────────────────────┤
│        Business Logic Layer         │
│         (Services, Hooks)           │
├─────────────────────────────────────┤
│         Data Layer                  │
│    (Storage, State Management)      │
├─────────────────────────────────────┤
│         Native Layer                │
│  (Platform-specific functionality)  │
└─────────────────────────────────────┘
```

### Componentele Principale

#### 1. Services (Business Logic)

**StorageService.ts**
- Gestionează persistența datelor folosind AsyncStorage
- Operații CRUD pentru Apps, Tasks, Settings, Stats
- Singleton pattern pentru acces global

**TaskService.ts**
- Logica pentru gestionarea activităților mindfulness
- Completarea taskurilor și calculul recompenselor
- Tracking streak-uri și statistici

**TimeLimitService.ts**
- Monitorizarea timpului pentru fiecare aplicație
- Calculul limitelor și distribuirea timpului câștigat
- Blocarea/deblocarea aplicațiilor

#### 2. Type System

Toate tipurile sunt definite în `src/types/index.ts`:

- `App`: Reprezentarea unei aplicații monitorizate
- `MindfulTask`: Activități mindfulness
- `CompletedTask`: Istoric activități completate
- `UserStats`: Statistici utilizator
- `AppSettings`: Setări aplicație

#### 3. Screen Components

Fiecare screen este un component funcțional React cu hooks:

- **HomeScreen**: Dashboard-ul principal
- **TasksScreen**: Lista și completarea activităților
- **AppsScreen**: Gestionarea aplicațiilor și limitelor
- **StatsScreen**: Vizualizarea statisticilor
- **SettingsScreen**: Configurări aplicație

## Flux de Lucru

### 1. Completarea unei Activități

```typescript
User selectează task
    ↓
TasksScreen verifică dacă necesită foto
    ↓
Dacă da → Deschide camera → Captează foto
    ↓
TaskService.completeTask(task, photoUri)
    ↓
├─> Salvează în storage (StorageService)
├─> Actualizează statistici utilizator
├─> Distribuie timp câștigat (TimeLimitService)
└─> Actualizează streak-ul
```

### 2. Monitorizarea Aplicațiilor

```typescript
TimeLimitService.startMonitoring()
    ↓
Interval (1 minut) → checkAppLimits()
    ↓
Pentru fiecare app:
├─> Verifică dacă usedTime >= dailyLimit
└─> Dacă da → blockApp(appId)
```

### 3. Data Flow

```
Component
    ↓ (useEffect)
Service Layer
    ↓ (async/await)
StorageService
    ↓
AsyncStorage (Device)
```

## Best Practices

### 1. State Management

```typescript
// Folosim useState pentru state local
const [apps, setApps] = useState<App[]>([]);

// useEffect pentru încărcare date
useEffect(() => {
  const loadData = async () => {
    const data = await StorageService.getApps();
    setApps(data);
  };
  loadData();
}, []);
```

### 2. Error Handling

```typescript
try {
  await StorageService.saveApps(apps);
} catch (error) {
  console.error('Error saving apps:', error);
  // Afișează feedback utilizatorului
  Alert.alert('Eroare', 'Nu s-au putut salva datele');
}
```

### 3. TypeScript

```typescript
// Tipuri explicite pentru props
interface Props {
  task: MindfulTask;
  onComplete: (task: MindfulTask) => void;
}

// Componente tipate
const TaskCard: React.FC<Props> = ({ task, onComplete }) => {
  // ...
};
```

### 4. Async Operations

```typescript
// Folosește async/await, nu .then()
const loadData = async () => {
  const [apps, stats, settings] = await Promise.all([
    StorageService.getApps(),
    StorageService.getUserStats(),
    StorageService.getSettings(),
  ]);
  // ...
};
```

## Adăugarea de Funcționalități Noi

### Exemplu: Adăugarea unei noi categorii de task

#### 1. Actualizează Type Definitions

```typescript
// src/types/index.ts
export enum TaskCategory {
  // ... existing categories
  NEW_CATEGORY = 'new_category',
}
```

#### 2. Adaugă Label

```typescript
// src/constants/tasks.ts
export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  // ... existing labels
  [TaskCategory.NEW_CATEGORY]: 'Noua Categorie',
};
```

#### 3. Adaugă Task Predefinit

```typescript
// src/constants/tasks.ts
export const PREDEFINED_TASKS: MindfulTask[] = [
  // ... existing tasks
  {
    id: 'new-task',
    title: 'Taskul nou',
    description: 'Descriere task',
    category: TaskCategory.NEW_CATEGORY,
    timeReward: 25,
    icon: 'icon-name',
    requiresPhoto: true,
  },
];
```

#### 4. Adaugă Culoare (opțional)

```typescript
// src/constants/colors.ts
export const colors = {
  // ... existing colors
  newCategory: '#FF5722',
};
```

### Exemplu: Adăugarea unui nou Service

#### 1. Creează Service File

```typescript
// src/services/NotificationService.ts
class NotificationService {
  async scheduleNotification(title: string, body: string, trigger: Date): Promise<string> {
    // Implementation
  }

  async cancelNotification(id: string): Promise<void> {
    // Implementation
  }
}

export default new NotificationService();
```

#### 2. Folosește în Components

```typescript
import NotificationService from '../services/NotificationService';

const scheduleReminder = async () => {
  await NotificationService.scheduleNotification(
    'MindfulTime',
    'Timpul tău se apropie de limită!',
    new Date(Date.now() + 5 * 60 * 1000) // în 5 minute
  );
};
```

## Testing Strategy

### Unit Tests (viitor)

```typescript
// __tests__/services/TaskService.test.ts
describe('TaskService', () => {
  it('should complete task and update stats', async () => {
    const task = PREDEFINED_TASKS[0];
    const result = await TaskService.completeTask(task);

    expect(result.timeEarned).toBe(task.timeReward);
    // ...
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/CompleteTaskFlow.test.ts
describe('Complete Task Flow', () => {
  it('should complete full task workflow', async () => {
    // 1. Complete task
    // 2. Verify storage updated
    // 3. Verify stats updated
    // 4. Verify time distributed
  });
});
```

## Performance Optimization

### 1. Lazy Loading

```typescript
// Pentru componente mari
const StatsScreen = lazy(() => import('./screens/StatsScreen'));
```

### 2. Memoization

```typescript
import { useMemo } from 'react';

const sortedTasks = useMemo(() => {
  return tasks.sort((a, b) => b.timeReward - a.timeReward);
}, [tasks]);
```

### 3. Debouncing

```typescript
import { useCallback, useRef } from 'react';

const debouncedSearch = useCallback(
  debounce((query: string) => {
    // Search logic
  }, 300),
  []
);
```

## Debugging

### 1. React DevTools

```bash
npm install -g react-devtools
react-devtools
```

### 2. Redux DevTools (dacă se adaugă Redux)

```typescript
import { composeWithDevTools } from 'redux-devtools-extension';
```

### 3. Logging

```typescript
// Development only
if (__DEV__) {
  console.log('Debug info:', data);
}
```

### 4. Expo DevTools

```bash
# Deschide în browser
npm start

# Logs în terminal
npx expo start --clear
```

## Common Issues & Solutions

### Issue: AsyncStorage este slow

**Soluție**:
- Folosește batch operations
- Cache date în memorie când este posibil
- Consideră trecerea la SQLite pentru volume mari de date

```typescript
// Batch read
const [apps, stats, settings] = await Promise.all([
  StorageService.getApps(),
  StorageService.getUserStats(),
  StorageService.getSettings(),
]);
```

### Issue: Re-render excessiv

**Soluție**:
- Folosește `React.memo()` pentru componente
- `useMemo()` și `useCallback()` pentru valori/funcții
- Split state pentru a evita re-render-uri inutile

```typescript
const TaskCard = React.memo<Props>(({ task }) => {
  // Component logic
});
```

### Issue: Navigation lag

**Soluție**:
- Enable navigation optimizations
- Reduce componente complexe în initial render

```typescript
<Tab.Navigator
  screenOptions={{
    lazy: true, // Load screens only when needed
    unmountOnBlur: true, // Cleanup when leaving
  }}
>
```

## Code Style Guide

### Naming Conventions

```typescript
// PascalCase pentru componente și tipuri
type UserProfile = { ... };
const UserCard: React.FC = () => { ... };

// camelCase pentru variabile și funcții
const userName = 'John';
const getUserData = () => { ... };

// UPPER_CASE pentru constante
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://...';

// kebab-case pentru fișiere
// user-profile.tsx, task-service.ts
```

### Import Order

```typescript
// 1. React & React Native
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

// 2. External libraries
import { Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// 3. Internal imports (absolute paths)
import { App, MindfulTask } from '../types';
import StorageService from '../services/StorageService';
import { colors } from '../constants/colors';

// 4. Relative imports
import TaskCard from './TaskCard';
```

### Component Structure

```typescript
// 1. Imports
import React from 'react';

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Component
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // 3.1 Hooks
  const [state, setState] = useState();
  useEffect(() => { ... }, []);

  // 3.2 Event handlers
  const handlePress = () => { ... };

  // 3.3 Render helpers
  const renderItem = () => { ... };

  // 3.4 Render
  return (
    <View>
      {/* JSX */}
    </View>
  );
};

// 4. Styles
const styles = StyleSheet.create({ ... });

// 5. Export
export default MyComponent;
```

## Git Workflow

```bash
# Feature branch
git checkout -b feature/add-notifications

# Commit frecvent cu mesaje descriptive
git commit -m "feat: add notification service"
git commit -m "refactor: improve task completion flow"
git commit -m "fix: resolve timezone issue in stats"

# Push și PR
git push origin feature/add-notifications
```

### Commit Message Convention

```
feat: Adaugă funcționalitate nouă
fix: Rezolvă un bug
refactor: Refactorizare cod fără schimbare funcționalitate
docs: Documentație
style: Formatare, missing semi colons, etc
test: Adaugă teste
chore: Actualizări dependențe, config, etc
```

## Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

## Next Steps

1. Implementare module native pentru monitorizare reală
2. Adăugare notificări
3. Implementare backup cloud
4. Adăugare teste (unit + integration)
5. Optimizare performanță
6. Implementare feature-uri avansate (ML, gamification)
