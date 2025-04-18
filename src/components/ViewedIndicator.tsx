
import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ViewedIndicatorProps {
  show: boolean;
  className?: string;
}

const ViewedIndicator: React.FC<ViewedIndicatorProps> = ({ show, className }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (show) {
      setProgress(0);
      const timer = setTimeout(() => {
        setProgress(100);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [show]);
  
  if (!show) return null;
  
  return (
    <div className={cn(
      "fixed bottom-8 right-8 sm:bottom-10 sm:right-10 flex items-center gap-2 bg-green-500/20 backdrop-blur-md py-2 px-4 rounded-full border border-green-500/30 shadow-lg z-50 animate-fade-in",
      "touch-none pointer-events-none", // Prevents issues with touch events on mobile
      className
    )}>
      <CheckCircle2 className="text-green-500 h-5 w-5 animate-pulse" />
      <span className="text-sm font-medium hidden sm:inline">Termo visualizado</span>
      <span className="text-sm font-medium sm:hidden">Visualizado</span>
      <Progress value={progress} className="w-16 h-1.5 transition-all duration-3000" />
    </div>
  );
};

export default ViewedIndicator;
