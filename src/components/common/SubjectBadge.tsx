import { cn } from '@/lib/utils';

interface SubjectBadgeProps {
  name: string;
  color: string;
  difficulty?: number;
  className?: string;
}

export function SubjectBadge({ name, color, difficulty, className }: SubjectBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        boxShadow: `0 0 10px ${color}40`,
      }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {name}
      {difficulty !== undefined && <span className="text-xs opacity-75">Lv.{difficulty}</span>}
    </span>
  );
}
