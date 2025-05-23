// API key for Google Sheets
const API_KEY = "AIzaSyBCPCIV9jUxa4sD6TrlR74q3KTKqDZjoT8";
// TTS API Key
const TTS_API_KEY = "AIzaSyDlM4OBBfKmZDMSitzbSX8OCBOgqkGCQVc";
// Spreadsheet ID from the URL
const SPREADSHEET_ID = "1oOMJ5wZYySKj2yjufxSyZtmfYJAE04ctUafJkO7rMnQ";
// Raw range with special characters
const RANGE_RAW = "busca!A2:C";
// Encode the range to handle special characters
const RANGE = encodeURIComponent(RANGE_RAW);

// Supabase URL and key for connecting to the database
const SUPABASE_URL = "https://qlikvwofqxmweaigmanu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaWt2d29mcXhtd2VhaWdtYW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM3NDc4NDIsImV4cCI6MjAyOTMyMzg0Mn0.UD-C_l2zspbxhRo_Fn9jJd37DI2Gi-nA9gSTwJiUZkY";

export interface LegalTerm {
  term: string;
  explanation: string;
  example: string;
}

// Local storage for tracking term views
const getViewedTerms = (): Record<string, number> => {
  try {
    const stored = localStorage.getItem('viewedTerms');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading viewed terms from localStorage:', error);
    return {};
  }
};

// Get recent terms (recently viewed)
export const getRecentTerms = (limit = 5): string[] => {
  try {
    const viewedTerms = localStorage.getItem('recentTerms');
    if (!viewedTerms) return [];
    
    const terms: string[] = JSON.parse(viewedTerms);
    return terms.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent terms:', error);
    return [];
  }
};

// Track when a term is viewed
export const trackTermView = (term: string): void => {
  try {
    // Update view count
    const viewedTerms = getViewedTerms();
    viewedTerms[term] = (viewedTerms[term] || 0) + 1;
    localStorage.setItem('viewedTerms', JSON.stringify(viewedTerms));
    
    // Update recent terms list
    const recentTerms = getRecentTerms(20); // Get up to 20 recent terms
    const updatedRecent = [term, ...recentTerms.filter(t => t !== term)];
    localStorage.setItem('recentTerms', JSON.stringify(updatedRecent));
  } catch (error) {
    console.error('Error tracking term view:', error);
  }
};

// Get most viewed terms
export const getMostViewedTerms = (limit = 5): Array<{term: string, views: number}> => {
  const viewedTerms = getViewedTerms();
  return Object.entries(viewedTerms)
    .map(([term, views]) => ({ term, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
};

// Mock data to use while the API issues are being resolved
const MOCK_TERMS: LegalTerm[] = [
  {
    term: "Habeas Corpus",
    explanation: "O Habeas Corpus é uma garantia constitucional que visa proteger a liberdade de locomoção do indivíduo quando esta estiver ameaçada ou restringida ilegalmente. É uma ordem judicial que determina que a pessoa detida seja apresentada a um juiz para que este verifique a legalidade da prisão.",
    example: "João foi detido sem um mandado judicial e sem flagrante delito. Seu advogado impetrou um Habeas Corpus argumentando a ilegalidade da prisão, e o juiz concedeu a ordem, determinando a imediata libertação de João."
  },
  {
    term: "Prescrição",
    explanation: "A prescrição é a perda do direito de ação em razão do decurso do tempo. No âmbito penal, significa a extinção da punibilidade pelo transcurso do prazo legal sem que o Estado tenha exercido seu direito de punir. No direito civil, representa a perda do direito de exigir o cumprimento de uma obrigação.",
    example: "Maria sofreu um acidente de trânsito causado por Carlos em janeiro de 2010. Em 2023, ela decidiu processar Carlos pelos danos materiais, mas seu pedido foi negado porque o prazo prescricional para ações de reparação civil é de 3 anos, conforme o Código Civil."
  },
  {
    term: "Usucapião",
    explanation: "Usucapião é uma forma de aquisição da propriedade pela posse prolongada e ininterrupta de um bem, desde que atendidos os requisitos legais. É um instituto jurídico que permite a transformação da posse em propriedade pelo decurso do tempo.",
    example: "Pedro ocupou um terreno abandonado por 15 anos, construiu sua casa, pagou impostos e foi reconhecido como morador do local pela comunidade. Ele entrou com uma ação de usucapião extraordinário e conseguiu o título de propriedade do imóvel, pois sua posse foi mansa, pacífica e ininterrupta por tempo superior aos 15 anos exigidos por lei."
  },
  {
    term: "Dolo",
    explanation: "No Direito Penal, dolo é a vontade consciente de praticar uma conduta sabendo que ela é criminosa, ou assumindo o risco de produzi-la. No Direito Civil, dolo é um vício de consentimento caracterizado pela intenção de enganar a outra parte para obter vantagem.",
    example: "Ana comprou um carro de Ricardo, que afirmou falsamente que o veículo nunca havia sofrido acidentes, ocultando intencionalmente que o mesmo tinha sido completamente reconstruído após uma colisão grave. Ana descobriu posteriormente e pediu a anulação do negócio jurídico por dolo."
  },
  {
    term: "Litispendência",
    explanation: "Litispendência ocorre quando existem duas ações judiciais idênticas em tramitação simultânea, com as mesmas partes, a mesma causa de pedir e o mesmo pedido. Quando identificada, a ação proposta posteriormente deve ser extinta sem resolução do mérito.",
    example: "Roberto ingressou com uma ação de indenização contra uma empresa em São Paulo. Duas semanas depois, insatisfeito com a demora, ingressou com a mesma ação, pelos mesmos fatos, na comarca do Rio de Janeiro. A empresa alegou litispendência e o juiz extinguiu o segundo processo."
  },
  {
    term: "Coisa Julgada",
    explanation: "Coisa julgada é a qualidade que torna imutável e indiscutível o conteúdo de uma decisão judicial depois de esgotados todos os recursos ou após o decurso do prazo para recorrer. Visa garantir a segurança jurídica, impedindo que uma questão já decidida definitivamente seja novamente apreciada pelo Judiciário.",
    example: "Luiz moveu uma ação reivindicatória contra Paulo e perdeu. Após o trânsito em julgado da sentença, ele tentou iniciar uma nova ação idêntica contra Paulo pelos mesmos motivos. O juiz rejeitou a ação com base na coisa julgada, pois a questão já havia sido decidida definitivamente."
  },
  {
    term: "Agravo de Instrumento",
    explanation: "O agravo de instrumento é um recurso processual utilizado contra decisões interlocutórias (que não põem fim ao processo) em situações específicas previstas no Código de Processo Civil. É processado diretamente no tribunal de segundo grau, sem interromper o andamento do processo principal.",
    example: "Durante um processo de divórcio, o juiz indeferiu o pedido de alimentos provisórios feito pela esposa. O advogado dela interpôs um agravo de instrumento contra essa decisão interlocutória, que foi julgado procedente pelo tribunal, reformando a decisão e concedendo os alimentos provisórios enquanto o processo principal continuava tramitando."
  }
];

// Fetch all terms from Google Sheets
export async function fetchLegalTerms(): Promise<LegalTerm[]> {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch terms: ${response.status}`);
      console.log("Utilizando dados simulados enquanto o problema com a API é resolvido");
      return MOCK_TERMS;
    }

    const data = await response.json();
    
    // Transform the data into our LegalTerm structure
    return (data.values || []).map((row: string[]) => ({
      term: row[0] || "",
      explanation: row[1] || "",
      example: row[2] || ""
    }));
  } catch (error) {
    console.error("Error fetching legal terms:", error);
    console.log("Utilizando dados simulados enquanto o problema com a API é resolvido");
    return MOCK_TERMS;
  }
}

// Text-to-speech function using Google Cloud TTS API
let currentAudio: HTMLAudioElement | null = null;

export async function speakText(text: string): Promise<void> {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.remove();
    currentAudio = null;
  }
  
  try {
    const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyDlM4OBBfKmZDMSitzbSX8OCBOgqkGCQVc`;
    
    const requestBody = {
      input: { text },
      voice: {
        languageCode: 'pt-BR',
        name: 'pt-BR-Wavenet-E'
      },
      audioConfig: {
        audioEncoding: 'MP3'
      }
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`);
    }
    
    const data = await response.json();
    const audioContent = data.audioContent;
    
    const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
    currentAudio = audio;
    
    audio.play();
    
    return new Promise((resolve) => {
      audio.onended = () => {
        currentAudio = null;
        resolve();
      };
    });
  } catch (error) {
    console.error('Error with text-to-speech:', error);
    fallbackSpeakText(text);
  }
}

// Fallback to Web Speech API
function fallbackSpeakText(text: string): void {
  if (!window.speechSynthesis) return;
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to find Portuguese voice
  const voices = window.speechSynthesis.getVoices();
  const ptVoice = voices.find(voice => voice.lang.startsWith('pt'));
  if (ptVoice) {
    utterance.voice = ptVoice;
  }
  
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

// Get available voices
export function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    
    // If voices aren't loaded yet, wait for them
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };
  });
}

// Get explanation from Gemini (simulated for now)
export async function getGeminiExplanation(term: string, explanation: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Explicação avançada para "${term}": 
      
      ${explanation}
      
      Este termo jurídico tem implicações significativas nos seguintes contextos:
      
      1. Desenvolvimento Histórico: O conceito evoluiu a partir de precedentes jurídicos anteriores.
      2. Aplicação Moderna: Hoje, é utilizado principalmente em jurisdições específicas.
      3. Conceitos Relacionados: Este termo está intimamente ligado a outros princípios jurídicos.
      
      Na prática jurídica brasileira, este termo é frequentemente aplicado em casos que envolvem ${term.toLowerCase().includes('corpus') ? 'liberdade individual e garantias constitucionais' : term.toLowerCase().includes('prescrição') ? 'extinção de punibilidade e prazo legal' : 'direitos e obrigações entre partes'}.
      
      A jurisprudência recente dos tribunais superiores tem consolidado o entendimento de que ${term} deve ser interpretado à luz dos princípios constitucionais fundamentais.`);
    }, 1000);
  });
}

// Generate PDF with jspdf
export function generatePDF(term: LegalTerm): void {
  console.log("PDF generation requested for:", term);
}

// Fetch areas from Supabase
export async function fetchAreas(): Promise<string[]> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/termos_dicionario?select=area`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch areas: ${response.status}`);
    }

    const data = await response.json();
    // Extract unique areas
    const uniqueAreas = new Set<string>();
    data.forEach((item: { area: string }) => {
      if (item.area) uniqueAreas.add(item.area);
    });
    
    return Array.from(uniqueAreas).sort();
  } catch (error) {
    console.error("Error fetching areas:", error);
    return ["Direito Civil", "Direito Penal", "Direito Constitucional"]; // Default areas as fallback
  }
}

// Fetch terms for a specific area from Supabase
export async function fetchAreaTerms(area: string): Promise<LegalTerm[]> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/termos_dicionario?area=eq.${encodeURIComponent(area)}&select=termos,significado,exemplo`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch terms for area ${area}: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data into our LegalTerm structure
    return data.map((item: { termos: string; significado: string; exemplo: string }) => ({
      term: item.termos || "",
      explanation: item.significado || "",
      example: item.exemplo || ""
    }));
  } catch (error) {
    console.error(`Error fetching terms for area ${area}:`, error);
    return MOCK_TERMS.slice(0, 3); // Return some mock data as fallback
  }
}
