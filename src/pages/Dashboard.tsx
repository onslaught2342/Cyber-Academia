import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/common/StatCard';
import { TaskCard } from '@/components/common/TaskCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/stores/appStore';
import { Flame, ListTodo, Clock, Zap, Plus, BookOpen, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, subjects, tasks, stats, generateSchedule, completeTask, addStudyTime } =
    useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const upcomingTasks = incompleteTasks
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3);

  const handleGenerateSchedule = async () => {
    if (incompleteTasks.length === 0) {
      toast.info('No tasks to schedule. Add some tasks first!');
      return;
    }
    setIsGenerating(true);
    try {
      await generateSchedule();
      toast.success("Today's schedule generated!");
      navigate('/today');
    } catch (error) {
      toast.error('Failed to generate schedule');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      completeTask(taskId);
      addStudyTime(task.subject_id, task.duration);
    }
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h` : `${minutes}m`;
  };

  return (
    <PageLayout
      title={`Welcome back, ${user?.first_name || 'Student'}!`}
      subtitle="Your academic command center awaits"
    >
      {}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Current Streak"
          value={stats.streak}
          subtitle="days"
          icon={Flame}
          glow="purple"
        />
        <StatCard
          title="Tasks Due"
          value={incompleteTasks.length}
          subtitle="pending"
          icon={ListTodo}
          glow="cyan"
        />
        <StatCard
          title="Total Study Time"
          value={formatStudyTime(stats.total_study_time)}
          subtitle="this week"
          icon={Clock}
          glow="cyan"
        />
        <StatCard
          title="Completed"
          value={stats.tasks_completed}
          subtitle="tasks"
          icon={Zap}
          glow="purple"
        />
      </div>

      {}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Button
          variant="neon"
          size="xl"
          className="h-auto py-6 flex-col gap-2"
          onClick={() => navigate('/tasks')}
        >
          <Plus className="h-6 w-6" />
          <span>Add Task</span>
        </Button>
        <Button
          variant="neon-purple"
          size="xl"
          className="h-auto py-6 flex-col gap-2"
          onClick={() => navigate('/subjects')}
        >
          <BookOpen className="h-6 w-6" />
          <span>Add Subject</span>
        </Button>
        <Button
          variant="neon-outline"
          size="xl"
          className="h-auto py-6 flex-col gap-2"
          onClick={handleGenerateSchedule}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Calendar className="h-6 w-6" />
          )}
          <span>{isGenerating ? 'Generating...' : "Generate Today's Plan"}</span>
        </Button>
      </div>

      {}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card glow="cyan">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => {
                const subject = subjects.find((s) => s.id === task.subject_id);
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    subject={subject}
                    onComplete={() => handleCompleteTask(task.id)}
                    showActions={false}
                  />
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ListTodo className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No tasks yet. Add your first task!</p>
              </div>
            )}
            {incompleteTasks.length > 3 && (
              <Button variant="ghost" className="w-full" onClick={() => navigate('/tasks')}>
                View all {incompleteTasks.length} tasks →
              </Button>
            )}
          </CardContent>
        </Card>

        <Card glow="purple">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-secondary" />
              Your Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subjects.length > 0 ? (
              <div className="space-y-3">
                {subjects.slice(0, 5).map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="font-medium">{subject.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Difficulty:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor:
                                level <= subject.difficulty ? subject.color : 'hsl(var(--muted))',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {subjects.length > 5 && (
                  <Button variant="ghost" className="w-full" onClick={() => navigate('/subjects')}>
                    View all {subjects.length} subjects →
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No subjects yet. Add your first subject!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
