import { Task, Subject, ScheduleItem } from '@/types';

export function calculatePriority(task: Task, subject: Subject | undefined): number {
  const now = new Date();
  const dueDate = new Date(task.due_date);
  const daysUntilDue = Math.max(
    1,
    Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  const urgency = 1 / daysUntilDue;

  const difficulty = subject?.difficulty || 3;

  const typeWeights: Record<string, number> = {
    exam: 1.5,
    assignment: 1.2,
    revision: 1.0,
    practice: 0.8,
  };
  const typeWeight = typeWeights[task.type] || 1;

  const durationFactor = task.duration / 60;

  const priority =
    urgency * 0.5 + (difficulty / 5) * 0.25 + durationFactor * 0.1 + typeWeight * 0.15;

  return priority;
}

export function generateSchedule(
  tasks: Task[],
  subjects: Subject[],
  availableMinutes: number = 240
): ScheduleItem[] {
  const incompleteTasks = tasks.filter((t) => !t.completed);

  const tasksWithPriority = incompleteTasks.map((task) => {
    const subject = subjects.find((s) => s.id === task.subject_id);
    return {
      task,
      priority: calculatePriority(task, subject),
    };
  });

  tasksWithPriority.sort((a, b) => b.priority - a.priority);

  const schedule: ScheduleItem[] = [];
  let remainingMinutes = availableMinutes;
  let currentTime = new Date();
  currentTime.setHours(9, 0, 0, 0);

  for (const { task } of tasksWithPriority) {
    if (remainingMinutes <= 0) break;

    const duration = Math.min(task.duration, remainingMinutes);

    const startTime = new Date(currentTime);
    const endTime = new Date(currentTime.getTime() + duration * 60 * 1000);

    schedule.push({
      id: `schedule-${task.id}-${Date.now()}`,
      task_id: task.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      completed: false,
    });

    remainingMinutes -= duration;
    currentTime = new Date(endTime.getTime() + 15 * 60 * 1000);
  }

  return schedule;
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
