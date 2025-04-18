
import React, { useState, useEffect } from 'react';
import { fetchLegalTerms, LegalTerm } from '@/lib/api';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import TermDetail from '@/components/TermDetail';
import TermsList from '@/components/TermsList';
import RecentlyViewed from '@/components/RecentlyViewed';
import ViewedIndicator from '@/components/ViewedIndicator';
import { BookOpen, Loader2, List, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index: React.FC = () => {
  const [terms, setTerms] = useState<LegalTerm[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<LegalTerm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'search' | 'list'>('search');
  const [showViewedIndicator, setShowViewedIndicator] = useState(false);

  useEffect(() => {
    const loadTerms = async () => {
      try {
        const data = await fetchLegalTerms();
        setTerms(data);
      } catch (error) {
        console.error('Failed to load terms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTerms();
  }, []);

  const handleSelectTerm = (term: LegalTerm) => {
    setSelectedTerm(term);
    
    // Show viewed indicator
    setShowViewedIndicator(true);
    
    // Hide indicator after 3 seconds
    setTimeout(() => {
      setShowViewedIndicator(false);
    }, 3000);
  };
  
  const handleSelectTermByName = (termName: string) => {
    const term = terms.find(t => t.term === termName);
    if (term) {
      handleSelectTerm(term);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header totalTerms={terms.length} />
      
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-3xl mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Explorador de Termos Jurídicos</h2>
          <p className="text-muted-foreground">
            Pesquise termos jurídicos para obter explicações detalhadas e exemplos práticos
          </p>
          
          <Tabs defaultValue="search" className="mt-6" onValueChange={(value) => setViewMode(value as any)}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="search" className="flex items-center justify-center">
                <SearchIcon className="h-4 w-4 mr-2" />
                Pesquisar
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center justify-center">
                <List className="h-4 w-4 mr-2" />
                Listar Todos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <RecentlyViewed onSelectTermByName={handleSelectTermByName} />

        {viewMode === 'search' ? (
          <SearchBar 
            terms={terms} 
            onSelectTerm={handleSelectTerm} 
            className="mb-8"
          />
        ) : (
          <div className="w-full mb-8">
            <TermsList terms={terms} onSelectTerm={handleSelectTerm} />
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Carregando termos jurídicos...</p>
          </div>
        ) : selectedTerm ? (
          <TermDetail term={selectedTerm} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center glass-morphism p-8 rounded-lg">
            <BookOpen className="h-16 w-16 text-primary/60 mb-4 animate-pulse-subtle" />
            <h3 className="text-xl font-medium mb-2">Comece pesquisando um termo</h3>
            <p className="text-muted-foreground max-w-md">
              Digite um termo jurídico na barra de pesquisa acima para visualizar sua definição, explicação e exemplo prático
            </p>
          </div>
        )}
      </main>

      <ViewedIndicator show={showViewedIndicator} />

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© 2023-2025 Juris Explorer • Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default Index;
