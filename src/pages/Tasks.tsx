import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskCard } from '@/components/common/TaskCard';
import { useAppStore } from '@/stores/appStore';
import { Task } from '@/types';
import { toast } from 'sonner';
import { Plus, X, Check, ListTodo, Filter } from 'lucide-react';
import { DatePicker } from '@/components/common/DatePicker';
import { cn } from '@/lib/utils';

const TASK_TYPES = ['revision', 'assignment', 'exam', 'practice'] as const;

export default function Tasks() {
  const { subjects, tasks, addTask, updateTask, deleteTask, completeTask, addStudyTime } =
    useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [type, setType] = useState<Task['type']>('revision');
  const [dueDate, setDueDate] = useState('');
  const [duration, setDuration] = useState(30);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const resetForm = () => {
    setTitle('');
    setSubjectId('');
    setType('revision');
    setDueDate('');
    setDuration(30);
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    if (!subjectId) {
      toast.error('Please select a subject');
      return;
    }
    if (!dueDate) {
      toast.error('Please select a due date');
      return;
    }

    if (editingId) {
      updateTask(editingId, {
        title: title.trim(),
        subject_id: subjectId,
        type,
        due_date: new Date(dueDate).toISOString(),
        duration,
      });
      toast.success('Task updated!');
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: title.trim(),
        subject_id: subjectId,
        type,
        due_date: new Date(dueDate).toISOString(),
        duration,
        completed: false,
      };
      addTask(newTask);
      toast.success('Task added!');
    }
    resetForm();
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setSubjectId(task.subject_id);
    setType(task.type);
    setDueDate(new Date(task.due_date).toISOString().split('T')[0]);
    setDuration(task.duration);
    setShowForm(true);
  };

  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && !task.completed) {
      completeTask(taskId);
      addStudyTime(task.subject_id, task.duration);
    }
  };

  const filteredTasks = tasks
    .filter((task) => {
      if (filter === 'pending') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

  return (
    <PageLayout title="TASKS" subtitle="Manage your assignments, revisions, and exams">
      {}
      {showForm ? (
        <Card glow="cyan" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingId ? 'Edit Task' : 'Add New Task'}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Task Title</label>
                <Input
                  placeholder="e.g., Complete Chapter 5 revision"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                {subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => setSubjectId(subject.id)}
                        className={cn(
                          'px-4 py-2 rounded-lg border-2 transition-all duration-300 font-medium',
                          subjectId === subject.id
                            ? 'border-primary bg-primary/20'
                            : 'border-border hover:border-primary/50'
                        )}
                        style={{
                          color: subjectId === subject.id ? subject.color : undefined,
                          boxShadow:
                            subjectId === subject.id ? `0 0 10px ${subject.color}40` : undefined,
                        }}
                      >
                        {subject.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No subjects available. Please add a subject first.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Task Type</label>
                <div className="flex flex-wrap gap-2">
                  {TASK_TYPES.map((taskType) => (
                    <button
                      key={taskType}
                      type="button"
                      onClick={() => setType(taskType)}
                      className={cn(
                        'px-4 py-2 rounded-lg border-2 transition-all duration-300 capitalize',
                        type === taskType
                          ? 'border-primary bg-primary/20 text-primary shadow-neon-cyan'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      )}
                    >
                      {taskType}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                <DatePicker value={dueDate} onChange={setDueDate} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min={5}
                  max={480}
                  step={5}
                  className="max-w-[200px]"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" variant="neon" size="lg" disabled={subjects.length === 0}>
                  {editingId ? (
                    <>
                      <Check className="h-4 w-4" /> Update Task
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Add Task
                    </>
                  )}
                </Button>
                <Button type="button" variant="ghost" size="lg" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <Button
            variant="neon"
            size="lg"
            onClick={() => setShowForm(true)}
            disabled={subjects.length === 0}
          >
            <Plus className="h-5 w-5" />
            Add Task
          </Button>
          {subjects.length === 0 && (
            <span className="text-sm text-muted-foreground">
              Add a subject first to create tasks
            </span>
          )}
        </div>
      )}

      {}
      {tasks.length > 0 && (
        <div className="flex items-center gap-4 mb-6">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1 rounded-lg text-sm capitalize transition-all duration-300',
                  filter === f
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="text-sm text-muted-foreground ml-auto">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const subject = subjects.find((s) => s.id === task.subject_id);
            return (
              <TaskCard
                key={task.id}
                task={task}
                subject={subject}
                onComplete={() => handleCompleteTask(task.id)}
                onEdit={() => handleEdit(task)}
                onDelete={() => {
                  deleteTask(task.id);
                  toast.success('Task deleted!');
                }}
              />
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ListTodo className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-display mb-2">
              {tasks.length === 0 ? 'No tasks yet' : `No ${filter} tasks`}
            </h3>
            <p className="text-muted-foreground mb-4">
              {tasks.length === 0
                ? 'Add your first task to start tracking your studies'
                : 'Try changing the filter'}
            </p>
            {tasks.length === 0 && subjects.length > 0 && (
              <Button variant="neon" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" />
                Add Your First Task
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
