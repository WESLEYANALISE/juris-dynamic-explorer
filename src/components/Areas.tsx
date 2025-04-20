
import React, { useState, useEffect } from 'react';
import { fetchAreas, fetchAreaTerms, LegalTerm } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AreasProps {
  onSelectTerm: (term: LegalTerm) => void;
}

const Areas: React.FC<AreasProps> = ({ onSelectTerm }) => {
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [areaTerms, setAreaTerms] = useState<LegalTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAreas = async () => {
      try {
        const fetchedAreas = await fetchAreas();
        setAreas(fetchedAreas);
        if (fetchedAreas.length > 0) {
          setSelectedArea(fetchedAreas[0]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar áreas:', error);
        setIsLoading(false);
      }
    };

    loadAreas();
  }, []);

  useEffect(() => {
    const loadAreaTerms = async () => {
      if (!selectedArea) return;
      
      setIsLoading(true);
      try {
        const terms = await fetchAreaTerms(selectedArea);
        setAreaTerms(terms);
      } catch (error) {
        console.error(`Erro ao carregar termos da área ${selectedArea}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAreaTerms();
  }, [selectedArea]);

  const handleAreaChange = (area: string) => {
    setSelectedArea(area);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4 text-center">Áreas do Direito</h3>
      
      {isLoading && areas.length === 0 ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando áreas...</span>
        </div>
      ) : (
        <>
          {areas.length > 0 ? (
            <div>
              <Tabs 
                value={selectedArea || areas[0]} 
                onValueChange={handleAreaChange}
                className="w-full"
              >
                <TabsList className="mb-4 flex flex-wrap justify-center gap-2 h-auto">
                  {areas.map((area) => (
                    <TabsTrigger key={area} value={area} className="text-sm">
                      {area}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Carregando termos...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {areaTerms.length > 0 ? (
                    areaTerms.map((term) => (
                      <Button
                        key={term.term}
                        variant="outline"
                        className="text-left justify-start h-auto py-3 px-4"
                        onClick={() => onSelectTerm(term)}
                      >
                        <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{term.term}</span>
                      </Button>
                    ))
                  ) : (
                    <div className="col-span-full flex justify-center items-center p-8 text-muted-foreground">
                      Nenhum termo encontrado para esta área.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-8">
              Nenhuma área encontrada.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Areas;
