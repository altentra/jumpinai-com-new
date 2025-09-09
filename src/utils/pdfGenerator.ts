import jsPDF from 'jspdf';

export interface JumpPDFData {
  title: string;
  summary?: string;
  content: string;
  createdAt: string;
}

export const generateJumpPDF = (jumpData: JumpPDFData): void => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (neededHeight: number) => {
    if (yPosition + neededHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Helper function to wrap text
  const wrapText = (text: string, maxWidth: number, fontSize: number) => {
    pdf.setFontSize(fontSize);
    return pdf.splitTextToSize(text, maxWidth);
  };

  // Add header with gradient-like effect (using rectangles)
  pdf.setFillColor(59, 130, 246); // Primary blue
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setFillColor(37, 99, 235); // Darker blue
  pdf.rect(0, 30, pageWidth, 10, 'F');

  // Add title
  pdf.setTextColor(255, 255, 255); // White text
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  const titleLines = wrapText(jumpData.title, maxWidth - 40, 24);
  pdf.text(titleLines, margin + 20, 25);

  yPosition = 60;

  // Add creation date
  pdf.setTextColor(100, 100, 100); // Gray
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Created: ${new Date(jumpData.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, margin, yPosition);
  
  yPosition += 20;

  // Add AI Generated badge
  pdf.setFillColor(248, 250, 252); // Light gray background
  pdf.setDrawColor(203, 213, 225); // Border color
  pdf.roundedRect(margin, yPosition - 5, 80, 15, 3, 3, 'FD');
  
  pdf.setTextColor(71, 85, 105); // Slate text
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('🤖 AI GENERATED', margin + 5, yPosition + 5);
  
  yPosition += 30;

  // Process content - convert markdown to PDF
  const processContent = (content: string) => {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        yPosition += 5;
        continue;
      }

      // Headers
      if (line.startsWith('# ')) {
        checkPageBreak(25);
        pdf.setTextColor(30, 41, 59); // Dark slate
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        const headerText = line.substring(2).trim();
        const headerLines = wrapText(headerText, maxWidth, 18);
        pdf.text(headerLines, margin, yPosition);
        yPosition += headerLines.length * 8 + 10;
        
        // Add underline
        pdf.setDrawColor(59, 130, 246);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition - 5, margin + 100, yPosition - 5);
        yPosition += 5;
        
      } else if (line.startsWith('## ')) {
        checkPageBreak(20);
        pdf.setTextColor(51, 65, 85); // Slate
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const headerText = line.substring(3).trim();
        const headerLines = wrapText(headerText, maxWidth, 14);
        pdf.text(headerLines, margin, yPosition);
        yPosition += headerLines.length * 7 + 8;
        
      } else if (line.startsWith('### ')) {
        checkPageBreak(18);
        pdf.setTextColor(71, 85, 105);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        const headerText = line.substring(4).trim();
        const headerLines = wrapText(headerText, maxWidth, 12);
        pdf.text(headerLines, margin, yPosition);
        yPosition += headerLines.length * 6 + 6;
        
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        // Bullet points
        checkPageBreak(15);
        pdf.setTextColor(71, 85, 105);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        // Add bullet
        pdf.setFillColor(59, 130, 246);
        pdf.circle(margin + 3, yPosition - 2, 1, 'F');
        
        const bulletText = line.substring(2).trim();
        const bulletLines = wrapText(bulletText, maxWidth - 15, 11);
        pdf.text(bulletLines, margin + 10, yPosition);
        yPosition += bulletLines.length * 5 + 3;
        
      } else if (line.match(/^\d+\. /)) {
        // Numbered lists
        checkPageBreak(15);
        pdf.setTextColor(71, 85, 105);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const numberedLines = wrapText(line, maxWidth, 11);
        pdf.text(numberedLines, margin, yPosition);
        yPosition += numberedLines.length * 5 + 3;
        
      } else if (line.startsWith('**') && line.endsWith('**')) {
        // Bold text
        checkPageBreak(15);
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        const boldText = line.substring(2, line.length - 2);
        const boldLines = wrapText(boldText, maxWidth, 11);
        pdf.text(boldLines, margin, yPosition);
        yPosition += boldLines.length * 5 + 6;
        
      } else {
        // Regular paragraph
        checkPageBreak(15);
        pdf.setTextColor(71, 85, 105);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        // Process inline formatting
        let processedLine = line;
        
        // Remove markdown formatting for PDF
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '$1');
        processedLine = processedLine.replace(/\*(.*?)\*/g, '$1');
        processedLine = processedLine.replace(/`(.*?)`/g, '$1');
        
        const paragraphLines = wrapText(processedLine, maxWidth, 11);
        pdf.text(paragraphLines, margin, yPosition);
        yPosition += paragraphLines.length * 5 + 8;
      }
    }
  };

  processContent(jumpData.content);

  // Add footer
  const pageCount = pdf.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setTextColor(156, 163, 175); // Gray
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 30, pageHeight - 10);
    pdf.text('Generated by JumpinAI', margin, pageHeight - 10);
  }

  // Download the PDF
  const fileName = `${jumpData.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`;
  pdf.save(fileName);
};