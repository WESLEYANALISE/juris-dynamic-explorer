import React, { useState } from 'react';
import { LegalTerm, speakText, getGeminiExplanation, trackTermView } from '@/lib/api';
import { exportToPDF } from '@/lib/pdfExport';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, FileText, Volume2, Brain, Loader2, StopCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TermDetailProps {
  term: LegalTerm;
}

const TermDetail: React.FC<TermDetailProps> = ({ term }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [geminiExplanation, setGeminiExplanation] = useState<string | null>(null);
  const [isGeminiOpen, setIsGeminiOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState("explanation");
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  React.useEffect(() => {
    trackTermView(term.term);
    
    // Cleanup function to stop any playing audio when component unmounts
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.remove();
      }
    };
  }, [term.term]);

  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.remove();
      setCurrentAudio(null);
    }
    setIsSpeaking(false);
  };

  const handlePlayAudio = async (text: string, type: string) => {
    if (isSpeaking) {
      stopCurrentAudio();
      return;
    }
    
    setIsSpeaking(true);
    try {
      await speakText(text);
      
      toast({
        description: `Narrando ${type}...`,
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={stopCurrentAudio}
            className="bg-destructive/10 hover:bg-destructive/20 text-destructive"
          >
            <StopCircle className="mr-1 h-4 w-4" />
            Parar
          </Button>
        ),
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        variant: "destructive",
        description: "Erro ao reproduzir áudio.",
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSpeakExplanation = () => handlePlayAudio(`${term.term}. ${term.explanation}`, "explicação");
  const handleSpeakExample = () => handlePlayAudio(term.example, "exemplo prático");
  const handleSpeakGemini = () => geminiExplanation && handlePlayAudio(geminiExplanation, "explicação avançada");

  const handleCopyTerm = () => {
    navigator.clipboard.writeText(term.term);
    toast({
      description: "Termo copiado para a área de transferência.",
    });
  };

  const handleCopyAll = () => {
    const text = `${term.term}

Explicação:
${term.explanation}

Exemplo Prático:
${term.example}

${geminiExplanation ? `\nExplicação Avançada (Gemini):\n${geminiExplanation}` : ''}`;

    navigator.clipboard.writeText(text);
    toast({
      description: "Todo o conteúdo copiado para a área de transferência.",
    });
  };

  const handleStopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    toast({
      description: "Narração interrompida.",
    });
  };

  const handleExportPDF = async () => {
    setIsPdfLoading(true);
    try {
      const driveUrl = await exportToPDF(term);
      setPdfUrl(driveUrl);
      toast({
        description: "PDF exportado e disponibilizado no Google Drive.",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(driveUrl, '_blank')}
            className="bg-primary/10 hover:bg-primary/20 text-primary"
          >
            <FileText className="mr-1 h-4 w-4" />
            Abrir PDF
          </Button>
        ),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Erro ao exportar PDF para o Google Drive.",
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
        <CardTitle className="text-2xl md:text-3xl font-bold text-gradient flex items-center justify-between group">
          <span className="group-hover:scale-105 transition-transform">{term.term}</span>
          {isSpeaking && (
            <Button 
              size="icon"
              variant="ghost" 
              className="h-8 w-8 rounded-full animate-pulse bg-destructive/10 hover:bg-destructive/20 text-destructive" 
              onClick={stopCurrentAudio}
            >
              <StopCircle className="h-5 w-5" />
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
                  <Volume2 className={cn("mr-1 h-4 w-4", isSpeaking && "animate-pulse")} /> 
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
                    <Volume2 className={cn("mr-1 h-4 w-4", isSpeaking && "animate-pulse")} /> 
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
                <Volume2 className={cn("mr-1 h-4 w-4", isSpeaking && "animate-pulse")} />
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
            {pdfUrl ? 'Exportar novo PDF' : 'Exportar PDF'}
          </Button>
          {pdfUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(pdfUrl, '_blank')}
              className="bg-primary/10 hover:bg-primary/20 text-primary hover:scale-105 transition-transform"
            >
              <FileText className="mr-1 h-4 w-4" />
              Ver PDF
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default TermDetail;
