import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function PageLayout({ children, title, subtitle }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {(title || subtitle) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wider neon-text-cyan">
                {title}
              </h1>
            )}
            {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
