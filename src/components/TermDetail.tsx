
import React, { useState } from 'react';
import { LegalTerm, speakText, getGeminiExplanation } from '@/lib/api';
import { exportToPDF } from '@/lib/pdfExport';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, FileText, Volume2, Brain, Loader2, StopCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState("explanation");

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
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    speakText(`${term.term}. ${term.explanation}`, explanationVoice);
    
    toast({
      description: "Narrando explicação...",
      action: (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleStopSpeaking}
        >
          <StopCircle className="mr-1 h-4 w-4 text-destructive" />
          Parar
        </Button>
      ),
    });
    
    // Detect when speech ends
    const utterance = new SpeechSynthesisUtterance(`${term.term}. ${term.explanation}`);
    utterance.onend = () => setIsSpeaking(false);
    
    // Fallback in case onend doesn't trigger
    setTimeout(() => {
      if (!window.speechSynthesis.speaking) {
        setIsSpeaking(false);
      }
    }, (term.term.length + term.explanation.length) * 80); // Rough estimate of speaking time
  };

  const handleSpeakExample = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    speakText(term.example, exampleVoice);
    
    toast({
      description: "Narrando exemplo prático...",
      action: (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleStopSpeaking}
        >
          <StopCircle className="mr-1 h-4 w-4 text-destructive" />
          Parar
        </Button>
      ),
    });
    
    // Detect when speech ends
    const utterance = new SpeechSynthesisUtterance(term.example);
    utterance.onend = () => setIsSpeaking(false);
    
    // Fallback in case onend doesn't trigger
    setTimeout(() => {
      if (!window.speechSynthesis.speaking) {
        setIsSpeaking(false);
      }
    }, term.example.length * 80); // Rough estimate of speaking time
  };

  const handleSpeakGemini = () => {
    if (!geminiExplanation) return;
    
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    speakText(geminiExplanation, explanationVoice);
    
    toast({
      description: "Narrando explicação avançada...",
      action: (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleStopSpeaking}
        >
          <StopCircle className="mr-1 h-4 w-4 text-destructive" />
          Parar
        </Button>
      ),
    });
    
    // Fallback to stop speaking indicator
    setTimeout(() => {
      if (!window.speechSynthesis.speaking) {
        setIsSpeaking(false);
      }
    }, geminiExplanation.length * 60);
  };

  const handleStopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    toast({
      description: "Narração interrompida.",
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
        description: "Erro ao obter explicação da Gemini.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl bg-card border-border animate-scale-in glass-morphism">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold text-gradient flex items-center justify-between">
          {term.term}
          {isSpeaking && (
            <Button 
              size="icon"
              variant="ghost" 
              className="h-8 w-8 rounded-full animate-pulse" 
              onClick={handleStopSpeaking}
            >
              <StopCircle className="h-5 w-5 text-destructive" />
              <span className="sr-only">Parar narração</span>
            </Button>
          )}
        </CardTitle>
        <CardDescription className="text-muted-foreground flex items-center">
          <Sparkles className="h-4 w-4 mr-1 text-primary animate-pulse-subtle" />
          Termo Jurídico
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="explanation" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="explanation" className="relative overflow-hidden group">
              <span className="relative z-10">Explicação</span>
              <span className="absolute inset-0 bg-primary/10 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform origin-left"></span>
            </TabsTrigger>
            <TabsTrigger value="example" className="relative overflow-hidden group">
              <span className="relative z-10">Exemplo Prático</span>
              <span className="absolute inset-0 bg-primary/10 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform origin-left"></span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="explanation" className="space-y-4 animate-fade-in">
            <div className="text-foreground/90 space-y-2">
              <p className="leading-relaxed">{term.explanation}</p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  variant="outline" 
                  size="sm" 
                  className="text-primary hover:text-primary/80 hover:scale-105 transition-transform"
                  onClick={handleSpeakExplanation}
                >
                  <Volume2 className="mr-1 h-4 w-4" /> 
                  {isSpeaking ? "Pausar narração" : "Ouvir explicação"}
                </Button>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={handleGetGeminiExplanation}
                  disabled={isLoading}
                  className="hover:scale-105 transition-transform"
                >
                  {isLoading ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Brain className="mr-1 h-4 w-4" />
                  )}
                  {geminiExplanation 
                    ? (isGeminiOpen ? "Fechar detalhes" : "Ver detalhes") 
                    : "Explicar com Gemini"
                  }
                </Button>
              </div>
            </div>
            
            {isGeminiOpen && geminiExplanation && (
              <div className="animate-fade-in mt-4">
                <Separator className="my-4" />
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-primary" />
                  Explicação Avançada (Gemini)
                </h3>
                <div className="text-foreground/90 p-4 bg-primary/10 rounded-md border border-primary/30 whitespace-pre-line relative">
                  {geminiExplanation}
                  
                  <Button
                    variant="outline" 
                    size="sm" 
                    className="mt-3 text-primary hover:text-primary/80 hover:scale-105 transition-transform"
                    onClick={handleSpeakGemini}
                  >
                    <Volume2 className="mr-1 h-4 w-4" /> 
                    {isSpeaking ? "Pausar narração" : "Ouvir explicação avançada"}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="example" className="animate-fade-in">
            <div className="space-y-2">
              <p className="text-foreground/90 p-4 bg-secondary/40 rounded-md border border-border/50 leading-relaxed">{term.example}</p>
              
              <Button
                variant="outline" 
                size="sm" 
                className="mt-3 text-primary hover:text-primary/80 hover:scale-105 transition-transform"
                onClick={handleSpeakExample}
              >
                <Volume2 className="mr-1 h-4 w-4" />
                {isSpeaking ? "Pausar narração" : "Ouvir exemplo"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2 justify-between border-t border-border/40 pt-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline" 
            size="sm" 
            onClick={handleCopyTerm}
            className="hover:scale-105 transition-transform"
          >
            <Copy className="mr-1 h-4 w-4" />
            Copiar termo
          </Button>
          <Button
            variant="outline" 
            size="sm" 
            onClick={handleCopyAll}
            className="hover:scale-105 transition-transform"
          >
            <Copy className="mr-1 h-4 w-4" />
            Copiar tudo
          </Button>
          <Button
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF}
            disabled={isPdfLoading}
            className="hover:scale-105 transition-transform"
          >
            {isPdfLoading ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-1 h-4 w-4" />
            )}
            Exportar PDF
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TermDetail;
