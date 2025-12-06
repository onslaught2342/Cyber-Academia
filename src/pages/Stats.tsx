import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/stores/appStore';
const { formatDuration } = await import('@/lib/scheduler');

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Flame, Clock, Trophy, Target, Calendar } from 'lucide-react';

export default function Stats() {
  const { subjects, stats } = useAppStore();

  const chartData = subjects
    .map((subject) => ({
      name: subject.name,
      minutes: stats.time_spent_by_subject[subject.id] || 0,
      color: subject.color,
    }))
    .filter((d) => d.minutes > 0);

  const totalHours = Math.floor(stats.total_study_time / 60);
  const avgPerDay = stats.streak > 0 ? Math.round(stats.total_study_time / stats.streak) : 0;

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <PageLayout title="STATISTICS" subtitle="Track your academic progress and achievements">
      {}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Current Streak"
          value={stats.streak}
          subtitle="consecutive days"
          icon={Flame}
          glow="purple"
        />
        <StatCard
          title="Total Study Time"
          value={`${totalHours}h`}
          subtitle={formatDuration(stats.total_study_time % 60)}
          icon={Clock}
          glow="cyan"
        />
        <StatCard
          title="Tasks Completed"
          value={stats.tasks_completed}
          subtitle="total"
          icon={Trophy}
          glow="purple"
        />
        <StatCard
          title="Avg. Per Day"
          value={formatDuration(avgPerDay)}
          subtitle="study time"
          icon={Target}
          glow="cyan"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {}
        <Card glow="cyan">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Time by Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `${Math.round(value / 60)}h`}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{payload[0].payload.name}</p>
                              <p className="text-primary font-mono">
                                {formatDuration(payload[0].value as number)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="minutes" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          style={{ filter: `drop-shadow(0 0 8px ${entry.color}40)` }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No study time recorded yet</p>
                  <p className="text-sm mt-1">Complete tasks to see your stats</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {}
        <Card glow="purple">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => {
                const isActive = stats.weekly_study_days[index];
                return (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <div
                      className={`h-12 w-full rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-secondary shadow-neon-purple'
                          : 'bg-muted/30 border border-border/50'
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">{day}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              {stats.weekly_study_days.filter(Boolean).length} of 7 days active this week
            </p>
          </CardContent>
        </Card>

        {}
        <Card glow="cyan" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Subject Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subjects.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject) => {
                  const timeSpent = stats.time_spent_by_subject[subject.id] || 0;
                  const percentage =
                    stats.total_study_time > 0
                      ? Math.round((timeSpent / stats.total_study_time) * 100)
                      : 0;

                  return (
                    <div
                      key={subject.id}
                      className="p-4 rounded-lg border border-border/50 bg-muted/20"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{
                            backgroundColor: subject.color,
                            boxShadow: `0 0 8px ${subject.color}`,
                          }}
                        />
                        <span className="font-medium">{subject.name}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Time</span>
                          <span className="font-mono font-bold" style={{ color: subject.color }}>
                            {formatDuration(timeSpent)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: subject.color,
                              boxShadow: `0 0 10px ${subject.color}`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                          {percentage}% of total
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Add subjects and complete tasks to see breakdown</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
