
import React from 'react';
import { BookOpen, Scale, Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  return (
    <header className="w-full py-8 px-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
      <div className="container mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center mb-2">
            <Scale className="h-7 w-7 mr-2 text-primary animate-pulse-subtle" />
            <BookOpen className="h-8 w-8 text-primary" />
            <Gavel className="h-7 w-7 ml-2 text-primary animate-pulse-subtle" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient">Juris Explorer</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-lg">
            Explore termos jurídicos com explicações detalhadas e exemplos práticos
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
