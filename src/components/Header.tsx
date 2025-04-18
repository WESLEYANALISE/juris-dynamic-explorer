
import React, { useEffect, useState } from 'react';
import { BookOpen, Scale, Gavel, Sparkles, BookText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  totalTerms?: number;
}

const Header: React.FC<HeaderProps> = ({ totalTerms = 0 }) => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    // Start animation after component mounts
    setAnimate(true);
    
    // Periodically trigger animation
    const interval = setInterval(() => {
      setAnimate(false);
      setTimeout(() => setAnimate(true), 100);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <header className="w-full py-8 px-4 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-primary/20 rounded-full opacity-20"
            style={{
              width: Math.random() * 12 + 4 + 'px',
              height: Math.random() * 12 + 4 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDuration: (Math.random() * 10 + 10) + 's',
              animation: 'float-y infinite ease-in-out'
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto flex items-center justify-center relative z-10">
        <div className="flex flex-col items-center text-center">
          <div 
            className={cn(
              "flex items-center mb-2 transition-transform duration-700", 
              animate ? "transform-gpu scale-105" : "transform-gpu scale-100"
            )}
          >
            <Scale className={cn(
              "h-7 w-7 mr-2 text-primary transition-all duration-700",
              animate ? "animate-pulse-subtle" : ""
            )} />
            <BookOpen className={cn(
              "h-8 w-8 text-primary transition-transform duration-700",
              animate ? "rotate-[-5deg]" : ""
            )} />
            <Gavel className={cn(
              "h-7 w-7 ml-2 text-primary transition-all duration-700",
              animate ? "animate-pulse-subtle" : ""
            )} />
          </div>
          
          <h1 className={cn(
            "text-3xl md:text-4xl font-bold text-gradient relative",
            animate ? "animate-pulse-subtle" : ""
          )}>
            Juris Explorer
            <Sparkles 
              className={cn(
                "absolute -right-6 top-0 h-5 w-5 text-primary/80 transition-opacity duration-500",
                animate ? "opacity-100" : "opacity-0"
              )} 
            />
          </h1>
          
          <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-lg">
            Explore termos jurídicos com explicações detalhadas e exemplos práticos
          </p>
          
          {totalTerms > 0 && (
            <div className="mt-3 flex items-center justify-center animate-fade-in">
              <BookText className="h-4 w-4 mr-1.5 text-primary" />
              <span className="text-sm font-medium">
                <span className="text-primary font-bold">{totalTerms}</span> termos disponíveis
              </span>
            </div>
          )}
          
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full mt-3 animate-pulse-subtle" />
        </div>
      </div>
    </header>
  );
};

export default Header;
