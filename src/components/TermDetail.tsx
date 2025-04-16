
import React, { useState } from 'react';
import { LegalTerm, speakText, getGeminiExplanation } from '@/lib/api';
import { exportToPDF } from '@/lib/pdfExport';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, FileText, Volume2, Brain, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TermDetailProps {
  term: LegalTerm;
  explanationVoice?: SpeechSynthesisVoice;
  exampleVoice?: SpeechSynthesisVoice;
}

const TermDetail: React.FC<TermDetailProps> = ({ term, explanationVoice, exampleVoice }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [geminiExplanation, setGeminiExplanation] = useState<string | null>(null);
  const [isGeminiOpen, setIsGeminiOpen] = useState(false);

  const handleCopyTerm = () => {
    navigator.clipboard.writeText(term.term);
    toast({
      description: "Termo copiado para a área de transferência.",
    });
  };

  const handleCopyAll = () => {
    const text = `${term.term}\n\nExplicação:\n${term.explanation}\n\nExemplo Prático:\n${term.example}`;
    navigator.clipboard.writeText(text);
    toast({
      description: "Todo o conteúdo copiado para a área de transferência.",
    });
  };

  const handleSpeakExplanation = () => {
    speakText(`${term.term}. ${term.explanation}`, explanationVoice);
    toast({
      description: "Narrando explicação...",
    });
  };

  const handleSpeakExample = () => {
    speakText(term.example, exampleVoice);
    toast({
      description: "Narrando exemplo prático...",
    });
  };

  const handleExportPDF = async () => {
    setIsPdfLoading(true);
    try {
      await exportToPDF(term);
      toast({
        description: "PDF exportado com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Erro ao exportar PDF.",
      });
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleGetGeminiExplanation = async () => {
    if (geminiExplanation) {
      setIsGeminiOpen(!isGeminiOpen);
      return;
    }

    setIsLoading(true);
    try {
      const explanation = await getGeminiExplanation(term.term, term.explanation);
      setGeminiExplanation(explanation);
      setIsGeminiOpen(true);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Erro ao obter explicação do Gemini.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl bg-card border-border animate-fade-in glass-morphism">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gradient">{term.term}</CardTitle>
        <CardDescription className="text-muted-foreground">Termo Jurídico</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Explicação</h3>
          <p className="text-foreground/90">{term.explanation}</p>
          <Button
            variant="ghost" 
            size="sm" 
            className="mt-2 text-primary hover:text-primary/80"
            onClick={handleSpeakExplanation}
          >
            <Volume2 className="mr-1 h-4 w-4" /> 
            Ouvir explicação
          </Button>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Exemplo Prático</h3>
          <p className="text-foreground/90 p-3 bg-secondary/40 rounded-md border border-border/50">{term.example}</p>
          <Button
            variant="ghost" 
            size="sm" 
            className="mt-2 text-primary hover:text-primary/80"
            onClick={handleSpeakExample}
          >
            <Volume2 className="mr-1 h-4 w-4" />
            Ouvir exemplo
          </Button>
        </div>

        {isGeminiOpen && geminiExplanation && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-semibold mb-2">Explicação Avançada (Gemini)</h3>
            <div className="text-foreground/90 p-4 bg-primary/10 rounded-md border border-primary/30 whitespace-pre-line">
              {geminiExplanation}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline" 
            size="sm" 
            onClick={handleCopyTerm}
          >
            <Copy className="mr-1 h-4 w-4" />
            Copiar termo
          </Button>
          <Button
            variant="outline" 
            size="sm" 
            onClick={handleCopyAll}
          >
            <Copy className="mr-1 h-4 w-4" />
            Copiar tudo
          </Button>
          <Button
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF}
            disabled={isPdfLoading}
          >
            {isPdfLoading ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-1 h-4 w-4" />
            )}
            Exportar PDF
          </Button>
        </div>
        
        <Button
          variant="secondary" 
          size="sm"
          onClick={handleGetGeminiExplanation}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Brain className="mr-1 h-4 w-4" />
          )}
          {geminiExplanation 
            ? (isGeminiOpen ? "Fechar explicação Gemini" : "Ver explicação Gemini") 
            : "Explicar com Gemini"
          }
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TermDetail;
