
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LegalTerm } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  terms: LegalTerm[];
  onSelectTerm: (term: LegalTerm) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ terms, onSelectTerm, className }) => {
  const [query, setQuery] = useState('');
  const [filteredTerms, setFilteredTerms] = useState<LegalTerm[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim() === '') {
      setFilteredTerms([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = terms.filter(term => 
      term.term.toLowerCase().includes(lowerQuery)
    );
    
    setFilteredTerms(filtered);
    setIsDropdownOpen(filtered.length > 0);
  }, [query, terms]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (term: LegalTerm) => {
    setQuery(term.term);
    onSelectTerm(term);
    setIsDropdownOpen(false);
  };

  const handleSearch = () => {
    if (filteredTerms.length > 0) {
      onSelectTerm(filteredTerms[0]);
    }
  };

  return (
    <div className={cn("relative w-full max-w-2xl", className)} ref={dropdownRef}>
      <div className="relative flex items-center">
        <Input
          type="text"
          placeholder="Pesquisar termo jurídico..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsDropdownOpen(true)}
          className="w-full pl-10 pr-4 py-3 bg-secondary text-foreground rounded-lg border-none shadow-md focus:ring-2 focus:ring-primary"
        />
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
          size={18}
        />
        <Button 
          variant="ghost" 
          className="absolute right-2 hover:bg-transparent"
          onClick={handleSearch}
          aria-label="Search"
        >
          <Search size={18} className="text-primary" />
        </Button>
      </div>
      
      {isDropdownOpen && filteredTerms.length > 0 && (
        <div className="absolute w-full mt-1 bg-card rounded-lg shadow-lg border border-border z-10 animate-fade-in">
          <ul className="py-2 max-h-60 overflow-auto scrollbar-none">
            {filteredTerms.map((term, index) => (
              <li 
                key={index}
                className="px-4 py-2 hover:bg-secondary cursor-pointer transition-colors"
                onClick={() => handleSelect(term)}
              >
                {term.term}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
