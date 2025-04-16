
import React from 'react';
import { BookOpen } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4">
      <div className="container mx-auto flex items-center justify-center">
        <div className="flex items-center">
          <BookOpen className="h-8 w-8 mr-2 text-primary" />
          <h1 className="text-2xl font-bold text-gradient">Juris Explorer</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
