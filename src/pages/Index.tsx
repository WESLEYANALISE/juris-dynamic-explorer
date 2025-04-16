
import React, { useState, useEffect } from 'react';
import { fetchLegalTerms, LegalTerm, getVoices } from '@/lib/api';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import TermDetail from '@/components/TermDetail';
import { BookOpen, Loader2 } from 'lucide-react';

const Index: React.FC = () => {
  const [terms, setTerms] = useState<LegalTerm[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<LegalTerm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [explanationVoice, setExplanationVoice] = useState<SpeechSynthesisVoice | undefined>(undefined);
  const [exampleVoice, setExampleVoice] = useState<SpeechSynthesisVoice | undefined>(undefined);

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

    const loadVoices = async () => {
      try {
        const voices = await getVoices();
        
        // Try to find Portuguese voices, or fall back to English
        const portugueseVoices = voices.filter(voice => voice.lang.startsWith('pt'));
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        
        // Set primary voice for explanation (prefer female voice for explanation)
        const femaleVoices = portugueseVoices.length > 0 
          ? portugueseVoices.filter(v => !v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('female'))
          : englishVoices.filter(v => !v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('female'));
        
        if (femaleVoices.length > 0) {
          setExplanationVoice(femaleVoices[0]);
        } else if (portugueseVoices.length > 0) {
          setExplanationVoice(portugueseVoices[0]);
        } else if (englishVoices.length > 0) {
          setExplanationVoice(englishVoices[0]);
        }

        // Set secondary voice for examples (prefer male voice for examples)
        const maleVoices = portugueseVoices.length > 0
          ? portugueseVoices.filter(v => v.name.toLowerCase().includes('male') && !v.name.toLowerCase().includes('female'))
          : englishVoices.filter(v => v.name.toLowerCase().includes('male') && !v.name.toLowerCase().includes('female'));
        
        if (maleVoices.length > 0 && maleVoices[0] !== explanationVoice) {
          setExampleVoice(maleVoices[0]);
        } else if (portugueseVoices.length > 1) {
          setExampleVoice(portugueseVoices.find(v => v !== explanationVoice) || portugueseVoices[0]);
        } else if (englishVoices.length > 1) {
          setExampleVoice(englishVoices.find(v => v !== explanationVoice) || englishVoices[0]);
        } else {
          setExampleVoice(explanationVoice);
        }
      } catch (error) {
        console.error('Failed to load voices:', error);
      }
    };

    loadTerms();
    if (window.speechSynthesis) {
      loadVoices();
    }
  }, []);

  const handleSelectTerm = (term: LegalTerm) => {
    setSelectedTerm(term);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-3xl mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Explorador de Termos Jurídicos</h2>
          <p className="text-muted-foreground">
            Pesquise termos jurídicos para obter explicações detalhadas e exemplos práticos
          </p>
        </div>

        <SearchBar 
          terms={terms} 
          onSelectTerm={handleSelectTerm} 
          className="mb-8"
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Carregando termos jurídicos...</p>
          </div>
        ) : selectedTerm ? (
          <TermDetail 
            term={selectedTerm} 
            explanationVoice={explanationVoice}
            exampleVoice={exampleVoice}
          />
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

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© 2023-2025 Juris Explorer • Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default Index;
