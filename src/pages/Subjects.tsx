import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/stores/appStore';
import { Subject } from '@/types';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, X, Check, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRESET_COLORS = [
  '#00ffff',
  '#bf00ff',
  '#ff0080',
  '#00ff80',
  '#ffff00',
  '#ff8000',
  '#0080ff',
  '#ff0000',
];

export default function Subjects() {
  const { subjects, addSubject, updateSubject, deleteSubject, tasks } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const resetForm = () => {
    setName('');
    setDifficulty(3);
    setColor(PRESET_COLORS[0]);
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a subject name');
      return;
    }

    if (editingId) {
      updateSubject(editingId, { name: name.trim(), difficulty, color });
      toast.success('Subject updated!');
    } else {
      const newSubject: Subject = {
        id: `subject-${Date.now()}`,
        name: name.trim(),
        difficulty,
        color,
      };
      addSubject(newSubject);
      toast.success('Subject added!');
    }
    resetForm();
  };

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setName(subject.name);
    setDifficulty(subject.difficulty);
    setColor(subject.color);
    setShowForm(true);
  };

  const handleDelete = (subject: Subject) => {
    const taskCount = tasks.filter((t) => t.subject_id === subject.id).length;
    if (taskCount > 0) {
      toast.error(`Cannot delete: ${taskCount} tasks are linked to this subject`);
      return;
    }
    deleteSubject(subject.id);
    toast.success('Subject deleted!');
  };

  return (
    <PageLayout title="SUBJECTS" subtitle="Manage your CAIE subjects and difficulty levels">
      {}
      {showForm ? (
        <Card glow="purple" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingId ? 'Edit Subject' : 'Add New Subject'}</span>
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
                <label className="text-sm font-medium text-muted-foreground">Subject Name</label>
                <Input
                  placeholder="e.g., Mathematics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Difficulty Level
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={cn(
                        'h-10 w-10 rounded-lg border-2 transition-all duration-300 font-display font-bold',
                        level <= difficulty
                          ? 'border-secondary bg-secondary/20 text-secondary shadow-neon-purple'
                          : 'border-border text-muted-foreground hover:border-secondary/50'
                      )}
                    >
                      {level}
                    </button>
                  ))}
                  <span className="ml-4 text-sm text-muted-foreground">
                    {difficulty === 1 && 'Easy'}
                    {difficulty === 2 && 'Moderate'}
                    {difficulty === 3 && 'Medium'}
                    {difficulty === 4 && 'Hard'}
                    {difficulty === 5 && 'Extreme'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Color</label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((presetColor) => (
                    <button
                      key={presetColor}
                      type="button"
                      onClick={() => setColor(presetColor)}
                      className={cn(
                        'h-10 w-10 rounded-lg transition-all duration-300',
                        color === presetColor &&
                          'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                      )}
                      style={{
                        backgroundColor: presetColor,
                        boxShadow: color === presetColor ? `0 0 20px ${presetColor}` : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" variant="neon-purple" size="lg">
                  {editingId ? (
                    <>
                      <Check className="h-4 w-4" /> Update Subject
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Add Subject
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
        <Button variant="neon-purple" size="lg" className="mb-8" onClick={() => setShowForm(true)}>
          <Plus className="h-5 w-5" />
          Add Subject
        </Button>
      )}

      {}
      {subjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const taskCount = tasks.filter((t) => t.subject_id === subject.id).length;
            return (
              <Card key={subject.id} className="group relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: `linear-gradient(135deg, ${subject.color}40 0%, transparent 100%)`,
                  }}
                />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{
                            backgroundColor: subject.color,
                            boxShadow: `0 0 10px ${subject.color}`,
                          }}
                        />
                        <h3 className="text-xl font-display font-bold tracking-wider">
                          {subject.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Difficulty:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className="h-2 w-6 rounded-full"
                              style={{
                                backgroundColor:
                                  level <= subject.difficulty ? subject.color : 'hsl(var(--muted))',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {taskCount} task{taskCount !== 1 ? 's' : ''} linked
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(subject)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(subject)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-display mb-2">No subjects yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your CAIE subjects to start organizing your study plan
            </p>
            <Button variant="neon-purple" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Add Your First Subject
            </Button>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
