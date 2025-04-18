
import React from 'react';
import { getMostViewedTerms } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bookmark } from 'lucide-react';

interface RecentlyViewedProps {
  onSelectTermByName: (termName: string) => void;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ onSelectTermByName }) => {
  const mostViewed = getMostViewedTerms();
  
  if (mostViewed.length === 0) {
    return null;
  }
  
  return (
    <div className="glass-morphism rounded-lg p-4 mb-6 w-full max-w-3xl">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <Bookmark className="mr-2 h-5 w-5 text-primary" />
        Termos mais visitados
      </h3>
      
      <ScrollArea className="max-h-[120px]">
        <div className="flex flex-wrap gap-2">
          {mostViewed.map((item, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="cursor-pointer hover:bg-primary/20 transition-all flex items-center gap-1 py-2 px-3 text-sm animate-fade-in"
              onClick={() => onSelectTermByName(item.term)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {item.term}
              <span className="ml-1 bg-primary/30 text-xs px-1.5 py-0.5 rounded-full">
                {item.views}
              </span>
            </Badge>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RecentlyViewed;
