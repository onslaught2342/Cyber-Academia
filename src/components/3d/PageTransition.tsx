import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsTransitioning(true);
    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 200);

    return () => clearTimeout(timeout);
  }, [location.pathname, children]);

  return (
    <div className="relative">
      {}
      <div
        className={`fixed inset-0 z-[100] pointer-events-none transition-opacity duration-200 ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-primary/30 animate-ping" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
        </div>
        {}
        <div
          className={`absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent transition-all duration-200 ${
            isTransitioning ? 'top-0 animate-scan-down' : 'top-full'
          }`}
        />
      </div>

      {}
      <div
        className={`transition-all duration-300 ${
          isTransitioning ? 'opacity-0 scale-98 blur-sm' : 'opacity-100 scale-100 blur-0'
        }`}
      >
        {displayChildren}
      </div>
    </div>
  );
}
