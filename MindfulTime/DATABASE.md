# Database Documentation

## Overview

The MindfulTime application uses SQLite database for local data persistence. The database is managed through a layered architecture with repositories for each entity type.

## Architecture

```
┌─────────────────────────────────────┐
│         Application Layer           │
│  (React Components & Services)      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       DatabaseService               │
│  (Main entry point for DB ops)      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Repositories                │
│  - UserRepository                   │
│  - AppRepository                    │
│  - TaskRepository                   │
│  - RewardRepository                 │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Database.ts                 │
│  (SQLite connection & schema)       │
└─────────────────────────────────────┘
```

## Database Schema

### Users Table
Stores user account information.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### Apps Table
Stores tracked applications and their usage limits.

```sql
CREATE TABLE apps (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  package_name TEXT NOT NULL,
  icon TEXT,
  daily_limit INTEGER NOT NULL DEFAULT 0,
  used_time INTEGER NOT NULL DEFAULT 0,
  is_blocked INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_apps_package_name ON apps(package_name);
```

### Tasks Table
Stores available mindful tasks.

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  time_reward INTEGER NOT NULL,
  icon TEXT NOT NULL,
  requires_photo INTEGER NOT NULL DEFAULT 0,
  is_custom INTEGER NOT NULL DEFAULT 0,
  user_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### Completed Tasks Table
Tracks task completions.

```sql
CREATE TABLE completed_tasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  completed_at INTEGER NOT NULL,
  photo_uri TEXT,
  time_earned INTEGER NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_completed_tasks_date ON completed_tasks(completed_at);
```

### User Stats Table
Stores user statistics.

```sql
CREATE TABLE user_stats (
  user_id TEXT PRIMARY KEY,
  total_tasks_completed INTEGER NOT NULL DEFAULT 0,
  total_time_earned INTEGER NOT NULL DEFAULT 0,
  total_time_saved INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  tasks_completed_today INTEGER NOT NULL DEFAULT 0,
  last_activity_date TEXT,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### Settings Table
Stores user preferences.

```sql
CREATE TABLE settings (
  user_id TEXT PRIMARY KEY,
  notifications_enabled INTEGER NOT NULL DEFAULT 1,
  strict_mode INTEGER NOT NULL DEFAULT 0,
  daily_goal INTEGER NOT NULL DEFAULT 60,
  theme TEXT NOT NULL DEFAULT 'auto',
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### Daily Usage Table
Tracks daily app usage per user.

```sql
CREATE TABLE daily_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  app_usage TEXT NOT NULL,  -- JSON: { packageName: minutes }
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  time_earned INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_daily_usage_user_date ON daily_usage(user_id, date);
```

### Reward Transactions Table
Tracks all reward transactions.

```sql
CREATE TABLE reward_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'earned' | 'spent' | 'bonus'
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  task_id TEXT,
  app_id TEXT,
  timestamp INTEGER NOT NULL,
  description TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE SET NULL,
  FOREIGN KEY (app_id) REFERENCES apps (id) ON DELETE SET NULL
);

CREATE INDEX idx_transactions_timestamp ON reward_transactions(timestamp DESC);
```

### Achievements Table
Stores available achievements.

```sql
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement INTEGER NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  reward_bonus INTEGER
);
```

### User Achievements Table
Tracks which achievements users have unlocked.

```sql
CREATE TABLE user_achievements (
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, achievement_id),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements (id) ON DELETE CASCADE
);
```

### Reward Allocations Table
Tracks pending reward time allocations.

```sql
CREATE TABLE reward_allocations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  minutes INTEGER NOT NULL,
  allocated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (app_id) REFERENCES apps (id) ON DELETE CASCADE
);
```

## Usage Examples

### Initialize Database

The database is automatically initialized when the app starts:

```typescript
import DatabaseService from './src/database/DatabaseService';

await DatabaseService.initialize();
```

### User Operations

```typescript
// Create a user
const user: User = {
  id: '123',
  email: 'user@example.com',
  name: 'John Doe',
  createdAt: new Date(),
};
await DatabaseService.users.createUser(user, passwordHash);

// Get user by email
const user = await DatabaseService.users.getUserByEmail('user@example.com');

// Update user stats
await DatabaseService.users.updateUserStats(userId, {
  totalTasksCompleted: 10,
  totalTimeEarned: 300,
});
```

### App Tracking

```typescript
// Get all apps for a user
const apps = await DatabaseService.apps.getApps(userId);

// Update app usage
await DatabaseService.apps.updateAppUsedTime(appId, 45);

// Block/unblock app
await DatabaseService.apps.updateApp(appId, { isBlocked: true });
```

### Task Operations

```typescript
// Get all available tasks
const tasks = await DatabaseService.tasks.getTasks(userId);

// Complete a task
await DatabaseService.tasks.completeTask(userId, {
  id: 'completion_123',
  taskId: 'outdoor_walk',
  completedAt: new Date(),
  timeEarned: 30,
});

// Get today's completed tasks
const todayTasks = await DatabaseService.tasks.getCompletedTasksToday(userId);
```

### Reward Management

```typescript
// Create a reward transaction
await DatabaseService.rewards.createTransaction(userId, {
  id: 'trans_123',
  type: 'earned',
  amount: 30,
  reason: 'Task completed',
  timestamp: new Date(),
  description: 'Earned 30 minutes for completing outdoor walk',
});

// Get reward balance
const balance = await DatabaseService.rewards.getRewardBalance(userId);
// Returns: { totalEarned, available, spent, pendingAllocation }

// Get all transactions
const transactions = await DatabaseService.rewards.getTransactions(userId);
```

## File Structure

```
src/database/
├── Database.ts                    # Database connection & schema
├── DatabaseService.ts             # Main service singleton
├── index.ts                       # Exports
└── repositories/
    ├── UserRepository.ts          # User operations
    ├── AppRepository.ts           # App tracking operations
    ├── TaskRepository.ts          # Task operations
    └── RewardRepository.ts        # Reward operations
```

## Migration Strategy

If you need to update the database schema:

1. Update the schema in `Database.ts`
2. Implement migration logic (version checking)
3. Test thoroughly before deploying

For development, you can reset the database:

```typescript
await DatabaseService.reset();
```

⚠️ **Warning**: This will delete all data!

## Best Practices

1. **Always initialize database first** before any operations
2. **Use transactions** for related operations that should succeed/fail together
3. **Handle errors** gracefully and provide user feedback
4. **Use indexes** for frequently queried fields (already added for common queries)
5. **Cascade deletes** are set up to maintain referential integrity
6. **Store dates as integers** (timestamps) for consistent timezone handling

## Demo Data

The app automatically initializes with:
- 4 demo users (see `AuthService.initializeDemoUsers()`)
- 19 default tasks across 6 categories (see `initializeDefaultTasks()`)
- Demo apps and stats for testing (see `initializeDemoData()`)

Demo users:
- admin@mindfultime.com / password123
- user@example.com / password123
- maria@example.com / password123
- test@test.com / test123
