import jsPDF from 'jspdf';

export interface JumpPDFData {
  title: string;
  summary?: string;
  content: string;
  createdAt: string;
  structured_plan?: any;
  comprehensive_plan?: any;
  components?: {
    tools?: any[];
    prompts?: any[];
    workflows?: any[];
    blueprints?: any[];
    strategies?: any[];
  };
}

export const generateJumpPDF = (jumpData: JumpPDFData): void => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Premium color palette - Professional steel/charcoal theme matching website
  const colors = {
    // Main colors - Steel/Charcoal theme from website
    primary: { r: 55, g: 65, b: 81 },         // #374151 - Steel blue
    secondary: { r: 31, g: 41, b: 55 },       // #1f2937 - Dark steel  
    accent: { r: 17, g: 24, b: 39 },          // #111827 - Charcoal
    
    // Text colors
    heading: { r: 17, g: 24, b: 39 },         // #111827 - Strong headings
    body: { r: 55, g: 65, b: 81 },           // #374151 - Readable body text
    muted: { r: 75, g: 85, b: 99 },          // #4b5563 - Subtle text
    light: { r: 107, g: 114, b: 128 },       // #6b7280 - Very light text
    
    // Background colors
    pageBg: { r: 255, g: 255, b: 255 },      // White - Clean page background
    sectionBg: { r: 249, g: 250, b: 251 },   // #f9fafb - Light section backgrounds
    cardBg: { r: 255, g: 255, b: 255 },      // White - Card backgrounds
    accentBg: { r: 241, g: 245, b: 249 },    // #f1f5f9 - Subtle accent backgrounds
    
    // Border and divider colors
    border: { r: 209, g: 213, b: 219 },      // #d1d5db - Subtle borders
    divider: { r: 229, g: 231, b: 235 },     // #e5e7eb - Light dividers
    
    // Brand colors - Steel theme instead of green
    brandPrimary: { r: 55, g: 65, b: 81 },   // #374151 - Steel blue
    brandSecondary: { r: 31, g: 41, b: 55 }, // #1f2937 - Dark steel
    
    // Special colors
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
  };

  // Helper functions to set colors
  const setFillColor = (color: { r: number; g: number; b: number }) => {
    pdf.setFillColor(color.r, color.g, color.b);
  };

  const setTextColor = (color: { r: number; g: number; b: number }) => {
    pdf.setTextColor(color.r, color.g, color.b);
  };

  const setDrawColor = (color: { r: number; g: number; b: number }) => {
    pdf.setDrawColor(color.r, color.g, color.b);
  };

  // Typography settings - Compact but readable
  const typography = {
    title: { size: 22, lineHeight: 1.2, spacing: 8 },
    h1: { size: 16, lineHeight: 1.3, spacing: 6 },
    h2: { size: 13, lineHeight: 1.3, spacing: 5 },
    h3: { size: 11, lineHeight: 1.3, spacing: 4 },
    body: { size: 9, lineHeight: 1.4, spacing: 3 },
    caption: { size: 8, lineHeight: 1.3, spacing: 2 },
  };

  // Helper functions with enhanced formatting
  const checkPageBreak = (neededHeight: number) => {
    if (yPosition + neededHeight > pageHeight - margin - 25) {
      pdf.addPage();
      yPosition = margin + 20;
      addPageHeader();
    }
  };

  const wrapText = (text: string, maxWidth: number, fontSize: number) => {
    if (!text) return [];
    pdf.setFontSize(fontSize);
    return pdf.splitTextToSize(text.toString(), maxWidth);
  };

  const cleanTextContent = (text: string) => {
    if (!text) return '';
    // Remove emojis and special unicode characters
    let cleanText = text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
    // Clean markdown formatting
    cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/`([^`]+)`/g, '$1');
    // Normalize whitespace
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    return cleanText;
  };

  // Minimal page header with steel theme
  const addPageHeader = () => {
    // Steel gradient background
    setFillColor(colors.brandPrimary);
    pdf.rect(0, 0, pageWidth, 16, 'F');
    
    // Brand name
    setTextColor(colors.white);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('JumpinAI', margin, 11);
    
    // Subtitle
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Strategic Planning', margin + 30, 11);
    
    // Simple bottom line
    setDrawColor(colors.brandSecondary);
    pdf.setLineWidth(0.5);
    pdf.line(0, 16, pageWidth, 16);
    
    yPosition = 28;
  };

  // Compact section headers
  const addSectionHeader = (title: string, level: number = 1) => {
    const config = level === 1 ? typography.h1 : typography.h2;
    checkPageBreak(config.spacing * 2);
    
    // Simple section background
    const bgHeight = config.size + 6;
    setFillColor(colors.sectionBg);
    pdf.rect(margin - 4, yPosition - 3, maxWidth + 8, bgHeight, 'F');
    
    // Left accent bar
    setFillColor(colors.brandPrimary);
    pdf.rect(margin - 4, yPosition - 3, 3, bgHeight, 'F');
    
    // Section title
    setTextColor(colors.heading);
    pdf.setFontSize(config.size);
    pdf.setFont('helvetica', 'bold');
    const titleLines = wrapText(title, maxWidth - 15, config.size);
    pdf.text(titleLines, margin, yPosition + config.size - 1);
    yPosition += titleLines.length * config.spacing + 8;
    
    // Simple underline
    setDrawColor(colors.accent);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, margin + maxWidth * 0.3, yPosition);
    yPosition += 6;
  };

  const addSubsectionHeader = (title: string) => {
    checkPageBreak(typography.h3.spacing * 2);
    
    // Subtle background
    setFillColor(colors.accentBg);
    pdf.rect(margin - 4, yPosition - 4, maxWidth + 8, typography.h3.size + 8, 'F');
    
    setTextColor(colors.heading);
    pdf.setFontSize(typography.h3.size);
    pdf.setFont('helvetica', 'bold');
    const titleLines = wrapText(title, maxWidth, typography.h3.size);
    pdf.text(titleLines, margin, yPosition + typography.h3.size - 2);
    yPosition += titleLines.length * typography.h3.spacing + typography.h3.spacing;
  };

  const addParagraph = (text: string, fontSize: number = typography.body.size, color = colors.body) => {
    if (!text) return;
    const cleanText = cleanTextContent(text);
    if (!cleanText) return;
    
    checkPageBreak(typography.body.spacing * 2);
    setTextColor(color);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    
    const textLines = wrapText(cleanText, maxWidth, fontSize);
    pdf.text(textLines, margin, yPosition);
    yPosition += textLines.length * (fontSize * typography.body.lineHeight) + typography.body.spacing;
  };

  const addBulletPoint = (text: string, fontSize: number = typography.body.size, indent: number = 0) => {
    if (!text) return;
    const cleanText = cleanTextContent(text);
    if (!cleanText) return;
    
    checkPageBreak(typography.body.spacing * 2);
    
    const bulletX = margin + indent;
    const textX = bulletX + 12;
    
    // Enhanced bullet design
    setFillColor(colors.accent);
    pdf.circle(bulletX + 3, yPosition - 2, 1.5, 'F');
    
    setTextColor(colors.body);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    
    const bulletLines = wrapText(cleanText, maxWidth - 16 - indent, fontSize);
    pdf.text(bulletLines, textX, yPosition);
    yPosition += bulletLines.length * (fontSize * typography.body.lineHeight) + 2;
  };

  const addNumberedPoint = (text: string, number: number, fontSize: number = typography.body.size) => {
    if (!text) return;
    const cleanText = cleanTextContent(text);
    if (!cleanText) return;
    
    checkPageBreak(typography.body.spacing * 2);
    
    // Number in circle
    setFillColor(colors.accent);
    pdf.circle(margin + 6, yPosition - 1, 4, 'F');
    
    setTextColor(colors.white);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(number.toString(), margin + (number > 9 ? 3 : 4.5), yPosition + 1);
    
    setTextColor(colors.body);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    
    const textLines = wrapText(cleanText, maxWidth - 20, fontSize);
    pdf.text(textLines, margin + 15, yPosition);
    yPosition += textLines.length * (fontSize * typography.body.lineHeight) + 4;
  };

  const addDivider = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    checkPageBreak(8);
    
    const lineStyles = {
      light: { color: colors.divider, width: 0.3, spacing: 5 },
      medium: { color: colors.border, width: 0.4, spacing: 8 },
      heavy: { color: colors.accent, width: 0.6, spacing: 10 }
    };
    
    const config = lineStyles[style];
    setDrawColor(config.color);
    pdf.setLineWidth(config.width);
    pdf.line(margin, yPosition, margin + maxWidth, yPosition);
    yPosition += config.spacing;
  };

  const addInfoBox = (title: string, content: string, type: 'info' | 'highlight' | 'code' = 'info') => {
    if (!content) return;
    
    const boxStyles = {
      info: { bg: colors.accentBg, border: colors.accent, titleColor: colors.heading },
      highlight: { bg: colors.sectionBg, border: colors.brandPrimary, titleColor: colors.brandSecondary },
      code: { bg: colors.cardBg, border: colors.border, titleColor: colors.muted }
    };
    
    const style = boxStyles[type];
    const contentLines = wrapText(cleanTextContent(content), maxWidth - 16, typography.body.size);
    const boxHeight = (title ? typography.h3.size + 8 : 0) + contentLines.length * (typography.body.size * 1.4) + 12;
    
    checkPageBreak(boxHeight + 10);
    
    // Box background
    setFillColor(style.bg);
    pdf.rect(margin - 4, yPosition - 4, maxWidth + 8, boxHeight, 'F');
    
    // Box border
    setDrawColor(style.border);
    pdf.setLineWidth(0.5);
    pdf.rect(margin - 4, yPosition - 4, maxWidth + 8, boxHeight, 'S');
    
    if (title) {
      setTextColor(style.titleColor);
      pdf.setFontSize(typography.h3.size);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin, yPosition + typography.h3.size - 2);
      yPosition += typography.h3.size + 4;
    }
    
    setTextColor(colors.body);
    pdf.setFontSize(typography.body.size);
    pdf.setFont('helvetica', 'normal');
    pdf.text(contentLines, margin + 4, yPosition);
    yPosition += contentLines.length * (typography.body.size * 1.4) + 8;
  };

  // Start PDF generation with premium cover page
  addPageHeader();

  // Title section with compact design
  yPosition += 5;
  setTextColor(colors.heading);
  pdf.setFontSize(typography.title.size);
  pdf.setFont('helvetica', 'bold');
  const titleLines = wrapText(jumpData.title, maxWidth, typography.title.size);
  pdf.text(titleLines, margin, yPosition);
  yPosition += titleLines.length * (typography.title.size * typography.title.lineHeight) + 8;

  // Simple title underline
  setDrawColor(colors.brandPrimary);
  pdf.setLineWidth(1);
  pdf.line(margin, yPosition, margin + maxWidth * 0.5, yPosition);
  yPosition += 12;

  // Compact metadata section
  const dateText = new Date(jumpData.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric'
  });
  
  // Simple metadata box
  setFillColor(colors.sectionBg);
  pdf.rect(margin - 2, yPosition - 2, maxWidth + 4, 14, 'F');
  
  setTextColor(colors.muted);
  pdf.setFontSize(typography.caption.size);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${dateText}`, margin, yPosition + 6);
  
  setTextColor(colors.brandPrimary);
  pdf.setFont('helvetica', 'bold');
  const aiText = 'AI Strategic Plan';
  const aiTextWidth = pdf.getTextWidth(aiText);
  pdf.text(aiText, pageWidth - margin - aiTextWidth - 2, yPosition + 6);
  
  yPosition += 20;

  // Executive Summary (if available)
  if (jumpData.summary) {
    addSectionHeader('Executive Summary', 1);
    addParagraph(jumpData.summary, typography.body.size + 1);
    addDivider('medium');
  }

  // 1. STRATEGIC ACTION PLAN
  if (jumpData.content) {
    addSectionHeader('Strategic Action Plan', 1);
    
    const lines = jumpData.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        yPosition += 2;
        continue;
      }

      if (line.startsWith('# ')) {
        addSubsectionHeader(line.substring(2).trim());
      } else if (line.startsWith('## ')) {
        checkPageBreak(15);
        setTextColor(colors.heading);
        pdf.setFontSize(typography.h3.size);
        pdf.setFont('helvetica', 'bold');
        const headerLines = wrapText(line.substring(3).trim(), maxWidth, typography.h3.size);
        pdf.text(headerLines, margin, yPosition);
        yPosition += headerLines.length * typography.h3.spacing + 4;
      } else if (line.startsWith('### ')) {
        checkPageBreak(12);
        setTextColor(colors.body);
        pdf.setFontSize(typography.body.size + 1);
        pdf.setFont('helvetica', 'bold');
        const headerLines = wrapText(line.substring(4).trim(), maxWidth, typography.body.size + 1);
        pdf.text(headerLines, margin, yPosition);
        yPosition += headerLines.length * typography.body.spacing + 3;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        addBulletPoint(line.substring(2).trim());
      } else if (line.match(/^\d+\. /)) {
        const numberMatch = line.match(/^(\d+)\. (.+)/);
        if (numberMatch) {
          addNumberedPoint(numberMatch[2], parseInt(numberMatch[1]));
        }
      } else if (line.startsWith('**') && line.endsWith('**')) {
        const boldText = line.substring(2, line.length - 2);
        addParagraph(boldText, typography.body.size + 1, colors.heading);
      } else {
        addParagraph(line);
      }
    }
    addDivider('medium');
  }

  // 2. IMPLEMENTATION PLAN
  if (jumpData.structured_plan) {
    addSectionHeader('Implementation Roadmap', 1);
    
    if (jumpData.structured_plan.overview) {
      addParagraph(jumpData.structured_plan.overview, typography.body.size + 1);
      yPosition += 10;
    }

    if (jumpData.structured_plan.phases && jumpData.structured_plan.phases.length > 0) {
      jumpData.structured_plan.phases.forEach((phase: any, index: number) => {
        checkPageBreak(45);
        
        // Phase header with premium design
        const phaseTitle = `Phase ${phase.phase_number || index + 1}: ${phase.title}`;
        
        // Phase background
        setFillColor(colors.accentBg);
        pdf.rect(margin - 6, yPosition - 6, maxWidth + 12, 22, 'F');
        
        // Phase number circle
        setFillColor(colors.accent);
        pdf.circle(margin + 8, yPosition + 3, 6, 'F');
        
        setTextColor(colors.white);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text((phase.phase_number || index + 1).toString(), margin + (phase.phase_number > 9 ? 5 : 6.5), yPosition + 5);
        
        setTextColor(colors.heading);
        pdf.setFontSize(typography.h2.size);
        pdf.setFont('helvetica', 'bold');
        pdf.text(phaseTitle, margin + 20, yPosition + 6);
        yPosition += 25;

        if (phase.duration) {
          setTextColor(colors.muted);
          pdf.setFontSize(typography.caption.size);
          pdf.setFont('helvetica', 'italic');
          pdf.text(`Duration: ${phase.duration}`, margin, yPosition);
          yPosition += 12;
        }

        if (phase.description) {
          addParagraph(phase.description);
        }

        if (phase.tasks && phase.tasks.length > 0) {
          setTextColor(colors.muted);
          pdf.setFontSize(typography.body.size);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Key Deliverables:', margin, yPosition);
          yPosition += 10;
          
          phase.tasks.forEach((task: any) => {
            const taskText = typeof task === 'string' ? task : task.description || task.name || 'Task';
            addBulletPoint(taskText, typography.body.size);
          });
        }
        yPosition += 12;
      });
    }
    addDivider('medium');
  }

  // 3. COMPREHENSIVE PLAN SECTIONS
  if (jumpData.comprehensive_plan) {
    const plan = jumpData.comprehensive_plan;

    if (plan.key_objectives) {
      addSectionHeader('Strategic Objectives', 1);
      const objectives = Array.isArray(plan.key_objectives) ? plan.key_objectives : [plan.key_objectives];
      objectives.forEach((objective: string, index: number) => addNumberedPoint(objective, index + 1));
      addDivider('medium');
    }

    if (plan.success_metrics) {
      addSectionHeader('Success Metrics & KPIs', 1);
      const metrics = Array.isArray(plan.success_metrics) ? plan.success_metrics : [plan.success_metrics];
      metrics.forEach((metric: string) => addBulletPoint(metric));
      addDivider('medium');
    }

    if (plan.resource_requirements) {
      addSectionHeader('Resource Requirements', 1);
      if (typeof plan.resource_requirements === 'string') {
        addParagraph(plan.resource_requirements);
      } else if (plan.resource_requirements.overview) {
        addParagraph(plan.resource_requirements.overview);
      }
      addDivider('medium');
    }
  }

  // 4. AI TOOLS & RESOURCES
  if (jumpData.components?.tools && jumpData.components.tools.length > 0) {
    addSectionHeader('AI Tools & Technologies', 1);
    
    jumpData.components.tools.forEach((tool: any, index: number) => {
      checkPageBreak(50);
      
      // Tool card design
      const cardHeight = 35;
      setFillColor(colors.cardBg);
      pdf.rect(margin - 4, yPosition - 4, maxWidth + 8, cardHeight, 'F');
      setDrawColor(colors.border);
      pdf.setLineWidth(0.5);
      pdf.rect(margin - 4, yPosition - 4, maxWidth + 8, cardHeight, 'S');
      
      // Tool icon (using number for now)
      setFillColor(colors.brandPrimary);
      pdf.circle(margin + 8, yPosition + 8, 5, 'F');
      setTextColor(colors.white);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text((index + 1).toString(), margin + (index + 1 > 9 ? 5.5 : 6.5), yPosition + 10);
      
      // Tool name and category
      setTextColor(colors.heading);
      pdf.setFontSize(typography.h3.size);
      pdf.setFont('helvetica', 'bold');
      pdf.text(tool.name || 'AI Tool', margin + 20, yPosition + 6);
      
      if (tool.category) {
        setTextColor(colors.muted);
        pdf.setFontSize(typography.caption.size);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`[${tool.category}]`, margin + 20, yPosition + 16);
      }
      
      yPosition += cardHeight + 8;

      if (tool.description) {
        addParagraph(tool.description);
      }

      if (tool.when_to_use) {
        addInfoBox('When to Use', tool.when_to_use, 'highlight');
      }

      if (tool.why_this_tool) {
        addInfoBox('Benefits', tool.why_this_tool, 'info');
      }

      if (tool.how_to_integrate || tool.integration_notes) {
        addInfoBox('Integration Guide', tool.how_to_integrate || tool.integration_notes, 'code');
      }

      if (tool.website_url || tool.url || tool.website) {
        setTextColor(colors.light);
        pdf.setFontSize(typography.caption.size);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Website: ${tool.website_url || tool.url || tool.website}`, margin, yPosition);
        yPosition += 10;
      }

      yPosition += 15;
    });
    addDivider('medium');
  }

  // 5. AI PROMPTS
  if (jumpData.components?.prompts && jumpData.components.prompts.length > 0) {
    addSectionHeader('AI Prompts Library', 1);
    
    jumpData.components.prompts.forEach((prompt: any, index: number) => {
      checkPageBreak(45);
      
      addSubsectionHeader(`${index + 1}. ${prompt.title || 'AI Prompt'}`);
      
      if (prompt.description) {
        addParagraph(prompt.description);
      }

      if (prompt.prompt_text) {
        addInfoBox('Prompt Template', prompt.prompt_text, 'code');
      }

      if (prompt.ai_tools && prompt.ai_tools.length > 0) {
        setTextColor(colors.muted);
        pdf.setFontSize(typography.caption.size);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Compatible with: ${prompt.ai_tools.join(', ')}`, margin, yPosition);
        yPosition += 12;
      }
      
      yPosition += 10;
    });
    addDivider('medium');
  }

  // 6. WORKFLOWS
  if (jumpData.components?.workflows && jumpData.components.workflows.length > 0) {
    addSectionHeader('Process Workflows', 1);
    
    jumpData.components.workflows.forEach((workflow: any, index: number) => {
      checkPageBreak(40);
      
      addSubsectionHeader(`Workflow ${index + 1}: ${workflow.title || 'AI Workflow'}`);
      
      if (workflow.description) {
        addParagraph(workflow.description);
      }

      if (workflow.workflow_steps && workflow.workflow_steps.length > 0) {
        setTextColor(colors.muted);
        pdf.setFontSize(typography.body.size);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Process Steps:', margin, yPosition);
        yPosition += 10;
        
        workflow.workflow_steps.forEach((step: any, stepIndex: number) => {
          const stepTitle = step.title || step.action || 'Step';
          const stepDesc = step.description || '';
          const stepText = stepDesc ? `${stepTitle}: ${stepDesc}` : stepTitle;
          addNumberedPoint(stepText, stepIndex + 1);
        });
      }

      // Workflow metadata
      const metaInfo = [];
      if (workflow.complexity_level) metaInfo.push(`Complexity: ${workflow.complexity_level}`);
      if (workflow.duration_estimate) metaInfo.push(`Duration: ${workflow.duration_estimate}`);
      
      if (metaInfo.length > 0) {
        setTextColor(colors.light);
        pdf.setFontSize(typography.caption.size);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`${metaInfo.join(' | ')}`, margin, yPosition);
        yPosition += 12;
      }
      
      yPosition += 10;
    });
    addDivider('medium');
  }

  // 7. BLUEPRINTS
  if (jumpData.components?.blueprints && jumpData.components.blueprints.length > 0) {
    addSectionHeader('Implementation Blueprints', 1);
    
    jumpData.components.blueprints.forEach((blueprint: any, index: number) => {
      checkPageBreak(35);
      
      addSubsectionHeader(`Blueprint ${index + 1}: ${blueprint.title || 'AI Blueprint'}`);
      
      if (blueprint.description) {
        addParagraph(blueprint.description);
      }

      if (blueprint.implementation) {
        addInfoBox('Implementation Guide', blueprint.implementation, 'highlight');
      }

      if (blueprint.deliverables && blueprint.deliverables.length > 0) {
        setTextColor(colors.muted);
        pdf.setFontSize(typography.body.size);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Expected Deliverables:', margin, yPosition);
        yPosition += 10;
        blueprint.deliverables.forEach((deliverable: string) => addBulletPoint(deliverable));
      }

      // Blueprint metadata
      const metaInfo = [];
      if (blueprint.difficulty_level) metaInfo.push(`Difficulty: ${blueprint.difficulty_level}`);
      if (blueprint.implementation_time) metaInfo.push(`Timeline: ${blueprint.implementation_time}`);
      
      if (metaInfo.length > 0) {
        setTextColor(colors.light);
        pdf.setFontSize(typography.caption.size);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`${metaInfo.join(' | ')}`, margin, yPosition);
        yPosition += 12;
      }
      
      yPosition += 10;
    });
    addDivider('medium');
  }

  // 8. STRATEGIES
  if (jumpData.components?.strategies && jumpData.components.strategies.length > 0) {
    addSectionHeader('Strategic Initiatives', 1);
    
    jumpData.components.strategies.forEach((strategy: any, index: number) => {
      checkPageBreak(40);
      
      addSubsectionHeader(`Strategy ${index + 1}: ${strategy.title || 'AI Strategy'}`);
      
      if (strategy.description) {
        addParagraph(strategy.description);
      }

      if (strategy.key_actions && strategy.key_actions.length > 0) {
        setTextColor(colors.muted);
        pdf.setFontSize(typography.body.size);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Key Actions:', margin, yPosition);
        yPosition += 10;
        strategy.key_actions.forEach((action: string) => addBulletPoint(action));
      }

      if (strategy.success_metrics && strategy.success_metrics.length > 0) {
        setTextColor(colors.muted);
        pdf.setFontSize(typography.body.size);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Success Metrics:', margin, yPosition);
        yPosition += 10;
        strategy.success_metrics.forEach((metric: string) => addBulletPoint(metric));
      }

      if (strategy.potential_challenges && strategy.potential_challenges.length > 0) {
        setTextColor(colors.muted);
        pdf.setFontSize(typography.body.size);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Potential Challenges:', margin, yPosition);
        yPosition += 10;
        strategy.potential_challenges.forEach((challenge: string) => addBulletPoint(challenge));
      }

      // Strategy metadata
      const metaInfo = [];
      if (strategy.priority_level) metaInfo.push(`Priority: ${strategy.priority_level}`);
      if (strategy.timeline) metaInfo.push(`Timeline: ${strategy.timeline}`);
      
      if (metaInfo.length > 0) {
        setTextColor(colors.light);
        pdf.setFontSize(typography.caption.size);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`${metaInfo.join(' | ')}`, margin, yPosition);
        yPosition += 12;
      }
      
      yPosition += 10;
    });
  }

  // Add minimal footer to all pages
  const pageCount = pdf.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    // Simple footer line
    setDrawColor(colors.border);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    
    // Minimal footer content
    setTextColor(colors.muted);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    
    // Left: Brand
    pdf.text('JumpinAI', margin, pageHeight - 10);
    
    // Right: Page number
    const pageText = `${i} of ${pageCount}`;
    const pageTextWidth = pdf.getTextWidth(pageText);
    pdf.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 10);
  }

  // Generate clean filename and save
  const cleanTitle = jumpData.title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 50);
  
  const timestamp = new Date().toISOString().slice(0, 10);
  const fileName = `${cleanTitle || 'jump-plan'}-${timestamp}.pdf`;
  pdf.save(fileName);
};