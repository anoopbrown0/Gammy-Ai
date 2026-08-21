import { Habit, MetricCard, Reminder, WeeklyInsight } from "./types";

const emptyDays = Array(31).fill("locked") as ("completed" | "skipped" | "locked")[];

export const initialHabits: Habit[] = [
  {
    id: "h1",
    name: "Gym",
    goal: "5x / week",
    color: "#2563EB", // Primary Blue
    iconName: "Dumbbell",
    streak: 0,
    days: [...emptyDays],
    category: "active"
  },
  {
    id: "h2",
    name: "Reading",
    goal: "30 min / day",
    color: "#7C3AED", // Secondary Purple
    iconName: "BookOpen",
    streak: 0,
    days: [...emptyDays],
    category: "habit"
  },
  {
    id: "h3",
    name: "Meditation",
    goal: "15 min / day",
    color: "#0EA5E9", // Sky Blue
    iconName: "Brain",
    streak: 0,
    days: [...emptyDays],
    category: "leisure"
  },
  {
    id: "h4",
    name: "Portfolio",
    goal: "1 hr / day",
    color: "#10B981", // Success Green
    iconName: "Code",
    streak: 0,
    days: [...emptyDays],
    category: "habit"
  },
  {
    id: "h5",
    name: "Walking",
    goal: "10k steps",
    color: "#F59E0B", // Warning Amber
    iconName: "Footprints",
    streak: 0,
    days: [...emptyDays],
    category: "active"
  },
  {
    id: "h6",
    name: "Water",
    goal: "3L / day",
    color: "#0EA5E9", // Sky Blue
    iconName: "Droplet",
    streak: 0,
    days: [...emptyDays],
    category: "habit"
  },
  {
    id: "h7",
    name: "English",
    goal: "15 min / day",
    color: "#7C3AED", // Violet Purple
    iconName: "Languages",
    streak: 0,
    days: [...emptyDays],
    category: "habit"
  },
  {
    id: "h8",
    name: "Savings",
    goal: "$20 / day",
    color: "#10B981", // Success Emerald
    iconName: "Coins",
    streak: 0,
    days: [...emptyDays],
    category: "habit"
  }
];

export const initialMetrics = (habitsCount: number): MetricCard[] => [
  {
    id: "m1",
    title: "Success Rate",
    value: "84%",
    progress: 84,
    trend: "↑12%",
    trendType: "up",
    color: "#2563EB",
    iconName: "TrendingUp"
  },
  {
    id: "m2",
    title: "Monthly Achievement",
    value: "72%",
    progress: 72,
    trend: "↑5%",
    trendType: "up",
    color: "#7C3AED",
    iconName: "Award"
  },
  {
    id: "m3",
    title: "Total Habits",
    value: `${habitsCount} Active`,
    subtitle: "1 Paused • 1 Completed",
    color: "#06B6D4",
    iconName: "Activity"
  },
  {
    id: "m4",
    title: "Current Streak",
    value: "17 Days",
    trend: "Active",
    trendType: "neutral",
    color: "#F59E0B",
    iconName: "Zap"
  },
  {
    id: "m5",
    title: "Longest Streak",
    value: "46 Days",
    trend: "Personal Best",
    trendType: "neutral",
    color: "#EF4444",
    iconName: "Sparkles"
  },
  {
    id: "m6",
    title: "Habit Score",
    value: "78/100",
    progress: 78,
    trend: "Highly Stable",
    trendType: "neutral",
    color: "#2563EB",
    iconName: "Gauge"
  }
];

export const upcomingReminders: Reminder[] = [
  {
    id: "r1",
    title: "Gym",
    time: "07:30 AM",
    iconName: "Dumbbell",
    color: "#2563EB",
    completed: false
  },
  {
    id: "r2",
    title: "Reading",
    time: "12:00 PM",
    iconName: "BookOpen",
    color: "#7C3AED",
    completed: false
  },
  {
    id: "r3",
    title: "Meditation",
    time: "06:00 PM",
    iconName: "Brain",
    color: "#06B6D4",
    completed: false
  },
  {
    id: "r4",
    title: "Water Intake",
    time: "Every 2 Hours",
    iconName: "Droplet",
    color: "#0EA5E9",
    completed: true
  }
];

export const weeklyInsight: WeeklyInsight = {
  title: "Weekly Insight",
  badge: "Consistency Badge",
  message: "Your consistency is 18% higher than last month. Morning routines have a 94% higher success rate.",
  metric: "+18%"
};

// SVG Chart mock datapoints
export const progressChartData = [
  { day: "Mon", rate: 68 },
  { day: "Tue", rate: 72 },
  { day: "Wed", rate: 70 },
  { day: "Thu", rate: 84 },
  { day: "Fri", rate: 78 },
  { day: "Sat", rate: 89 },
  { day: "Sun", rate: 84 }
];

export const progressChartDataMonth = [
  { day: "W1", rate: 65 },
  { day: "W2", rate: 70 },
  { day: "W3", rate: 78 },
  { day: "W4", rate: 84 }
];
