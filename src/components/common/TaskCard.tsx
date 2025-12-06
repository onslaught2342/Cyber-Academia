import { Task, Subject } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubjectBadge } from './SubjectBadge';
const { formatDuration } = await import('@/lib/scheduler');
import { Check, Clock, Calendar, Trash2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  subject?: Subject;
  onComplete?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

export function TaskCard({
  task,
  subject,
  onComplete,
  onDelete,
  onEdit,
  showActions = true,
}: TaskCardProps) {
  const dueDate = new Date(task.due_date);
  const isOverdue = dueDate < new Date() && !task.completed;
  const isDueSoon = dueDate.getTime() - Date.now() < 24 * 60 * 60 * 1000 && !task.completed;

  return (
    <Card
      glow={task.completed ? 'none' : isOverdue ? 'none' : 'cyan'}
      className={cn('transition-all duration-300', task.completed && 'opacity-60')}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {}
          <button
            onClick={onComplete}
            disabled={task.completed}
            className={cn(
              'mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300',
              task.completed
                ? 'bg-primary border-primary'
                : 'border-border hover:border-primary hover:shadow-neon-cyan'
            )}
          >
            {task.completed && <Check className="h-4 w-4 text-primary-foreground" />}
          </button>

          {}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  className={cn(
                    'font-medium',
                    task.completed && 'line-through text-muted-foreground'
                  )}
                >
                  {task.title}
                </h3>
                {subject && (
                  <SubjectBadge name={subject.name} color={subject.color} className="mt-2" />
                )}
              </div>

              {showActions && (
                <div className="flex items-center gap-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onEdit}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onDelete}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(task.duration)}
              </span>
              <span
                className={cn(
                  'flex items-center gap-1',
                  isOverdue && 'text-destructive',
                  isDueSoon && !isOverdue && 'text-chart-5'
                )}
              >
                <Calendar className="h-4 w-4" />
                {dueDate.toLocaleDateString()}
              </span>
              <span className="capitalize px-2 py-0.5 rounded-md bg-muted text-xs">
                {task.type}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
