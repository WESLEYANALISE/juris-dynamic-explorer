
import React from 'react';
import { getRecentTerms } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';

interface RecentlyViewedProps {
  onSelectTermByName: (termName: string) => void;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ onSelectTermByName }) => {
  const recentTerms = getRecentTerms();
  
  if (recentTerms.length === 0) {
    return null;
  }
  
  return (
    <div className="glass-morphism rounded-lg p-4 mb-6 w-full max-w-3xl">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <History className="mr-2 h-5 w-5 text-primary" />
        Últimos termos
      </h3>
      
      <ScrollArea className="max-h-[120px]">
        <div className="flex flex-wrap gap-2">
          {recentTerms.map((term, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="cursor-pointer hover:bg-primary/20 transition-all flex items-center gap-1 py-2 px-3 text-sm animate-fade-in"
              onClick={() => onSelectTermByName(term)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {term}
            </Badge>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RecentlyViewed;
