import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  UserProfile,
  TodoTask,
  StudyMaterial,
  DailyHistoryRecord,
  GradeLevel,
  StudentStream,
} from '../types';

const getEnvOrStorage = (key: string): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`APEX_${key}`);
    if (saved) return saved.trim().replace(/[\)\s'"]/g, '');
  }
  const val = (import.meta.env[key] as string) || '';
  return val.trim().replace(/[\)\s'"]/g, '');
};

let currentUrl = getEnvOrStorage('VITE_SUPABASE_URL');
let currentAnonKey = getEnvOrStorage('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = (): boolean => {
  return Boolean(currentUrl && currentAnonKey && currentUrl.startsWith('http') && currentAnonKey.length > 20);
};

export const getSupabaseConfig = (): { url: string; anonKey: string } => {
  return {
    url: currentUrl,
    anonKey: currentAnonKey,
  };
};

export const updateSupabaseCredentials = (url: string, anonKey: string): boolean => {
  const cleanUrl = url.trim().replace(/[\)\s'"]/g, '');
  const cleanKey = anonKey.trim().replace(/[\)\s'"]/g, '');

  if (typeof window !== 'undefined') {
    localStorage.setItem('APEX_VITE_SUPABASE_URL', cleanUrl);
    localStorage.setItem('APEX_VITE_SUPABASE_ANON_KEY', cleanKey);
  }

  currentUrl = cleanUrl;
  currentAnonKey = cleanKey;

  if (cleanUrl.startsWith('http') && cleanKey.length > 20) {
    supabase = createClient(cleanUrl, cleanKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return true;
  } else {
    supabase = null;
    return false;
  }
};

export let supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(currentUrl, currentAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Get local date string YYYY-MM-DD with optional day offset
export const getLocalDateString = (offsetDays: number = 0): string => {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Multi-User Registry key
const USERS_INDEX_KEY = 'apex_registered_users';
const ACTIVE_USER_ID_KEY = 'apex_active_user_id';

interface StoredUserAccount {
  id: string;
  email: string;
  passwordHash?: string;
  profile: UserProfile;
}

function getRegisteredAccounts(): Record<string, StoredUserAccount> {
  const raw = localStorage.getItem(USERS_INDEX_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveRegisteredAccounts(accounts: Record<string, StoredUserAccount>) {
  localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(accounts));
}

export const dbService = {
  // ----------------------------------------------------
  // MULTI-USER AUTHENTICATION (Supabase + Multi-User Persistent Engine)
  // ----------------------------------------------------

  async signUp(email: string, password?: string): Promise<{ profile: UserProfile; isNew: boolean }> {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = getRegisteredAccounts();

    // Check if real Supabase client is active
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password || 'ApexStudent2026!',
        });
        if (!error && data.user) {
          const userId = data.user.id;
          const newProfile: UserProfile = {
            id: userId,
            name: '',
            email: cleanEmail,
            grade: 'Class 10',
            target_percentage: 95,
            current_xp: 0,
            streak_days: 0,
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            is_premium: false,
          };

          accounts[cleanEmail] = {
            id: userId,
            email: cleanEmail,
            profile: newProfile,
          };
          saveRegisteredAccounts(accounts);
          localStorage.setItem(ACTIVE_USER_ID_KEY, userId);

          // Gracefully upsert into profiles; if table hasn't been created yet (PGRST205), safely log and don't block
          try {
            await supabase.from('profiles').upsert([newProfile]);
          } catch {
            // Handled gracefully
          }

          return { profile: newProfile, isNew: true };
        }
      } catch {
        // Fallback to local registry
      }
    }

    // Multi-User Registry
    if (accounts[cleanEmail]) {
      // User already exists, log in
      localStorage.setItem(ACTIVE_USER_ID_KEY, accounts[cleanEmail].id);
      return { profile: accounts[cleanEmail].profile, isNew: false };
    }

    const userId = 'u_' + Math.random().toString(36).substring(2, 10);
    const newProfile: UserProfile = {
      id: userId,
      name: '',
      email: cleanEmail,
      grade: 'Class 10',
      target_percentage: 95,
      current_xp: 0,
      streak_days: 0,
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      is_premium: false,
    };

    accounts[cleanEmail] = {
      id: userId,
      email: cleanEmail,
      profile: newProfile,
    };
    saveRegisteredAccounts(accounts);
    localStorage.setItem(ACTIVE_USER_ID_KEY, userId);

    return { profile: newProfile, isNew: true };
  },

  async signIn(email: string, password?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password || 'ApexStudent2026!',
        });
        if (!error && data.user) {
          localStorage.setItem(ACTIVE_USER_ID_KEY, data.user.id);
          const prof = await this.getCurrentProfile();
          if (prof) return prof;

          // If profiles table has not synced or returned PGRST205, synthesize user profile
          const accounts = getRegisteredAccounts();
          if (accounts[cleanEmail]) {
            return accounts[cleanEmail].profile;
          }
          const defaultProfile: UserProfile = {
            id: data.user.id,
            name: (data.user.user_metadata?.name as string) || cleanEmail.split('@')[0],
            email: cleanEmail,
            grade: 'Class 10',
            target_percentage: 95,
            current_xp: 0,
            streak_days: 0,
            onboarding_completed: false,
            created_at: data.user.created_at || new Date().toISOString(),
            is_premium: false,
          };
          accounts[cleanEmail] = {
            id: data.user.id,
            email: cleanEmail,
            profile: defaultProfile,
          };
          saveRegisteredAccounts(accounts);
          return defaultProfile;
        }
      } catch {
        // Fallback to local registry
      }
    }

    const accounts = getRegisteredAccounts();
    if (accounts[cleanEmail]) {
      localStorage.setItem(ACTIVE_USER_ID_KEY, accounts[cleanEmail].id);
      return accounts[cleanEmail].profile;
    }

    // Auto-register if logging in for the first time
    const { profile } = await this.signUp(cleanEmail, password);
    return profile;
  },

  async getCurrentProfile(): Promise<UserProfile | null> {
    const activeUserId = localStorage.getItem(ACTIVE_USER_ID_KEY);
    if (!activeUserId) return null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', activeUserId)
          .single();
        if (!error && data) {
          const profile: UserProfile = {
            id: data.id,
            name: data.name || '',
            email: data.email,
            grade: data.grade || 'Class 10',
            stream: data.stream as StudentStream | undefined,
            target_percentage: data.target_percentage || 95,
            current_xp: data.current_xp ?? 0,
            streak_days: data.streak_days ?? 0,
            last_active_date: data.last_active_date,
            onboarding_completed: data.onboarding_completed ?? false,
            created_at: data.created_at,
            is_premium: Boolean(data.is_premium),
          };
          this.syncLocalUserProfile(profile);
          return profile;
        }
      } catch {
        // Fallback to local registry
      }
    }

    const accounts = getRegisteredAccounts();
    for (const key in accounts) {
      if (accounts[key].id === activeUserId) {
        return accounts[key].profile;
      }
    }
    return null;
  },

  syncLocalUserProfile(profile: UserProfile) {
    const accounts = getRegisteredAccounts();
    const cleanEmail = profile.email.toLowerCase();
    if (accounts[cleanEmail]) {
      accounts[cleanEmail].profile = profile;
      saveRegisteredAccounts(accounts);
    }
  },

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    this.syncLocalUserProfile(profile);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('profiles').upsert([
          {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            grade: profile.grade,
            stream: profile.stream || null,
            target_percentage: profile.target_percentage,
            current_xp: profile.current_xp,
            streak_days: profile.streak_days,
            onboarding_completed: profile.onboarding_completed,
            last_active_date: profile.last_active_date || getLocalDateString(),
            is_premium: profile.is_premium ?? false,
          },
        ]);
      } catch {
        // Fallback handled
      }
    }
    return profile;
  },

  // Update premium status by email (used by Payhip payment success flow)
  async updatePremiumStatus(email: string, isPremium: boolean = true): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    let supabaseSuccess = false;

    // 1. Update in Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ is_premium: isPremium })
          .eq('email', cleanEmail);

        if (!error) {
          supabaseSuccess = true;
        }
      } catch {
        // Handled
      }
    }

    // 2. Also update in local registered accounts and active profile
    const accounts = getRegisteredAccounts();
    if (accounts[cleanEmail]) {
      accounts[cleanEmail].profile.is_premium = isPremium;
      saveRegisteredAccounts(accounts);
    }

    // 3. Update current profile in session if email matches
    const activeUserId = localStorage.getItem(ACTIVE_USER_ID_KEY);
    if (activeUserId) {
      for (const k in accounts) {
        if (accounts[k].id === activeUserId && accounts[k].email.toLowerCase() === cleanEmail) {
          accounts[k].profile.is_premium = isPremium;
          saveRegisteredAccounts(accounts);
        }
      }
    }

    return supabaseSuccess || Boolean(accounts[cleanEmail]);
  },

  async completeOnboarding(
    userId: string,
    name: string,
    targetPercentage: number,
    grade: GradeLevel,
    stream?: StudentStream
  ): Promise<UserProfile> {
    const current = await this.getCurrentProfile();
    const isSeniorClass = grade === 'Class 11' || grade === 'Class 12';

    const updated: UserProfile = {
      ...(current || {
        id: userId,
        email: 'student@school.edu',
        created_at: new Date().toISOString(),
      }),
      name: name.trim(),
      target_percentage: targetPercentage,
      grade,
      stream: isSeniorClass ? stream : undefined,
      current_xp: 0,
      streak_days: 0,
      onboarding_completed: true,
      last_active_date: getLocalDateString(),
    };

    await this.saveProfile(updated);
    // Generate initial 5 AI tasks for today based on class and stream
    await this.generateFreshDailyTasks(
      userId,
      grade,
      targetPercentage,
      updated.name,
      updated.stream
    );
    return updated;
  },

  async updateXP(userId: string, addedXP: number): Promise<number> {
    const current = await this.getCurrentProfile();
    if (!current) return 0;
    const newXP = (current.current_xp || 0) + addedXP;
    const updated: UserProfile = { ...current, current_xp: newXP };
    await this.saveProfile(updated);
    return newXP;
  },

  async updateGradeAndStream(
    userId: string,
    newGrade: GradeLevel,
    newStream?: StudentStream
  ): Promise<UserProfile | null> {
    const current = await this.getCurrentProfile();
    if (!current) return null;
    const isSenior = newGrade === 'Class 11' || newGrade === 'Class 12';
    const updated: UserProfile = {
      ...current,
      grade: newGrade,
      stream: isSenior ? (newStream || current.stream || 'PCM') : undefined,
    };
    await this.saveProfile(updated);
    await this.generateFreshDailyTasks(
      userId,
      newGrade,
      current.target_percentage,
      current.name,
      updated.stream
    );
    return updated;
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Handled
      }
    }
    localStorage.removeItem(ACTIVE_USER_ID_KEY);
  },

  // ----------------------------------------------------
  // DAILY 5 AI TASKS & RECURRING REAL-TIME NEXT-DAY LIFECYCLE
  // ----------------------------------------------------

  getActiveDate(userId: string): string {
    const sim = localStorage.getItem(`apex_sim_date_${userId}`);
    if (sim) return sim;
    return getLocalDateString();
  },

  getTomorrowDate(userId: string): string {
    const active = this.getActiveDate(userId);
    const [y, m, d] = active.split('-').map(Number);
    const nextD = new Date(y, m - 1, d + 1);
    const yStr = nextD.getFullYear();
    const mStr = String(nextD.getMonth() + 1).padStart(2, '0');
    const dStr = String(nextD.getDate()).padStart(2, '0');
    return `${yStr}-${mStr}-${dStr}`;
  },

  async getTodayTasks(userId: string): Promise<TodoTask[]> {
    await this.evaluateMidnightRollover(userId);
    const activeDate = this.getActiveDate(userId);
    return await this.getTasksForDate(userId, activeDate, false);
  },

  async getNextDayTasks(userId: string): Promise<TodoTask[]> {
    const tomorrow = this.getTomorrowDate(userId);
    return await this.getTasksForDate(userId, tomorrow, true);
  },

  async getTasksForDate(
    userId: string,
    dateStr: string,
    isNextDay = false
  ): Promise<TodoTask[]> {
    const userTasksKey = `apex_tasks_${userId}`;
    const raw = localStorage.getItem(userTasksKey);
    let tasks: TodoTask[] = raw ? JSON.parse(raw) : [];

    let dateTasks = tasks.filter((t) => t.day_date === dateStr);

    // Check Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('todo_tasks')
          .select('*')
          .eq('user_id', userId)
          .eq('day_date', dateStr);

        if (!error && data && data.length > 0) {
          const supabaseTasks = data as TodoTask[];
          const otherTasks = tasks.filter((t) => t.day_date !== dateStr);
          tasks = [...otherTasks, ...supabaseTasks];
          localStorage.setItem(userTasksKey, JSON.stringify(tasks));
          return supabaseTasks;
        }
      } catch {
        // Handled
      }
    }

    // If no tasks exist for this date, generate them via AI & Supabase
    if (dateTasks.length === 0) {
      const profile = await this.getCurrentProfile();
      if (profile && profile.onboarding_completed) {
        const activeToday = this.getActiveDate(userId);
        const todayCompleted = tasks
          .filter((t) => t.day_date === activeToday && t.completed)
          .map((t) => t.text);

        dateTasks = await this.generateDailyTasksForDate(
          userId,
          dateStr,
          profile.grade,
          profile.target_percentage,
          profile.name,
          profile.stream,
          isNextDay,
          todayCompleted
        );
      }
    }

    return dateTasks;
  },

  async generateDailyTasksForDate(
    userId: string,
    targetDate: string,
    grade: GradeLevel,
    targetPercentage: number,
    name: string,
    stream?: StudentStream,
    isNextDay = false,
    completedToday: string[] = []
  ): Promise<TodoTask[]> {
    let rawTasks: { text: string; subject: string; xp_reward: number }[] = [];

    try {
      const res = await fetch('/api/generate-daily-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          target_percentage: targetPercentage,
          name,
          stream,
          isNextDay,
          targetDate,
          completedToday,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        rawTasks = data.tasks;
      }
    } catch {
      // Fallback handled below
    }

    if (rawTasks.length === 0) {
      rawTasks = [
        { text: `${isNextDay ? 'Next Step ' : ''}Maths: Advance problem set for ${grade}`, subject: 'Mathematics', xp_reward: 50 },
        { text: `${isNextDay ? 'Follow-up ' : ''}Science: High-yield concept mastery & derivations`, subject: 'Science', xp_reward: 50 },
        { text: `Target ${targetPercentage}%: Master high-weightage practice questions`, subject: 'Revision', xp_reward: 50 },
        { text: `Language & Literature: Core chapter analysis & writing`, subject: 'English', xp_reward: 50 },
        { text: `Active Recall Sprint: 20 minutes self-testing session`, subject: 'Self-Study', xp_reward: 50 },
      ];
    }

    const newTasks: TodoTask[] = rawTasks.slice(0, 5).map((t, idx) => ({
      id: `task_${userId}_${targetDate.replace(/-/g, '_')}_${idx}`,
      user_id: userId,
      text: t.text,
      subject: t.subject || 'Study',
      completed: false,
      xp_reward: t.xp_reward || 50,
      day_date: targetDate,
      created_at: new Date().toISOString(),
    }));

    // Save to local cache
    const userTasksKey = `apex_tasks_${userId}`;
    const raw = localStorage.getItem(userTasksKey);
    const existing: TodoTask[] = raw ? JSON.parse(raw) : [];
    const withoutTargetDate = existing.filter((t) => t.day_date !== targetDate);
    const combined = [...withoutTargetDate, ...newTasks];
    localStorage.setItem(userTasksKey, JSON.stringify(combined));

    // Mirror directly to Supabase cloud
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('todo_tasks').upsert(newTasks);
      } catch {
        // Handled
      }
    }

    // Initialize 0% log for this date if it's the active date
    if (targetDate === this.getActiveDate(userId)) {
      this.recordDailyProgress(userId, targetDate, 0, 5);
    }

    return newTasks;
  },

  async generateFreshDailyTasks(
    userId: string,
    grade: GradeLevel,
    targetPercentage: number,
    name: string,
    stream?: StudentStream
  ): Promise<TodoTask[]> {
    const activeDate = this.getActiveDate(userId);
    return await this.generateDailyTasksForDate(
      userId,
      activeDate,
      grade,
      targetPercentage,
      name,
      stream,
      false
    );
  },

  // Toggle task completion (check in)
  // When user checks in a task, the next day's task schedule is automatically prepared in Supabase!
  async toggleTask(userId: string, taskId: string, completed: boolean): Promise<boolean> {
    const userTasksKey = `apex_tasks_${userId}`;
    const raw = localStorage.getItem(userTasksKey);
    if (!raw) return completed;

    const tasks: TodoTask[] = JSON.parse(raw);
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed } : t));
    localStorage.setItem(userTasksKey, JSON.stringify(updated));

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('todo_tasks')
          .update({ completed })
          .eq('id', taskId)
          .eq('user_id', userId);
      } catch {
        // Handled securely
      }
    }

    const activeDate = this.getActiveDate(userId);
    const todayTasks = updated.filter((t) => t.day_date === activeDate);
    const completedCount = todayTasks.filter((t) => t.completed).length;
    const totalCount = todayTasks.length || 5;

    this.recordDailyProgress(userId, activeDate, completedCount, totalCount);

    // Update streak if today has completions
    const profile = await this.getCurrentProfile();
    if (profile) {
      if (completedCount > 0 && profile.streak_days === 0) {
        await this.saveProfile({ ...profile, streak_days: 1 });
      }
    }

    // Check-in requirement: When the user checks in a task, pre-generate next day's tasks with AI & Supabase
    if (completed) {
      this.ensureNextDayTasksPrepared(userId).catch(() => {});
    }

    return completed;
  },

  // Ensure next day tasks are ready in Supabase & local cache
  async ensureNextDayTasksPrepared(userId: string): Promise<TodoTask[]> {
    const tomorrow = this.getTomorrowDate(userId);
    const userTasksKey = `apex_tasks_${userId}`;
    const raw = localStorage.getItem(userTasksKey);
    const tasks: TodoTask[] = raw ? JSON.parse(raw) : [];
    const tomorrowTasks = tasks.filter((t) => t.day_date === tomorrow);

    if (tomorrowTasks.length >= 5) {
      return tomorrowTasks;
    }

    const profile = await this.getCurrentProfile();
    if (!profile) return [];

    const activeDate = this.getActiveDate(userId);
    const todayCompleted = tasks
      .filter((t) => t.day_date === activeDate && t.completed)
      .map((t) => t.text);

    return await this.generateDailyTasksForDate(
      userId,
      tomorrow,
      profile.grade,
      profile.target_percentage,
      profile.name,
      profile.stream,
      true,
      todayCompleted
    );
  },

  // Real-time midnight / calendar day rollover evaluation
  async evaluateMidnightRollover(userId: string) {
    const realToday = getLocalDateString();
    const lastEvalKey = `apex_last_eval_${userId}`;
    const lastEval = localStorage.getItem(lastEvalKey);

    if (lastEval && lastEval !== realToday) {
      const userTasksKey = `apex_tasks_${userId}`;
      const raw = localStorage.getItem(userTasksKey);
      const tasks: TodoTask[] = raw ? JSON.parse(raw) : [];

      const yesterdayTasks = tasks.filter((t) => t.day_date === lastEval);
      if (yesterdayTasks.length > 0) {
        const completedCount = yesterdayTasks.filter((t) => t.completed).length;
        this.recordDailyProgress(userId, lastEval, completedCount, yesterdayTasks.length);

        const profile = await this.getCurrentProfile();
        if (profile) {
          const newStreak = completedCount > 0 ? (profile.streak_days || 0) + 1 : 0;
          await this.saveProfile({ ...profile, streak_days: newStreak, last_active_date: realToday });
        }
      }

      localStorage.setItem(lastEvalKey, realToday);
      // Auto pre-generate next day tasks on calendar day rollover
      await this.ensureNextDayTasksPrepared(userId);
    } else if (!lastEval) {
      localStorage.setItem(lastEvalKey, realToday);
    }
  },

  // Real-time manual day advancement simulation (allows user to test the end-of-day rollover freely!)
  async advanceToNextDay(userId: string): Promise<{ newDate: string; previousDate: string }> {
    const previousDate = this.getActiveDate(userId);
    const userTasksKey = `apex_tasks_${userId}`;
    const raw = localStorage.getItem(userTasksKey);
    const tasks: TodoTask[] = raw ? JSON.parse(raw) : [];

    // Finalize previous day's record
    const prevTasks = tasks.filter((t) => t.day_date === previousDate);
    const completedCount = prevTasks.filter((t) => t.completed).length;
    this.recordDailyProgress(userId, previousDate, completedCount, prevTasks.length || 5);

    const profile = await this.getCurrentProfile();
    if (profile) {
      const newStreak = completedCount > 0 ? (profile.streak_days || 0) + 1 : 0;
      await this.saveProfile({ ...profile, streak_days: newStreak });
    }

    // Advance active date by 1 day
    const [y, m, d] = previousDate.split('-').map(Number);
    const nextD = new Date(y, m - 1, d + 1);
    const newDateStr = `${nextD.getFullYear()}-${String(nextD.getMonth() + 1).padStart(2, '0')}-${String(nextD.getDate()).padStart(2, '0')}`;

    localStorage.setItem(`apex_sim_date_${userId}`, newDateStr);

    // Ensure new date tasks are loaded/generated
    await this.getTasksForDate(userId, newDateStr, false);

    // Prepare subsequent next day's tasks
    await this.ensureNextDayTasksPrepared(userId);

    return { newDate: newDateStr, previousDate };
  },

  resetToRealTimeDate(userId: string): string {
    localStorage.removeItem(`apex_sim_date_${userId}`);
    return getLocalDateString();
  },

  // ----------------------------------------------------
  // MONTHLY PROGRESS LOGS
  // ----------------------------------------------------

  recordDailyProgress(userId: string, dateStr: string, completedCount: number, totalCount: number) {
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const logsKey = `apex_logs_${userId}`;
    const raw = localStorage.getItem(logsKey);
    const logs: Record<string, DailyHistoryRecord> = raw ? JSON.parse(raw) : {};

    logs[dateStr] = {
      date: dateStr,
      completedCount,
      totalCount,
      percentage,
    };

    localStorage.setItem(logsKey, JSON.stringify(logs));
  },

  getMonthlyHistory(userId: string, year: number, month: number): DailyHistoryRecord[] {
    const daysInMonth = new Date(year, month, 0).getDate();
    const logsKey = `apex_logs_${userId}`;
    const raw = localStorage.getItem(logsKey);
    const logs: Record<string, DailyHistoryRecord> = raw ? JSON.parse(raw) : {};

    const records: DailyHistoryRecord[] = [];
    const today = getLocalDateString();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (logs[dayStr]) {
        records.push(logs[dayStr]);
      } else {
        if (dayStr === today) {
          const userTasksKey = `apex_tasks_${userId}`;
          const rawTasks = localStorage.getItem(userTasksKey);
          const tasks: TodoTask[] = rawTasks ? JSON.parse(rawTasks) : [];
          const todayTasks = tasks.filter((t) => t.day_date === today);
          const completedCount = todayTasks.filter((t) => t.completed).length;
          const totalCount = todayTasks.length || 5;
          const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          records.push({ date: dayStr, completedCount, totalCount, percentage });
        } else {
          records.push({
            date: dayStr,
            completedCount: 0,
            totalCount: 5,
            percentage: 0,
          });
        }
      }
    }
    return records;
  },

  // ----------------------------------------------------
  // NCERT CHAPTER WISE CHECKLIST PERSISTENCE
  // ----------------------------------------------------

  getChapterRevisionState(userId: string): Record<string, boolean> {
    const key = `apex_chapters_${userId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  },

  async toggleChapterRevised(userId: string, chapterId: string): Promise<boolean> {
    const key = `apex_chapters_${userId}`;
    const current = this.getChapterRevisionState(userId);
    const nextState = !current[chapterId];
    current[chapterId] = nextState;
    localStorage.setItem(key, JSON.stringify(current));

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('chapter_revisions').upsert([
          {
            user_id: userId,
            chapter_id: chapterId,
            revised: nextState,
            updated_at: new Date().toISOString(),
          },
        ]);
      } catch {
        // Handled
      }
    }

    return nextState;
  },

  // ----------------------------------------------------
  // STUDY MATERIALS
  // ----------------------------------------------------

  async getStudyMaterials(userId: string): Promise<StudyMaterial[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('study_materials')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as StudyMaterial[];
        }
      } catch {
        // Handled by local fallback
      }
    }

    const matKey = `apex_materials_${userId}`;
    const raw = localStorage.getItem(matKey);
    return raw ? JSON.parse(raw) : [];
  },

  async saveStudyMaterial(material: Omit<StudyMaterial, 'id' | 'created_at'>): Promise<StudyMaterial> {
    const newMaterial: StudyMaterial = {
      ...material,
      id: 'mat_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };

    const matKey = `apex_materials_${material.user_id}`;
    const raw = localStorage.getItem(matKey);
    const materials: StudyMaterial[] = raw ? JSON.parse(raw) : [];
    materials.unshift(newMaterial);
    localStorage.setItem(matKey, JSON.stringify(materials));

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('study_materials').insert([newMaterial]);
      } catch {
        // Handled
      }
    }
    return newMaterial;
  },

  // ----------------------------------------------------
  // REAL-TIME DATABASE HEALTH & TABLE DIAGNOSTIC
  // ----------------------------------------------------
  async checkDatabaseStatus(): Promise<{
    configured: boolean;
    url: string;
    allCoreReady: boolean;
    tables: {
      profiles: boolean;
      todo_tasks: boolean;
      chapter_revisions: boolean;
      study_materials: boolean;
      daily_task_logs: boolean;
    };
    errorDetails?: string;
  }> {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        configured: false,
        url: currentUrl,
        allCoreReady: false,
        tables: {
          profiles: false,
          todo_tasks: false,
          chapter_revisions: false,
          study_materials: false,
          daily_task_logs: false,
        },
        errorDetails: 'Supabase credentials not configured in environment',
      };
    }

    const tables = {
      profiles: false,
      todo_tasks: false,
      chapter_revisions: false,
      study_materials: false,
      daily_task_logs: false,
    };

    let firstError: string | undefined;

    try {
      const p = await supabase.from('profiles').select('id').limit(1);
      tables.profiles = !p.error;
      if (p.error && !firstError) firstError = `profiles: ${p.error.message}`;

      const t = await supabase.from('todo_tasks').select('id').limit(1);
      tables.todo_tasks = !t.error;
      if (t.error && !firstError) firstError = `todo_tasks: ${t.error.message}`;

      const c = await supabase.from('chapter_revisions').select('user_id').limit(1);
      tables.chapter_revisions = !c.error;
      if (c.error && !firstError) firstError = `chapter_revisions: ${c.error.message}`;

      const m = await supabase.from('study_materials').select('id').limit(1);
      tables.study_materials = !m.error;
      if (m.error && !firstError) firstError = `study_materials: ${m.error.message}`;

      const l = await supabase.from('daily_task_logs').select('id').limit(1);
      tables.daily_task_logs = !l.error;
      if (l.error && !firstError && !tables.profiles) firstError = `daily_task_logs: ${l.error.message}`;
    } catch (e: any) {
      firstError = e.message;
    }

    // Core tables required for live operations
    const allCoreReady = tables.profiles && tables.todo_tasks && tables.chapter_revisions && tables.study_materials;

    return {
      configured: true,
      url: currentUrl,
      allCoreReady,
      tables,
      errorDetails: firstError,
    };
  },
};

