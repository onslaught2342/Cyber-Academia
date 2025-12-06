import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Calendar, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

const QUICK_OPTIONS = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '7 Days', days: 7 },
] as const;

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = value ? new Date(value) : undefined;

  const handleQuickSelect = (days: number) => {
    const date = addDays(today, days);
    onChange(format(date, 'yyyy-MM-dd'));
    setShowCalendar(false);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
      setShowCalendar(false);
    }
  };

  const isQuickOptionSelected = (days: number) => {
    if (!value) return false;
    const optionDate = addDays(today, days);
    return format(optionDate, 'yyyy-MM-dd') === value;
  };

  const isCustomSelected = value && !QUICK_OPTIONS.some((opt) => isQuickOptionSelected(opt.days));

  return (
    <div className="space-y-3">
      {}
      <div className="flex flex-wrap gap-2">
        {QUICK_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => handleQuickSelect(option.days)}
            className={cn(
              'px-4 py-2 rounded-lg border-2 transition-all duration-300 text-sm font-medium',
              isQuickOptionSelected(option.days)
                ? 'border-primary bg-primary/20 text-primary shadow-neon-cyan'
                : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        ))}

        {}
        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'px-4 py-2 rounded-lg border-2 transition-all duration-300 text-sm font-medium inline-flex items-center gap-2',
                isCustomSelected
                  ? 'border-accent bg-accent/20 text-accent neon-border-purple'
                  : 'border-border text-muted-foreground hover:border-accent/50 hover:text-foreground'
              )}
            >
              <CalendarDays className="h-4 w-4" />
              Custom
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
              disabled={(date) => date < today}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {}
      {value && (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Due:</span>
          <span className="text-foreground font-medium">
            {format(new Date(value), 'EEEE, MMMM d, yyyy')}
          </span>
        </div>
      )}
    </div>
  );
}
