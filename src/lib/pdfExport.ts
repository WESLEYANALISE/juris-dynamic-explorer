
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LegalTerm } from './api';

// Generate PDF from a term
export async function exportToPDF(term: LegalTerm): Promise<void> {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Set font size and type
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    
    // Add title
    pdf.text(term.term, 20, 20);
    
    // Set font for content
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    
    // Add explanation header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Explicação:', 20, 35);
    
    // Add explanation content
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    const explanationLines = pdf.splitTextToSize(term.explanation, 170);
    pdf.text(explanationLines, 20, 45);
    
    // Calculate position for example section
    const explanationHeight = explanationLines.length * 7;
    const exampleY = 50 + explanationHeight;
    
    // Add example header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Exemplo Prático:', 20, exampleY);
    
    // Add example content
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    const exampleLines = pdf.splitTextToSize(term.example, 170);
    pdf.text(exampleLines, 20, exampleY + 10);
    
    // Add footer with date
    const now = new Date();
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Exportado em ${now.toLocaleDateString('pt-BR')} - Juris Explorer`, 20, 285);
    
    // Save the PDF
    pdf.save(`${term.term.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}
