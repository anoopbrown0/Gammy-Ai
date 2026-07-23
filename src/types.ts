export interface Habit {
  id: string;
  name: string;
  goal: string;
  days: ('completed' | 'skipped' | 'locked')[]; // 31 days mapping
  color: string;
  iconName: string;
  streak: number;
  category: "habit" | "active" | "leisure";
  frequency?: string;
  reminderTime?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  plan?: string;
  timezone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HabitLogDoc {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: "completed" | "skipped" | "missed";
  completedAt?: string;
  createdAt?: string;
}

export interface GoalDoc {
  id: string;
  title: string;
  description?: string;
  target?: string;
  progress: number;
  deadline?: string;
  status: "active" | "completed" | "paused";
  createdAt?: string;
}

export interface ReminderDoc {
  id: string;
  habitId: string;
  time: string;
  frequency: string;
  enabled: boolean;
}

export interface AIInsightDoc {
  id: string;
  type: string;
  title: string;
  message: string;
  generatedAt: string;
  relatedHabitIds?: string[];
}

export interface WeeklyReportDoc {
  id: string;
  weekStart: string;
  weekEnd: string;
  completionRate: number;
  successScore: number;
  habitsCompleted: number;
  habitsMissed: number;
  aiSummary: string;
  createdAt: string;
}

export interface MetricCard {
  id: string;
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  progress?: number;
  color: string;
  iconName: string;
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  iconName: string;
  color: string;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface WeeklyInsight {
  title: string;
  badge: string;
  message: string;
  metric: string;
}
