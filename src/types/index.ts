export interface Subject {
  id: string;
  name: string;
  difficulty: number;
  color: string;
}

export interface Task {
  id: string;
  subject_id: string;
  title: string;
  description?: string;
  type: 'revision' | 'assignment' | 'exam' | 'practice';
  due_date: string;
  duration: number;
  completed: boolean;
  priority?: number;
  created_at?: string;
}

export interface ScheduleItem {
  id: string;
  task_id: string;
  start_time: string;
  end_time: string;
  completed: boolean;
}

export interface UserStats {
  streak: number;
  total_study_time: number;
  time_spent_by_subject: Record<string, number>;
  tasks_completed: number;
  weekly_study_days: boolean[];
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  verified: boolean;
  created_at: string;
}

export interface UserData {
  subjects: Subject[];
  tasks: Task[];
  schedule: ScheduleItem[];
  stats: UserStats;
}
