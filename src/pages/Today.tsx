import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/appStore';
const { formatDuration, formatTime } = await import('@/lib/scheduler');
import { toast } from 'sonner';
import { Calendar, Clock, Check, RefreshCw, Play, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Today() {
  const {
    subjects,
    tasks,
    schedule,
    generateSchedule,
    completeScheduleItem,
    completeTask,
    addStudyTime,
    isLoading,
  } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSchedule = async () => {
    const incompleteTasks = tasks.filter((t) => !t.completed);
    if (incompleteTasks.length === 0) {
      toast.info('No tasks to schedule. Add some tasks first!');
      return;
    }
    setIsGenerating(true);
    try {
      await generateSchedule();
      toast.success('Schedule generated!');
    } catch (error) {
      toast.error('Failed to generate schedule');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteItem = (scheduleItemId: string, taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const subject = task ? subjects.find((s) => s.id === task.subject_id) : null;

    completeScheduleItem(scheduleItemId);
    completeTask(taskId);

    if (task && subject) {
      addStudyTime(subject.id, task.duration);
    }

    toast.success('Great work! Task completed!');
  };

  const completedCount = schedule.filter((s) => s.completed).length;
  const progress = schedule.length > 0 ? (completedCount / schedule.length) * 100 : 0;
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <PageLayout title="TODAY'S PLAN" subtitle={today}>
      {}
      {schedule.length > 0 && (
        <Card glow="cyan" className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-display font-bold tracking-wider">DAILY PROGRESS</span>
              </div>
              <span className="text-2xl font-display font-bold text-primary">
                {completedCount}/{schedule.length}
              </span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              {progress === 100
                ? 'All tasks completed! Amazing work!'
                : progress > 50
                  ? "You're doing great, keep going!"
                  : "Let's crush some tasks today!"}
            </p>
          </CardContent>
        </Card>
      )}

      {}
      <div className="flex gap-4 mb-8">
        <Button
          variant="neon"
          size="lg"
          onClick={handleGenerateSchedule}
          className="flex items-center gap-2"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : schedule.length > 0 ? (
            <>
              <RefreshCw className="h-5 w-5" />
              Regenerate Schedule
            </>
          ) : (
            <>
              <Calendar className="h-5 w-5" />
              Generate Today's Schedule
            </>
          )}
        </Button>
      </div>

      {}
      {schedule.length > 0 ? (
        <div className="space-y-4">
          {schedule.map((item, index) => {
            const task = tasks.find((t) => t.id === item.task_id);
            const subject = task ? subjects.find((s) => s.id === task.subject_id) : null;

            if (!task) return null;

            return (
              <Card
                key={item.id}
                glow={item.completed ? 'none' : 'cyan'}
                className={cn('transition-all duration-300', item.completed && 'opacity-60')}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {}
                    <div className="w-32 md:w-40 p-4 border-r border-border/50 flex flex-col items-center justify-center bg-muted/20">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Block {index + 1}
                      </span>
                      <span className="text-lg font-mono font-bold text-primary mt-1">
                        {formatTime(item.start_time)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(task.duration)}
                      </span>
                    </div>

                    {}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3
                            className={cn(
                              'font-display font-bold tracking-wider text-lg',
                              item.completed && 'line-through text-muted-foreground'
                            )}
                          >
                            {task.title}
                          </h3>
                          {subject && (
                            <div className="flex items-center gap-2 mt-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor: subject.color,
                                  boxShadow: `0 0 8px ${subject.color}`,
                                }}
                              />
                              <span
                                className="text-sm font-medium"
                                style={{ color: subject.color }}
                              >
                                {subject.name}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDuration(task.duration)}
                            </span>
                            <span className="capitalize px-2 py-0.5 rounded-md bg-muted text-xs">
                              {task.type}
                            </span>
                          </div>
                        </div>

                        {!item.completed && (
                          <Button
                            variant="neon"
                            size="lg"
                            onClick={() => handleCompleteItem(item.id, task.id)}
                            className="shrink-0"
                          >
                            <Check className="h-5 w-5" />
                            Complete
                          </Button>
                        )}
                        {item.completed && (
                          <div className="flex items-center gap-2 text-primary">
                            <Check className="h-6 w-6" />
                            <span className="font-display font-bold tracking-wider">DONE</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-display mb-2">No schedule for today</h3>
            <p className="text-muted-foreground mb-4">
              Generate a smart schedule based on your tasks and priorities
            </p>
            <Button variant="neon" onClick={handleGenerateSchedule}>
              <Play className="h-4 w-4" />
              Generate Schedule
            </Button>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
