import { supabase as rawSupabase } from "../supabaseClient";

const supabase: any = rawSupabase;

export interface SupabaseHabit {
  id: string;
  user_id: string;
  name: string;
  goal?: string;
  color?: string;
  icon?: string;
  category?: string;
  active?: boolean;
  created_at?: string;
}

export interface SupabaseHabitLog {
  id?: string;
  user_id: string;
  habit_id: string;
  date_str: string;
  status: "completed" | "skipped" | "missed" | null;
  updated_at?: string;
}

/**
 * Save or update a habit in Supabase database
 */
export async function saveHabitToSupabase(userId: string, habit: any) {
  if (!userId || !habit?.id) return;
  
  try {
    const payload = {
      id: habit.id,
      user_id: userId,
      name: habit.name || "Untitled Habit",
      goal: habit.goal || "1x / day",
      color: habit.color || "#2563EB",
      icon: habit.iconName || habit.icon || "Target",
      category: habit.category || "habit",
      active: habit.active !== false,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("habits")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      console.warn("Supabase habits upsert notice:", error.message);
    }
  } catch (err) {
    console.warn("Supabase save habit error:", err);
  }
}

/**
 * Save or update a habit completion status in Supabase database
 */
export async function saveHabitLogToSupabase(
  userId: string,
  habitId: string,
  dateStr: string,
  status: "completed" | "skipped" | "missed" | null
) {
  if (!userId || !habitId) return;

  try {
    const docId = `${habitId}_${dateStr}`;

    if (status === null) {
      const { error } = await supabase
        .from("habit_logs")
        .delete()
        .eq("user_id", userId)
        .eq("habit_id", habitId)
        .eq("date_str", dateStr);

      if (error) {
        console.warn("Supabase habit_logs delete notice:", error.message);
      }
    } else {
      const payload = {
        id: docId,
        user_id: userId,
        habit_id: habitId,
        date_str: dateStr,
        status: status,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("habit_logs")
        .upsert(payload, { onConflict: "id" });

      if (error) {
        console.warn("Supabase habit_logs upsert notice:", error.message);
      }
    }
  } catch (err) {
    console.warn("Supabase save habit log error:", err);
  }
}

/**
 * Delete a habit from Supabase database
 */
export async function deleteHabitFromSupabase(userId: string, habitId: string) {
  if (!userId || !habitId) return;

  try {
    await supabase.from("habits").delete().eq("user_id", userId).eq("id", habitId);
    await supabase.from("habit_logs").delete().eq("user_id", userId).eq("habit_id", habitId);
  } catch (err) {
    console.warn("Supabase delete habit error:", err);
  }
}

/**
 * Fetch all habits for a user from Supabase
 */
export async function fetchHabitsFromSupabase(userId: string) {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.warn("Supabase fetch habits notice:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("Supabase fetch habits error:", err);
    return [];
  }
}

/**
 * Fetch all habit completion logs for a user from Supabase
 */
export async function fetchHabitLogsFromSupabase(userId: string) {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.warn("Supabase fetch habit logs notice:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("Supabase fetch habit logs error:", err);
    return [];
  }
}
