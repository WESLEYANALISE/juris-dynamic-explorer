// API key for Google Sheets
const API_KEY = "AIzaSyD-eQn5WM5NF56ELBwVr9OTLTTtiRXwEQY";
// Spreadsheet ID from the URL
const SPREADSHEET_ID = "1rctu_xg4P0KkMWKbzu7-mgJp-HjCu-cT8DZqNAzln-s";
// Range to fetch data from (Página1!A2:C, skipping header)
const RANGE = "Página1!A2:C";

export interface LegalTerm {
  term: string;
  explanation: string;
  example: string;
}

// Fetch all terms from Google Sheets
export async function fetchLegalTerms(): Promise<LegalTerm[]> {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch terms: ${response.status}`);
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
    return [];
  }
}

// Text-to-speech function using the Web Speech API
export function speakText(text: string, voice?: SpeechSynthesisVoice): void {
  if (!window.speechSynthesis) return;
  
  // Stop any current speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set voice if provided
  if (voice) {
    utterance.voice = voice;
  }
  
  // Slightly slower speech rate for better comprehension
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
  // In a real implementation, this would call the Gemini API
  // For now, we'll simulate a response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Gemini enhanced explanation for "${term}": 
      
      ${explanation}
      
      This legal term has significant implications in the following contexts:
      
      1. Historical Development: The concept evolved from earlier legal precedents.
      2. Modern Application: Today, it's primarily used in specific jurisdictions.
      3. Related Concepts: This term connects closely with other legal principles.
      
      Note: This is a simulated response. In production, this would use the actual Gemini API.`);
    }, 1000);
  });
}

// Generate PDF with jspdf (to be implemented when we add the dependency)
export function generatePDF(term: LegalTerm): void {
  // We will implement this when we add jspdf
  console.log("PDF generation requested for:", term);
}
