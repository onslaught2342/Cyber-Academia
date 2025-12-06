import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  glow?: 'cyan' | 'purple';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  glow = 'cyan',
  className,
}: StatCardProps) {
  return (
    <Card glow={glow} className={cn('group', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">{title}</p>
            <p
              className={cn(
                'mt-2 text-4xl font-display font-bold tracking-wider',
                glow === 'cyan' ? 'text-primary' : 'text-secondary'
              )}
            >
              {value}
            </p>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div
            className={cn(
              'p-3 rounded-lg transition-all duration-300',
              glow === 'cyan'
                ? 'bg-primary/20 text-primary group-hover:shadow-neon-cyan'
                : 'bg-secondary/20 text-secondary group-hover:shadow-neon-purple'
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
