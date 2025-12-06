import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Zap, BookOpen, Calendar, BarChart3, Heart } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: BookOpen,
      title: 'Subject Management',
      description: 'Organize your CAIE subjects with difficulty levels',
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'AI-powered daily plans based on priorities',
    },
    {
      icon: Zap,
      title: 'Task Tracking',
      description: 'Never miss a deadline with smart reminders',
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Track your study time and achievements',
    },
  ];

  return (
    <div className="min-h-screen bg-background cyber-grid overflow-hidden relative">
      {}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl" />
      </div>

      {}
      <section className="relative container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24 z-10">
        <div className="text-center max-w-4xl mx-auto">
          {}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img
                src="/logo.svg"
                alt="Cyber Academia Logo"
                className="h-24 w-24 rounded-2xl animate-float object-contain"
              />
              <div className="absolute inset-0 h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-secondary blur-2xl opacity-50" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-wider mb-6">
            <span className="neon-text-cyan">CYBER</span>
            <span className="block text-4xl md:text-5xl mt-2 neon-text-purple">ACADEMIA</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your personal <span className="text-primary">Academic Command Center</span>. Manage
            subjects, track tasks, and dominate your CAIE exams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="neon"
              size="xl"
              onClick={() => navigate('/signup')}
              className="text-lg"
            >
              <Zap className="h-5 w-5" />
              Get Started
            </Button>
            <Button
              variant="neon-outline"
              size="xl"
              onClick={() => navigate('/login')}
              className="text-lg"
            >
              Log In
            </Button>
          </div>
        </div>
      </section>

      {}
      <section className="relative container mx-auto px-4 py-16 z-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;
            return (
              <div
                key={feature.title}
                className="group relative p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:scale-105"
                style={{
                  boxShadow: `0 0 30px ${isEven ? 'hsl(185 100% 50% / 0.1)' : 'hsl(280 100% 60% / 0.1)'}`,
                }}
              >
                <div
                  className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 ${
                    isEven ? 'bg-primary/20' : 'bg-secondary/20'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isEven ? 'text-primary' : 'text-secondary'}`} />
                </div>
                <h3 className="font-display font-bold text-lg tracking-wider mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {}
      <section className="relative container mx-auto px-4 py-16 z-10">
        <div className="text-center">
          <p className="text-muted-foreground mb-4 font-mono text-sm tracking-wider"></p>
          <Button variant="neon-purple" size="xl" onClick={() => navigate('/signup')}>
            Join Cyber Academia →
          </Button>
        </div>
      </section>

      {}
      <footer className="relative border-t border-border/50 py-8 z-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-mono mb-2">
            CYBER ACADEMIA © {new Date().getFullYear()} | Built for CAIE Students
          </p>
          <Link
            to="/credits"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <Heart className="h-3 w-3" />
            Credits
          </Link>
        </div>
      </footer>
    </div>
  );
}
