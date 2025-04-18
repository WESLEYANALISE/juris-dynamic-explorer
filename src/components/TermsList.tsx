import React, { useState, useMemo } from 'react';
import { LegalTerm } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, BookOpen } from 'lucide-react';

interface TermsListProps {
  terms: LegalTerm[];
  onSelectTerm: (term: LegalTerm) => void;
}

const TermsList: React.FC<TermsListProps> = ({ terms, onSelectTerm }) => {
  const [filter, setFilter] = useState('');
  
  const sortedTerms = useMemo(() => {
    return [...terms].sort((a, b) => a.term.localeCompare(b.term));
  }, [terms]);
  
  const filteredTerms = useMemo(() => {
    if (!filter.trim()) return sortedTerms;
    const lowerFilter = filter.toLowerCase();
    return sortedTerms.filter(term => term.term.toLowerCase().includes(lowerFilter));
  }, [sortedTerms, filter]);
  
  const groupedTerms = useMemo(() => {
    const groups: Record<string, LegalTerm[]> = {};
    
    filteredTerms.forEach(term => {
      const firstLetter = term.term.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(term);
    });
    
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredTerms]);
  
  const handleTermClick = (term: LegalTerm) => {
    onSelectTerm(term);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-3xl mx-auto glass-morphism p-4 rounded-lg animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-medium">
            {terms.length} termos disponíveis
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredTerms.length} termos encontrados
        </div>
      </div>

      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Filtrar termos..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      </div>
      
      <ScrollArea className="h-[60vh]">
        <div className="space-y-4">
          {groupedTerms.map(([letter, terms]) => (
            <div key={letter} className="mb-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <h3 className="text-lg font-bold text-primary mb-2 sticky top-0 bg-background/90 backdrop-blur-sm p-1 z-10 rounded">
                {letter}
              </h3>
              <ul className="space-y-1">
                {terms.map((term, index) => (
                  <li 
                    key={index} 
                    className="p-2 rounded hover:bg-primary/10 cursor-pointer transition-colors"
                    onClick={() => handleTermClick(term)}
                  >
                    {term.term}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {groupedTerms.length === 0 && (
            <div className="text-center py-8 text-muted-foreground animate-fade-in">
              Nenhum termo encontrado para "{filter}"
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TermsList;
