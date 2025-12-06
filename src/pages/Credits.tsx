import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Github, Globe, Heart, Zap, Code, Palette, Database } from 'lucide-react';

const technologies = [
  { name: 'React', icon: Code, description: 'UI Framework' },
  { name: 'TypeScript', icon: Code, description: 'Type Safety' },
  { name: 'Tailwind CSS', icon: Palette, description: 'Styling' },

  { name: 'Cloudflare Workers', icon: Zap, description: 'Backend' },
  { name: 'MongoDB', icon: Database, description: 'Database' },
];

export default function Credits() {
  return (
    <div className="min-h-screen bg-background cyber-grid overflow-hidden relative">
      {}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {}
        <Link to="/">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src="/logo.svg"
                alt="Cyber Academia Logo"
                className="h-24 w-24 rounded-2xl animate-float object-contain"
              />
              <div className="absolute inset-0 h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-secondary blur-2xl opacity-50" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-wider mb-4">
            <span className="neon-text-cyan">CYBER</span>{' '}
            <span className="neon-text-purple">ACADEMIA</span>
          </h1>
          <p className="text-xl text-muted-foreground">Credits & Acknowledgements</p>
        </div>

        {}
        <Card glow="cyan" className="max-w-2xl mx-auto mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl neon-text-cyan flex items-center justify-center gap-2">
              <Heart className="h-6 w-6 text-destructive animate-pulse" />
              Created By
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4">
              <h2 className="text-3xl font-display font-bold tracking-wider neon-text-purple mb-2">
                ONSLAUGHT2342
              </h2>
              <p className="text-muted-foreground">Full-Stack Developer & Designer</p>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Building the future of academic planning with cutting-edge web technologies and a
              passion for cyberpunk aesthetics.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="neon-outline" size="sm" asChild>
                <a
                  href="https://github.com/onslaught2342"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-display font-bold tracking-wider text-center mb-8 neon-text-cyan">
            POWERED BY
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {technologies.map((tech, index) => {
              const Icon = tech.icon;
              const isEven = index % 2 === 0;
              return (
                <Card
                  key={tech.name}
                  className="group transition-all duration-300 hover:scale-105"
                  style={{
                    boxShadow: `0 0 20px ${isEven ? 'hsl(185 100% 50% / 0.1)' : 'hsl(280 100% 60% / 0.1)'}`,
                  }}
                >
                  <CardContent className="p-4 text-center">
                    <Icon
                      className={`h-8 w-8 mx-auto mb-2 ${isEven ? 'text-primary' : 'text-secondary'}`}
                    />
                    <h3 className="font-display font-bold tracking-wider text-sm">{tech.name}</h3>
                    <p className="text-xs text-muted-foreground">{tech.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {}
        <Card className="max-w-2xl mx-auto mb-12 border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-xl text-center">Special Thanks</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground space-y-2">
            <p>CAIE Students worldwide for the inspiration</p>
            <p>The open-source community for amazing tools</p>
            <p>Lovable for the development platform</p>
          </CardContent>
        </Card>

        {}
        <footer className="text-center text-sm text-muted-foreground">
          <p className="font-mono">
            CYBER ACADEMIA © {new Date().getFullYear()} | Created by onslaught2342
          </p>
          <p className="mt-2 text-xs">
            Built with <Heart className="h-3 w-3 inline text-destructive" /> for students everywhere
          </p>
        </footer>
      </div>
    </div>
  );
}
