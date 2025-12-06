import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subject, Task, ScheduleItem, UserStats, User, UserData } from '@/types';
import { api } from '@/lib/api';

interface AppState {
  user: User | null;
  subjects: Subject[];
  tasks: Task[];
  schedule: ScheduleItem[];
  stats: UserStats;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSyncing: boolean;

  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string) => Promise<void>;
  verify: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;

  syncFromServer: () => Promise<void>;
  syncToServer: () => Promise<void>;
  setLoading: (loading: boolean) => void;

  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;

  setSchedule: (schedule: ScheduleItem[]) => void;
  generateSchedule: (availableMinutes?: number) => Promise<void>;
  completeScheduleItem: (id: string) => void;

  updateStats: (stats: Partial<UserStats>) => void;
  incrementStreak: () => void;
  addStudyTime: (subjectId: string, minutes: number) => void;

  setData: (data: Partial<UserData>) => void;
}

const defaultStats: UserStats = {
  streak: 0,
  total_study_time: 0,
  time_spent_by_subject: {},
  tasks_completed: 0,
  weekly_study_days: [false, false, false, false, false, false, false],
};

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
const SYNC_DEBOUNCE_MS = 2000;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      subjects: [],
      tasks: [],
      schedule: [],
      stats: defaultStats,
      isAuthenticated: false,
      isLoading: false,
      isSyncing: false,

      setLoading: (loading) => set({ isLoading: loading }),

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.auth.login(email, password);
          set({
            user: {
              id: response.user.email,
              email: response.user.email,
              first_name: response.user.firstName,
              verified: true,
              created_at: new Date().toISOString(),
            },
            isAuthenticated: true,
          });

          await get().syncFromServer();
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (email, password, firstName) => {
        set({ isLoading: true });
        try {
          await api.auth.signup(email, password, firstName);
        } finally {
          set({ isLoading: false });
        }
      },

      verify: async (email, code) => {
        set({ isLoading: true });
        try {
          const response = await api.auth.verify(email, code);
          set({
            user: {
              id: response.user.email,
              email: response.user.email,
              first_name: response.user.firstName,
              verified: true,
              created_at: new Date().toISOString(),
            },
            isAuthenticated: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await api.auth.logout();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            subjects: [],
            tasks: [],
            schedule: [],
            stats: defaultStats,
          });
        }
      },

      checkAuth: async () => {
        const result = await api.auth.verifyToken();
        if (result) {
          set({
            user: {
              id: result.user.email,
              email: result.user.email,
              first_name: result.user.firstName,
              verified: true,
              created_at: new Date().toISOString(),
            },
            isAuthenticated: true,
          });
          return true;
        }
        set({ user: null, isAuthenticated: false });
        return false;
      },

      syncFromServer: async () => {
        const token = api.getToken();
        if (!token) return;

        set({ isSyncing: true });
        try {
          const data = await api.data.getData();
          set({
            subjects: data.subjects || [],
            tasks: data.tasks || [],
            schedule: data.schedule || [],
            stats: data.stats || defaultStats,
          });
        } catch (error) {
          console.error('Failed to sync from server:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      syncToServer: async () => {
        const token = api.getToken();
        if (!token) return;

        const state = get();
        const data: UserData = {
          subjects: state.subjects,
          tasks: state.tasks,
          schedule: state.schedule,
          stats: state.stats,
        };

        set({ isSyncing: true });
        try {
          await api.data.updateData(data);
        } catch (error) {
          console.error('Failed to sync to server:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      _triggerSync: () => {
        if (syncTimeout) clearTimeout(syncTimeout);
        syncTimeout = setTimeout(() => {
          get().syncToServer();
        }, SYNC_DEBOUNCE_MS);
      },

      addSubject: (subject) => {
        set((state) => ({ subjects: [...state.subjects, subject] }));
        (get() as any)._triggerSync();
      },

      updateSubject: (id, updates) => {
        set((state) => ({
          subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
        (get() as any)._triggerSync();
      },

      deleteSubject: (id) => {
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
          tasks: state.tasks.filter((t) => t.subject_id !== id),
        }));
        (get() as any)._triggerSync();
      },

      addTask: (task) => {
        set((state) => ({ tasks: [...state.tasks, task] }));
        (get() as any)._triggerSync();
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
        (get() as any)._triggerSync();
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
        (get() as any)._triggerSync();
      },

      completeTask: (id) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task || task.completed) return state;

          const lastStudyDate = localStorage.getItem('onslaught-last-study-date');
          const todayStr = new Date().toDateString();
          const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

          let newStreak = state.stats.streak;
          if (lastStudyDate !== todayStr) {
            if (lastStudyDate === yesterdayStr) {
              newStreak = state.stats.streak + 1;
            } else if (!lastStudyDate) {
              newStreak = 1;
            } else {
              newStreak = 1;
            }
            localStorage.setItem('onslaught-last-study-date', todayStr);
          }

          return {
            tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed: true } : t)),
            stats: {
              ...state.stats,
              tasks_completed: state.stats.tasks_completed + 1,
              streak: newStreak,
            },
          };
        });
        (get() as any)._triggerSync();
      },

      setSchedule: (schedule) => {
        set({ schedule });
        (get() as any)._triggerSync();
      },

      generateSchedule: async (availableMinutes) => {
        const token = api.getToken();
        if (!token) {
          const { generateSchedule } = await import('@/lib/scheduler');
          const state = get();
          const schedule = generateSchedule(state.tasks, state.subjects, availableMinutes);
          set({ schedule });
          return;
        }

        set({ isLoading: true });
        try {
          const schedule = await api.data.generateSchedule(availableMinutes);
          set({ schedule });
        } catch (error) {
          console.error('Failed to generate schedule:', error);

          const { generateSchedule } = await import('@/lib/scheduler');
          const state = get();
          const schedule = generateSchedule(state.tasks, state.subjects, availableMinutes);
          set({ schedule });
        } finally {
          set({ isLoading: false });
        }
      },

      completeScheduleItem: (id) => {
        set((state) => ({
          schedule: state.schedule.map((s) => (s.id === id ? { ...s, completed: true } : s)),
        }));
        (get() as any)._triggerSync();
      },

      updateStats: (updates) => {
        set((state) => ({ stats: { ...state.stats, ...updates } }));
        (get() as any)._triggerSync();
      },

      incrementStreak: () => {
        set((state) => ({
          stats: { ...state.stats, streak: state.stats.streak + 1 },
        }));
        (get() as any)._triggerSync();
      },

      addStudyTime: (subjectId, minutes) => {
        set((state) => {
          const today = new Date().getDay();

          const dayIndex = today === 0 ? 6 : today - 1;

          const newWeeklyDays = [...state.stats.weekly_study_days];
          newWeeklyDays[dayIndex] = true;

          return {
            stats: {
              ...state.stats,
              total_study_time: state.stats.total_study_time + minutes,
              time_spent_by_subject: {
                ...state.stats.time_spent_by_subject,
                [subjectId]: (state.stats.time_spent_by_subject[subjectId] || 0) + minutes,
              },
              weekly_study_days: newWeeklyDays,
            },
          };
        });
        (get() as any)._triggerSync();
      },

      setData: (data) => {
        set((state) => ({
          subjects: data.subjects ?? state.subjects,
          tasks: data.tasks ?? state.tasks,
          schedule: data.schedule ?? state.schedule,
          stats: data.stats ?? state.stats,
        }));
      },
    }),
    {
      name: 'onslaught-storage',
      partialize: (state) => ({
        subjects: state.subjects,
        tasks: state.tasks,
        schedule: state.schedule,
        stats: state.stats,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
