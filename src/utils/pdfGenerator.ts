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
  const margin = 25;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Premium color palette - Dark blue glass morphism inspired
  const colors = {
    // Main colors - Dark blue glass theme
    primary: { r: 30, g: 58, b: 138 },        // #1e3a8a - Deep blue
    secondary: { r: 55, g: 90, b: 127 },      // #375a7f - Steel blue  
    accent: { r: 16, g: 30, b: 76 },          // #101e4c - Dark navy
    
    // Text colors - High contrast for readability
    heading: { r: 15, g: 23, b: 42 },         // #0f172a - Very dark blue
    body: { r: 51, g: 65, b: 85 },           // #334155 - Readable dark gray
    muted: { r: 100, g: 116, b: 139 },       // #64748b - Medium gray
    light: { r: 148, g: 163, b: 184 },       // #94a3b8 - Light gray
    
    // Background colors
    pageBg: { r: 255, g: 255, b: 255 },      // Pure white
    sectionBg: { r: 248, g: 250, b: 252 },   // #f8fafc - Very light blue
    cardBg: { r: 255, g: 255, b: 255 },      // White cards
    accentBg: { r: 241, g: 245, b: 249 },    // #f1f5f9 - Light blue tint
    
    // Brand colors - Blue glass theme
    brandPrimary: { r: 30, g: 58, b: 138 },   // #1e3a8a - Deep blue
    brandSecondary: { r: 59, g: 130, b: 246 }, // #3b82f6 - Bright blue
    
    // Border and divider colors
    border: { r: 226, g: 232, b: 240 },       // #e2e8f0 - Light blue borders
    divider: { r: 241, g: 245, b: 249 },      // #f1f5f9 - Very light dividers
    
    // Special colors
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
  };

  // Helper functions
  const setFillColor = (color: { r: number; g: number; b: number }) => {
    pdf.setFillColor(color.r, color.g, color.b);
  };

  const setTextColor = (color: { r: number; g: number; b: number }) => {
    pdf.setTextColor(color.r, color.g, color.b);
  };

  const setDrawColor = (color: { r: number; g: number; b: number }) => {
    pdf.setDrawColor(color.r, color.g, color.b);
  };

  // Compact professional typography - Tight spacing
  const typography = {
    title: { size: 20, lineHeight: 1.2, spacing: 2 },
    h1: { size: 16, lineHeight: 1.2, spacing: 2 },
    h2: { size: 13, lineHeight: 1.2, spacing: 2 },
    h3: { size: 11, lineHeight: 1.2, spacing: 2 },
    body: { size: 9, lineHeight: 1.3, spacing: 1.5 },
    caption: { size: 8, lineHeight: 1.2, spacing: 1 },
  };

  // Helper functions with minimal spacing
  const checkPageBreak = (neededHeight: number) => {
    if (yPosition + neededHeight > pageHeight - margin - 15) {
      pdf.addPage();
      yPosition = margin + 10;
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
    // Clean text for better readability
    let cleanText = text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
    cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/`([^`]+)`/g, '$1');
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    return cleanText;
  };

  // Minimal page header
  const addPageHeader = () => {
    // Blue gradient header
    setFillColor(colors.brandPrimary);
    pdf.rect(0, 0, pageWidth, 10, 'F');
    
    // Brand name
    setTextColor(colors.white);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('JumpinAI', margin, 7);
    
    // Subtitle
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Strategic Planning Platform', margin + 28, 7);
    
    yPosition = 18;
  };

  // Compact section headers
  const addSectionHeader = (title: string, level: number = 1) => {
    const config = level === 1 ? typography.h1 : typography.h2;
    checkPageBreak(config.size + 6);
    
    // Section background
    setFillColor(colors.sectionBg);
    pdf.rect(margin - 3, yPosition - 2, maxWidth + 6, config.size + 4, 'F');
    
    // Left accent bar
    setFillColor(colors.brandPrimary);
    pdf.rect(margin - 3, yPosition - 2, 2, config.size + 4, 'F');
    
    // Title
    setTextColor(colors.heading);
    pdf.setFontSize(config.size);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, yPosition + config.size - 2);
    yPosition += config.size + 4;
  };

  const addSubsectionHeader = (title: string) => {
    checkPageBreak(typography.h3.size + 4);
    
    setTextColor(colors.heading);
    pdf.setFontSize(typography.h3.size);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, yPosition);
    yPosition += typography.h3.size + 2;
  };

  const addParagraph = (text: string, fontSize: number = typography.body.size, color = colors.body) => {
    if (!text) return;
    const cleanText = cleanTextContent(text);
    if (!cleanText) return;
    
    checkPageBreak(fontSize + 3);
    setTextColor(color);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    
    const textLines = wrapText(cleanText, maxWidth, fontSize);
    pdf.text(textLines, margin, yPosition);
    yPosition += textLines.length * (fontSize * typography.body.lineHeight) + 1.5;
  };

  const addBulletPoint = (text: string, fontSize: number = typography.body.size, indent: number = 0) => {
    if (!text) return;
    const cleanText = cleanTextContent(text);
    if (!cleanText) return;
    
    checkPageBreak(fontSize + 3);
    
    const bulletX = margin + indent;
    const textX = bulletX + 6;
    
    // Simple bullet
    setFillColor(colors.brandSecondary);
    pdf.circle(bulletX + 1.5, yPosition - 1, 0.8, 'F');
    
    setTextColor(colors.body);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    
    const bulletLines = wrapText(cleanText, maxWidth - 8 - indent, fontSize);
    pdf.text(bulletLines, textX, yPosition);
    yPosition += bulletLines.length * (fontSize * typography.body.lineHeight) + 1;
  };

  const addNumberedPoint = (text: string, number: number, fontSize: number = typography.body.size) => {
    if (!text) return;
    const cleanText = cleanTextContent(text);
    if (!cleanText) return;
    
    checkPageBreak(fontSize + 3);
    
    // Number in circle
    setFillColor(colors.brandPrimary);
    pdf.circle(margin + 4, yPosition - 1, 2.5, 'F');
    
    setTextColor(colors.white);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text(number.toString(), margin + (number > 9 ? 2.5 : 3.2), yPosition + 0.5);
    
    setTextColor(colors.body);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    
    const textLines = wrapText(cleanText, maxWidth - 12, fontSize);
    pdf.text(textLines, margin + 10, yPosition);
    yPosition += textLines.length * (fontSize * typography.body.lineHeight) + 1.5;
  };

  const addDivider = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    checkPageBreak(4);
    
    const lineStyles = {
      light: { color: colors.divider, width: 0.3, spacing: 2 },
      medium: { color: colors.border, width: 0.5, spacing: 3 },
      heavy: { color: colors.brandPrimary, width: 0.8, spacing: 4 }
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

  // Start PDF with compact title
  addPageHeader();

  // Main title
  setTextColor(colors.heading);
  pdf.setFontSize(typography.title.size);
  pdf.setFont('helvetica', 'bold');
  const titleLines = wrapText(jumpData.title, maxWidth, typography.title.size);
  pdf.text(titleLines, margin, yPosition);
  yPosition += titleLines.length * (typography.title.size * typography.title.lineHeight) + 3;

  // Title underline
  setDrawColor(colors.brandPrimary);
  pdf.setLineWidth(1);
  pdf.line(margin, yPosition, margin + maxWidth * 0.6, yPosition);
  yPosition += 4;

  // Compact metadata
  const dateText = new Date(jumpData.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric'
  });
  
  setTextColor(colors.muted);
  pdf.setFontSize(typography.caption.size);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${dateText}`, margin, yPosition);
  
  setTextColor(colors.brandSecondary);
  pdf.setFont('helvetica', 'bold');
  const aiText = 'AI Strategic Plan';
  const aiTextWidth = pdf.getTextWidth(aiText);
  pdf.text(aiText, pageWidth - margin - aiTextWidth, yPosition);
  
  yPosition += 6;

  // Executive Summary (if available)
  if (jumpData.summary) {
    addSectionHeader('Executive Summary', 1);
    addParagraph(jumpData.summary, typography.body.size + 1);
    addDivider('medium');
  }

  // 1. STRATEGIC ACTION PLAN - Improved formatting
  if (jumpData.content) {
    addSectionHeader('Strategic Action Plan', 1);
    
    const lines = jumpData.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines entirely

      if (line.startsWith('# ')) {
        addSubsectionHeader(line.substring(2).trim());
      } else if (line.startsWith('## ')) {
        checkPageBreak(12);
        setTextColor(colors.heading);
        pdf.setFontSize(typography.h3.size);
        pdf.setFont('helvetica', 'bold');
        pdf.text(line.substring(3).trim(), margin, yPosition);
        yPosition += typography.h3.size + 3;
      } else if (line.startsWith('### ')) {
        checkPageBreak(10);
        setTextColor(colors.body);
        pdf.setFontSize(typography.body.size + 1);
        pdf.setFont('helvetica', 'bold');
        pdf.text(line.substring(4).trim(), margin, yPosition);
        yPosition += typography.body.size + 3;
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

  // 2. IMPLEMENTATION PLAN - Compact design
  if (jumpData.structured_plan) {
    addSectionHeader('Implementation Roadmap', 1);
    
    if (jumpData.structured_plan.overview) {
      addParagraph(jumpData.structured_plan.overview, typography.body.size + 1);
      yPosition += 2;
    }

    if (jumpData.structured_plan.phases && jumpData.structured_plan.phases.length > 0) {
      jumpData.structured_plan.phases.forEach((phase: any, index: number) => {
        checkPageBreak(25);
        
        // Compact Phase header
        const phaseTitle = `Phase ${phase.phase_number || index + 1}: ${phase.title}`;
        
        // Phase background
        setFillColor(colors.accentBg);
        pdf.rect(margin - 3, yPosition - 2, maxWidth + 6, 14, 'F');
        
        // Phase number
        setFillColor(colors.brandPrimary);
        pdf.circle(margin + 5, yPosition + 3, 3, 'F');
        
        setTextColor(colors.white);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text((phase.phase_number || index + 1).toString(), margin + (phase.phase_number > 9 ? 3.5 : 4.2), yPosition + 4.5);
        
        setTextColor(colors.heading);
        pdf.setFontSize(typography.h2.size);
        pdf.setFont('helvetica', 'bold');
        pdf.text(phaseTitle, margin + 12, yPosition + 6);
        yPosition += 16;

        if (phase.duration) {
          setTextColor(colors.muted);
          pdf.setFontSize(typography.caption.size);
          pdf.setFont('helvetica', 'italic');
          pdf.text(`Duration: ${phase.duration}`, margin, yPosition);
          yPosition += 5;
        }

        if (phase.description) {
          addParagraph(phase.description);
        }

        if (phase.tasks && phase.tasks.length > 0) {
          setTextColor(colors.muted);
          pdf.setFontSize(typography.body.size);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Key Deliverables:', margin, yPosition);
          yPosition += 5;
          
          phase.tasks.forEach((task: any) => {
            const taskText = typeof task === 'string' ? task : task.description || task.name || 'Task';
            addBulletPoint(taskText, typography.body.size);
          });
        }
        yPosition += 3;
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
        yPosition += 6;
      }

      yPosition += 8;
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

// ==================== PITCH DECK PDF GENERATOR ====================

export const generatePitchDeckPDF = (): void => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Premium investor-focused color palette - Deep navy & gold accent
  const colors = {
    // Primary brand - Deep sophisticated navy
    navy: { r: 15, g: 23, b: 42 },
    navyLight: { r: 30, g: 41, b: 59 },
    navyMid: { r: 51, g: 65, b: 85 },
    
    // Accent - Warm gold/amber for premium feel
    gold: { r: 217, g: 167, b: 72 },
    goldLight: { r: 250, g: 204, b: 100 },
    goldDark: { r: 180, g: 130, b: 50 },
    
    // Text hierarchy
    heading: { r: 15, g: 23, b: 42 },
    body: { r: 55, g: 65, b: 81 },
    muted: { r: 107, g: 114, b: 128 },
    subtle: { r: 156, g: 163, b: 175 },
    
    // Backgrounds - warm neutrals
    white: { r: 255, g: 255, b: 255 },
    cream: { r: 253, g: 251, b: 247 },
    warmGray: { r: 249, g: 247, b: 243 },
    cardBg: { r: 255, g: 255, b: 255 },
    
    // Semantic colors
    success: { r: 22, g: 163, b: 74 },
    blue: { r: 37, g: 99, b: 235 },
    
    // Borders
    border: { r: 229, g: 225, b: 218 },
    borderLight: { r: 243, g: 240, b: 235 },
    
    // Legacy aliases for backward compatibility (mapped to new palette)
    primary: { r: 15, g: 23, b: 42 },
    primaryLight: { r: 37, g: 99, b: 235 },
    secondary: { r: 55, g: 65, b: 81 },
    accent: { r: 217, g: 167, b: 72 },
    sectionBg: { r: 249, g: 247, b: 243 },
    highlightBg: { r: 253, g: 251, b: 247 },
    yellow: { r: 234, g: 179, b: 8 },
    amber: { r: 245, g: 158, b: 11 },
    violet: { r: 139, g: 92, b: 246 },
  };

  const setFillColor = (color: { r: number; g: number; b: number }) => {
    pdf.setFillColor(color.r, color.g, color.b);
  };

  const setTextColor = (color: { r: number; g: number; b: number }) => {
    pdf.setTextColor(color.r, color.g, color.b);
  };

  const setDrawColor = (color: { r: number; g: number; b: number }) => {
    pdf.setDrawColor(color.r, color.g, color.b);
  };

  const checkPageBreak = (neededHeight: number) => {
    if (yPosition + neededHeight > pageHeight - 25) {
      pdf.addPage();
      yPosition = margin + 8;
      return true;
    }
    return false;
  };

  const wrapText = (text: string, maxW: number, fontSize: number) => {
    pdf.setFontSize(fontSize);
    return pdf.splitTextToSize(text, maxW);
  };

  // ================== PREMIUM COVER PAGE ==================
  // Deep navy background with sophisticated gradient effect
  setFillColor(colors.navy);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Subtle gradient overlay (simulated with rectangles)
  for (let i = 0; i < 20; i++) {
    const alpha = 0.02 * (20 - i);
    pdf.setFillColor(30 + i * 2, 41 + i * 2, 59 + i * 2);
    pdf.rect(0, pageHeight - (i * 15), pageWidth, 15, 'F');
  }
  
  // Gold accent line at top
  setFillColor(colors.gold);
  pdf.rect(0, 0, pageWidth, 3, 'F');
  
  // Logo area - elegant centered positioning
  setTextColor(colors.white);
  pdf.setFontSize(48);
  pdf.setFont('helvetica', 'bold');
  pdf.text('JumpinAI', pageWidth / 2, 70, { align: 'center' });
  
  // Subtle gold underline
  setDrawColor(colors.gold);
  pdf.setLineWidth(1.5);
  pdf.line(pageWidth / 2 - 35, 78, pageWidth / 2 + 35, 78);
  
  // Tagline with refined typography
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'normal');
  setTextColor({ r: 180, g: 190, b: 210 });
  pdf.text('AI Adaptation Studio', pageWidth / 2, 95, { align: 'center' });
  
  // Main value proposition - prominent and clear
  setTextColor(colors.white);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Personalized AI Transformation', pageWidth / 2, 125, { align: 'center' });
  pdf.text('at Scale', pageWidth / 2, 138, { align: 'center' });
  
  // Core thesis statement
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  setTextColor(colors.goldLight);
  pdf.text('The AI Adaptation Studio That Builds Your Path Forward', pageWidth / 2, 158, { align: 'center' });
  
  // Supporting description with better line height
  setTextColor({ r: 160, g: 175, b: 200 });
  pdf.setFontSize(9);
  const subtitleLines = wrapText('From 2 questions to a complete transformation blueprint in 2 minutes — plus the ability to build and export automated workflows and AI agents.', 150, 9);
  subtitleLines.forEach((line: string, idx: number) => {
    pdf.text(line, pageWidth / 2, 175 + (idx * 5), { align: 'center' });
  });
  
  // Pitch deck label with gold accent
  yPosition = pageHeight - 70;
  setFillColor(colors.gold);
  pdf.rect(pageWidth / 2 - 50, yPosition - 3, 100, 18, 'F');
  
  setTextColor(colors.navy);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVESTOR PITCH DECK', pageWidth / 2, yPosition + 7, { align: 'center' });
  
  // Date and confidential notice
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  setTextColor({ r: 140, g: 155, b: 180 });
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Pre-Seed Investment Opportunity', pageWidth / 2, pageHeight - 38, { align: 'center' });
  pdf.text(currentDate, pageWidth / 2, pageHeight - 28, { align: 'center' });
  
  pdf.setFontSize(8);
  setTextColor({ r: 100, g: 115, b: 140 });
  pdf.text('Confidential & Proprietary', pageWidth / 2, pageHeight - 15, { align: 'center' });

  // ================== PREMIUM HELPERS ==================
  const addSectionHeader = (title: string) => {
    checkPageBreak(28);
    
    // Premium section header with gold accent
    setFillColor(colors.warmGray);
    pdf.rect(margin - 4, yPosition - 4, maxWidth + 8, 18, 'F');
    
    // Gold accent bar on left
    setFillColor(colors.gold);
    pdf.rect(margin - 4, yPosition - 4, 3, 18, 'F');
    
    // Section title with refined typography
    setTextColor(colors.navy);
    pdf.setFontSize(15);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin + 4, yPosition + 7);
    
    // Subtle gold underline
    setDrawColor(colors.gold);
    pdf.setLineWidth(0.5);
    pdf.line(margin + 4, yPosition + 11, margin + 4 + pdf.getTextWidth(title), yPosition + 11);
    
    yPosition += 22;
  };

  const addSubHeader = (title: string, size: number = 11) => {
    checkPageBreak(14);
    setTextColor(colors.navy);
    pdf.setFontSize(size);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, yPosition);
    
    // Subtle underline
    setDrawColor(colors.borderLight);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPosition + 3, margin + maxWidth * 0.4, yPosition + 3);
    
    yPosition += size + 5;
  };

  const addPara = (text: string, fontSize: number = 9, style: 'normal' | 'bold' | 'italic' = 'normal') => {
    checkPageBreak(12);
    setTextColor(colors.body);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', style);
    const lines = wrapText(text, maxWidth, fontSize);
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * (fontSize * 0.45) + 4;
  };

  const addBullet = (text: string, fontSize: number = 8.5, indent: number = 0) => {
    checkPageBreak(12);
    // Gold bullet point
    setFillColor(colors.gold);
    pdf.circle(margin + indent + 2, yPosition - 1, 1.2, 'F');
    setTextColor(colors.body);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    const lines = wrapText(text, maxWidth - 8 - indent, fontSize);
    pdf.text(lines, margin + indent + 6, yPosition);
    yPosition += lines.length * (fontSize * 0.45) + 3;
  };

  // Premium card helper
  const drawPremiumCard = (x: number, y: number, w: number, h: number, hasShadow: boolean = true) => {
    // Subtle shadow effect
    if (hasShadow) {
      setFillColor({ r: 240, g: 238, b: 233 });
      pdf.rect(x + 1, y + 1, w, h, 'F');
    }
    // Card background
    setFillColor(colors.white);
    pdf.rect(x, y, w, h, 'F');
    // Border
    setDrawColor(colors.border);
    pdf.setLineWidth(0.4);
    pdf.rect(x, y, w, h, 'S');
  };

  // ================== THE PROBLEM ==================
  pdf.addPage();
  yPosition = margin + 10;
  addSectionHeader('The Problem');

  addPara('The AI revolution has created a paradox: while AI capabilities advance exponentially, actual adoption and successful implementation lag dramatically behind. Organizations and individuals face a fundamental disconnect between AI\'s promise and their ability to harness it effectively.', 9.5);
  yPosition += 6;

  // Problem cards - 3 columns with premium styling
  checkPageBreak(65);
  const pCardWidth = (maxWidth - 12) / 3;
  const pCardHeight = 58;
  const pStartY = yPosition;

  // Card 1: Personalization Crisis
  drawPremiumCard(margin, pStartY, pCardWidth, pCardHeight);
  
  // Gold accent at top
  setFillColor(colors.gold);
  pdf.rect(margin, pStartY, pCardWidth, 3, 'F');

  setTextColor(colors.navy);
  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Personalization Crisis', margin + pCardWidth / 2, pStartY + 12, { align: 'center' });

  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const c1 = wrapText('Generic AI consulting and cookie-cutter frameworks fundamentally misunderstand successful transformation. Every organization operates within unique constraints.', pCardWidth - 8, 7.5);
  pdf.text(c1, margin + 4, pStartY + 20);

  setTextColor(colors.gold);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('78%', margin + pCardWidth / 2, pStartY + 46, { align: 'center' });
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('of AI initiatives fail', margin + pCardWidth / 2, pStartY + 52, { align: 'center' });

  // Card 2: Implementation Gap
  drawPremiumCard(margin + pCardWidth + 6, pStartY, pCardWidth, pCardHeight);
  setFillColor(colors.gold);
  pdf.rect(margin + pCardWidth + 6, pStartY, pCardWidth, 3, 'F');

  setTextColor(colors.navy);
  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Implementation Gap', margin + pCardWidth + 6 + pCardWidth / 2, pStartY + 12, { align: 'center' });

  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const c2 = wrapText('Individuals invest 40+ hours researching AI strategies, consuming countless articles and courses. Despite this investment, they remain paralyzed at the starting line.', pCardWidth - 8, 7.5);
  pdf.text(c2, margin + pCardWidth + 6 + 4, pStartY + 20);

  setTextColor(colors.gold);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('40+ hours', margin + pCardWidth + 6 + pCardWidth / 2, pStartY + 46, { align: 'center' });
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('wasted without results', margin + pCardWidth + 6 + pCardWidth / 2, pStartY + 52, { align: 'center' });

  // Card 3: Adaptation Void
  drawPremiumCard(margin + 2 * (pCardWidth + 6), pStartY, pCardWidth, pCardHeight);
  setFillColor(colors.gold);
  pdf.rect(margin + 2 * (pCardWidth + 6), pStartY, pCardWidth, 3, 'F');

  setTextColor(colors.navy);
  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Adaptation Void', margin + 2 * (pCardWidth + 6) + pCardWidth / 2, pStartY + 12, { align: 'center' });

  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const c3 = wrapText('Traditional solutions offer static documents that become obsolete the moment reality deviates from assumptions. Users are abandoned when they need guidance most.', pCardWidth - 8, 7.5);
  pdf.text(c3, margin + 2 * (pCardWidth + 6) + 4, pStartY + 20);

  setTextColor(colors.gold);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Static plans', margin + 2 * (pCardWidth + 6) + pCardWidth / 2, pStartY + 46, { align: 'center' });
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('fail when obstacles arise', margin + 2 * (pCardWidth + 6) + pCardWidth / 2, pStartY + 52, { align: 'center' });

  yPosition = pStartY + pCardHeight + 12;

  // Market Opportunity highlight - Premium gold banner
  checkPageBreak(28);
  setFillColor(colors.navy);
  pdf.rect(margin, yPosition, maxWidth, 24, 'F');
  
  // Gold accent lines
  setFillColor(colors.gold);
  pdf.rect(margin, yPosition, maxWidth, 2, 'F');
  pdf.rect(margin, yPosition + 22, maxWidth, 2, 'F');

  setTextColor(colors.goldLight);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Market Opportunity: $50B+ AI Transformation Market by 2028', margin + maxWidth / 2, yPosition + 10, { align: 'center' });
  setTextColor(colors.white);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Millions desperately need a solution bridging AI\'s potential and their ability to realize it', margin + maxWidth / 2, yPosition + 18, { align: 'center' });
  yPosition += 24;

  // ================== OUR SOLUTION ==================
  pdf.addPage();
  yPosition = margin + 5;
  addSectionHeader('Our Solution');

  // Main solution intro
  setTextColor(colors.heading);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('A Truly Adaptive AI Transformation Platform', margin + maxWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;

  setTextColor(colors.muted);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('From 2 Questions to Complete Blueprint in 2 Minutes + Implementation Capability', margin + maxWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Solution description box
  checkPageBreak(28);
  setFillColor({ r: 239, g: 246, b: 255 });
  pdf.rect(margin, yPosition, maxWidth, 24, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, yPosition, maxWidth, 24, 'S');

  setTextColor(colors.body);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  const solutionText = wrapText('JumpinAI solves the personalization crisis, implementation gap, and adaptation void simultaneously. Our AI engine generates a comprehensive transformation blueprint tailored specifically to your situation—including strategic Overview with alternative routes, adaptive Plan with multi-level clarifications and alternative approaches, and ready-to-use Tools & Prompts. Beyond strategy, users can analyze Jumps to discover automation opportunities and build workflows or AI agents—downloadable for both n8n and Make.com. From strategy to working systems.', maxWidth - 8, 8);
  pdf.text(solutionText, margin + 4, yPosition + 6);
  yPosition += 28;

  // Hyper-Personalization and True Adaptability cards
  checkPageBreak(48);
  const solCardWidth = (maxWidth - 4) / 2;
  const solCardHeight = 42;
  const solY = yPosition;

  // Hyper-Personalization card
  setFillColor(colors.cardBg);
  pdf.rect(margin, solY, solCardWidth, solCardHeight, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, solY, solCardWidth, solCardHeight, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Hyper-Personalization at Scale', margin + 3, solY + 7);

  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('✓ Every Jump uniquely tailored to your industry, role,', margin + 3, solY + 14);
  pdf.text('   team size, budget, technical capabilities, and goals', margin + 3, solY + 19);
  pdf.text('✓ Multi-model AI orchestration (xAI, ChatGPT-5,', margin + 3, solY + 26);
  pdf.text('   Claude, Gemini) for optimal analysis depth', margin + 3, solY + 31);
  pdf.text('✓ Comprehensive transformation in ~2 minutes', margin + 3, solY + 38);

  // True Adaptability card
  setFillColor(colors.cardBg);
  pdf.rect(margin + solCardWidth + 4, solY, solCardWidth, solCardHeight, 'F');
  setDrawColor(colors.primaryLight);
  pdf.rect(margin + solCardWidth + 4, solY, solCardWidth, solCardHeight, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('True Adaptability', margin + solCardWidth + 4 + 3, solY + 7);

  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('✓ 4-level deep clarification system: drill down', margin + solCardWidth + 4 + 3, solY + 14);
  pdf.text('   into any step for granular guidance', margin + solCardWidth + 4 + 3, solY + 19);
  pdf.text('✓ 3 alternative routes per step: pivot when', margin + solCardWidth + 4 + 3, solY + 26);
  pdf.text('   obstacles arise or circumstances change', margin + solCardWidth + 4 + 3, solY + 31);
  pdf.text('✓ AI Coach for continuous refinement post-generation', margin + solCardWidth + 4 + 3, solY + 38);

  yPosition = solY + solCardHeight + 8;

  // ================== THE JUMP BLUEPRINT SYSTEM ==================
  addSubHeader('The Jump Blueprint System', 10);
  yPosition += 2;

  // 3 Tab cards
  checkPageBreak(52);
  const tabWidth = (maxWidth - 6) / 3;
  const tabHeight = 48;
  const tabY = yPosition;

  // Tab 1: Overview
  setFillColor(colors.cardBg);
  pdf.rect(margin, tabY, tabWidth, tabHeight, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, tabY, tabWidth, tabHeight, 'S');

  setFillColor(colors.primary);
  pdf.circle(margin + 8, tabY + 8, 4, 'F');
  setTextColor(colors.white);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('1', margin + 6.5, tabY + 10);

  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overview Tab', margin + tabWidth / 2, tabY + 18, { align: 'center' });

  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Strategic foundation with', margin + 3, tabY + 25);
  pdf.text('executive-level analysis:', margin + 3, tabY + 30);
  pdf.setFont('helvetica', 'bold');
  pdf.text('• The Jump Forward', margin + 3, tabY + 36);
  pdf.text('• Alternative Routes', margin + 3, tabY + 41);
  pdf.text('• Flight Path & Timeline', margin + 3, tabY + 46);

  // Tab 2: Adaptive Plan
  setFillColor(colors.cardBg);
  pdf.rect(margin + tabWidth + 3, tabY, tabWidth, tabHeight, 'F');
  setDrawColor(colors.primaryLight);
  pdf.rect(margin + tabWidth + 3, tabY, tabWidth, tabHeight, 'S');

  setFillColor(colors.primary);
  pdf.circle(margin + tabWidth + 3 + 8, tabY + 8, 4, 'F');
  setTextColor(colors.white);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('2', margin + tabWidth + 3 + 6.5, tabY + 10);

  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Adaptive Plan Tab', margin + tabWidth + 3 + tabWidth / 2, tabY + 18, { align: 'center' });

  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Your execution plan that', margin + tabWidth + 3 + 3, tabY + 25);
  pdf.text('adapts in real-time:', margin + tabWidth + 3 + 3, tabY + 30);
  pdf.setFont('helvetica', 'bold');
  pdf.text('• Step-by-step guidance', margin + tabWidth + 3 + 3, tabY + 36);
  pdf.text('• 4-Level Clarification', margin + tabWidth + 3 + 3, tabY + 41);
  pdf.text('• Alternative Routes', margin + tabWidth + 3 + 3, tabY + 46);

  // Tab 3: Tools & Prompts
  setFillColor(colors.cardBg);
  pdf.rect(margin + 2 * (tabWidth + 3), tabY, tabWidth, tabHeight, 'F');
  setDrawColor(colors.primaryLight);
  pdf.rect(margin + 2 * (tabWidth + 3), tabY, tabWidth, tabHeight, 'S');

  setFillColor(colors.primary);
  pdf.circle(margin + 2 * (tabWidth + 3) + 8, tabY + 8, 4, 'F');
  setTextColor(colors.white);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('3', margin + 2 * (tabWidth + 3) + 6.5, tabY + 10);

  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tools & Prompts Tab', margin + 2 * (tabWidth + 3) + tabWidth / 2, tabY + 18, { align: 'center' });

  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Bridge from strategy to', margin + 2 * (tabWidth + 3) + 3, tabY + 25);
  pdf.text('execution:', margin + 2 * (tabWidth + 3) + 3, tabY + 30);
  pdf.setFont('helvetica', 'bold');
  pdf.text('• 9+ Tool-Prompt Combos', margin + 2 * (tabWidth + 3) + 3, tabY + 36);
  pdf.text('• Copy-Paste Ready', margin + 2 * (tabWidth + 3) + 3, tabY + 41);
  pdf.text('• Equip Feature', margin + 2 * (tabWidth + 3) + 3, tabY + 46);

  yPosition = tabY + tabHeight + 6;

  // ================== IMPLEMENTATION CAPABILITY ==================
  pdf.addPage();
  yPosition = margin + 5;
  addSectionHeader('Implementation Capability');

  addPara('Beyond strategy generation, JumpinAI takes users from insight to working automation systems. Users can analyze their completed Jumps to discover automation opportunities, then choose between two automation types and two platforms:', 9);
  yPosition += 4;

  // Two Automation Types
  addSubHeader('Two Automation Types', 9);
  yPosition += 2;

  checkPageBreak(50);
  const implW = (maxWidth - 4) / 2;
  let implY = yPosition;

  // Workflows Card (Blue)
  setFillColor({ r: 239, g: 246, b: 255 });
  pdf.rect(margin, implY, implW, 46, 'F');
  setDrawColor(colors.blue);
  pdf.setLineWidth(0.6);
  pdf.rect(margin, implY, implW, 46, 'S');

  setFillColor(colors.blue);
  pdf.circle(margin + 6, implY + 8, 2.5, 'F');

  setTextColor(colors.heading);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Workflows', margin + 12, implY + 10);

  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const wfDesc = wrapText('Linear automation sequences with predefined steps. Perfect for structured, repeatable processes that follow a clear path from trigger to completion.', implW - 10, 7.5);
  pdf.text(wfDesc, margin + 4, implY + 18);

  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Use cases: Data sync, email automation, scheduled tasks', margin + 4, implY + 42);

  // AI Agents Card (Yellow)
  setFillColor({ r: 254, g: 252, b: 232 });
  pdf.rect(margin + implW + 4, implY, implW, 46, 'F');
  setDrawColor(colors.yellow);
  pdf.setLineWidth(0.6);
  pdf.rect(margin + implW + 4, implY, implW, 46, 'S');

  setFillColor(colors.yellow);
  pdf.circle(margin + implW + 4 + 6, implY + 8, 2.5, 'F');

  setTextColor(colors.heading);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AI Agents', margin + implW + 4 + 12, implY + 10);

  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const agDesc = wrapText('Autonomous systems that reason, adapt, and make decisions. Handle complex, context-dependent tasks requiring judgment and dynamic responses.', implW - 10, 7.5);
  pdf.text(agDesc, margin + implW + 4 + 4, implY + 18);

  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Use cases: Lead qualification, research, decision-making', margin + implW + 4 + 4, implY + 42);

  yPosition = implY + 52;

  // Two Platform Options
  addSubHeader('Two Platform Options', 9);
  yPosition += 2;

  checkPageBreak(50);
  implY = yPosition;

  // n8n Card (Amber)
  setFillColor({ r: 255, g: 251, b: 235 });
  pdf.rect(margin, implY, implW, 46, 'F');
  setDrawColor(colors.amber);
  pdf.setLineWidth(0.6);
  pdf.rect(margin, implY, implW, 46, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('n8n', margin + 4, implY + 10);

  setTextColor(colors.amber);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Self-Hosted / Open-Source', margin + 14, implY + 10);

  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const n8nDesc = wrapText('Technical users seeking full control and customization. Self-hosted option for maximum data privacy and unlimited executions.', implW - 10, 7.5);
  pdf.text(n8nDesc, margin + 4, implY + 18);

  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.text('• Full code access', margin + 4, implY + 34);
  pdf.text('• Maximum customization', margin + 4, implY + 39);
  pdf.text('• On-premise deployment', margin + 4, implY + 44);

  // Make.com Card (Violet)
  setFillColor({ r: 245, g: 243, b: 255 });
  pdf.rect(margin + implW + 4, implY, implW, 46, 'F');
  setDrawColor(colors.violet);
  pdf.setLineWidth(0.6);
  pdf.rect(margin + implW + 4, implY, implW, 46, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Make.com', margin + implW + 4 + 4, implY + 10);

  setTextColor(colors.violet);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Cloud-Hosted / Visual Builder', margin + implW + 4 + 26, implY + 10);

  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const makeDesc = wrapText('Non-technical users seeking intuitive visual automation. Cloud-hosted with drag-and-drop interface—no coding required.', implW - 10, 7.5);
  pdf.text(makeDesc, margin + implW + 4 + 4, implY + 18);

  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.text('• Drag-and-drop builder', margin + implW + 4 + 4, implY + 34);
  pdf.text('• No coding required', margin + implW + 4 + 4, implY + 39);
  pdf.text('• Quick setup & deployment', margin + implW + 4 + 4, implY + 44);

  yPosition = implY + 52;

  // From Strategy to Automation - 3 step process
  addSubHeader('From Strategy to Automation', 9);
  yPosition += 3;

  checkPageBreak(32);
  const procWidth = (maxWidth - 6) / 3;
  const procY = yPosition;

  // Step 1
  setFillColor(colors.cardBg);
  pdf.rect(margin, procY, procWidth, 28, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, procY, procWidth, 28, 'S');

  setFillColor(colors.primary);
  pdf.circle(margin + procWidth / 2, procY + 8, 4, 'F');
  setTextColor(colors.white);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('1', margin + procWidth / 2 - 1.5, procY + 10);

  setTextColor(colors.heading);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Analyze', margin + procWidth / 2, procY + 17, { align: 'center' });
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('AI discovers opportunities', margin + procWidth / 2, procY + 23, { align: 'center' });

  // Step 2
  setFillColor(colors.cardBg);
  pdf.rect(margin + procWidth + 3, procY, procWidth, 28, 'F');
  setDrawColor(colors.primaryLight);
  pdf.rect(margin + procWidth + 3, procY, procWidth, 28, 'S');

  setFillColor(colors.primary);
  pdf.circle(margin + procWidth + 3 + procWidth / 2, procY + 8, 4, 'F');
  setTextColor(colors.white);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('2', margin + procWidth + 3 + procWidth / 2 - 1.5, procY + 10);

  setTextColor(colors.heading);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Choose', margin + procWidth + 3 + procWidth / 2, procY + 17, { align: 'center' });
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Select type & platform', margin + procWidth + 3 + procWidth / 2, procY + 23, { align: 'center' });

  // Step 3
  setFillColor(colors.cardBg);
  pdf.rect(margin + 2 * (procWidth + 3), procY, procWidth, 28, 'F');
  setDrawColor(colors.primaryLight);
  pdf.rect(margin + 2 * (procWidth + 3), procY, procWidth, 28, 'S');

  setFillColor(colors.primary);
  pdf.circle(margin + 2 * (procWidth + 3) + procWidth / 2, procY + 8, 4, 'F');
  setTextColor(colors.white);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('3', margin + 2 * (procWidth + 3) + procWidth / 2 - 1.5, procY + 10);

  setTextColor(colors.heading);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Build & Download', margin + 2 * (procWidth + 3) + procWidth / 2, procY + 17, { align: 'center' });
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Get ready-to-use files', margin + 2 * (procWidth + 3) + procWidth / 2, procY + 23, { align: 'center' });

  yPosition = procY + 34;

  // Value proposition box
  checkPageBreak(20);
  setFillColor(colors.highlightBg);
  pdf.rect(margin, yPosition, maxWidth, 16, 'F');
  setDrawColor(colors.success);
  pdf.setLineWidth(0.6);
  pdf.rect(margin, yPosition, maxWidth, 16, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Strategy to Execution—Complete Loop', margin + maxWidth / 2, yPosition + 6, { align: 'center' });
  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('From initial goals to running automation systems. No other platform delivers this complete journey.', margin + maxWidth / 2, yPosition + 12, { align: 'center' });
  yPosition += 20;

  // ================== MARKET OPPORTUNITY ==================
  pdf.addPage();
  yPosition = margin + 5;
  addSectionHeader('Market Opportunity');

  addSubHeader('Explosive Market Growth (2026)', 10);
  yPosition += 2;

  // Market metrics grid
  checkPageBreak(48);
  const mCardW = (maxWidth - 4) / 2;
  const mCardH = 22;
  let mY = yPosition;

  // Card 1: Global AI Market
  setFillColor(colors.highlightBg);
  pdf.rect(margin, mY, mCardW, mCardH, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, mY, mCardW, mCardH, 'S');

  setTextColor(colors.primary);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('$500B+', margin + 5, mY + 10);
  setTextColor(colors.heading);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Global AI Market Size (2026)', margin + 35, mY + 10);
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Growing at 37% CAGR through 2030', margin + 5, mY + 17);

  // Card 2: AI Education
  setFillColor(colors.highlightBg);
  pdf.rect(margin + mCardW + 4, mY, mCardW, mCardH, 'F');
  setDrawColor(colors.primaryLight);
  pdf.rect(margin + mCardW + 4, mY, mCardW, mCardH, 'S');

  setTextColor(colors.primary);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('$18B+', margin + mCardW + 4 + 5, mY + 10);
  setTextColor(colors.heading);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AI Education & Training (2026)', margin + mCardW + 4 + 30, mY + 10);
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('CAGR: 45%+ through 2029', margin + mCardW + 4 + 5, mY + 17);

  mY += mCardH + 4;

  // Card 3: Knowledge Workers
  setFillColor(colors.highlightBg);
  pdf.rect(margin, mY, mCardW, mCardH, 'F');
  setDrawColor(colors.primaryLight);
  pdf.rect(margin, mY, mCardW, mCardH, 'S');

  setTextColor(colors.primary);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('520M+', margin + 5, mY + 10);
  setTextColor(colors.heading);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Knowledge Workers Globally', margin + 35, mY + 10);
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('All requiring AI transformation guidance', margin + 5, mY + 17);

  // Card 4: AI Adoption
  setFillColor(colors.highlightBg);
  pdf.rect(margin + mCardW + 4, mY, mCardW, mCardH, 'F');
  setDrawColor(colors.primaryLight);
  pdf.rect(margin + mCardW + 4, mY, mCardW, mCardH, 'S');

  setTextColor(colors.primary);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('94%', margin + mCardW + 4 + 5, mY + 10);
  setTextColor(colors.heading);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Organizations Deploying AI (2026)', margin + mCardW + 4 + 25, mY + 10);
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Up from 72% in early 2024', margin + mCardW + 4 + 5, mY + 17);

  yPosition = mY + mCardH + 8;

  // Target Segments
  addSubHeader('Target Segments', 9);
  yPosition += 2;

  const segments = [
    { title: 'Individuals & Entrepreneurs (Primary)', desc: 'Founders, creators, and knowledge workers seeking personal AI upskilling and competitive advantage', note: 'Immediate monetization through subscription and credit sales' },
    { title: 'Small-Medium Businesses', desc: '1-200 employee companies needing affordable AI transformation without expensive consultants', note: 'High-value segment with team subscription potential' },
    { title: 'Enterprise Teams (Future)', desc: 'Scaling AI adoption across departments with team collaboration features', note: 'Largest revenue opportunity through enterprise licensing' },
    { title: 'Educational Institutions', desc: 'Universities and training programs preparing students for AI-driven workforce', note: 'Partnership opportunities for bulk licensing' }
  ];

  segments.forEach((seg) => {
    checkPageBreak(20);
    setFillColor(colors.cardBg);
    pdf.rect(margin, yPosition, maxWidth, 18, 'F');
    setDrawColor(colors.border);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, yPosition, maxWidth, 18, 'S');

    setTextColor(colors.heading);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text(seg.title, margin + 3, yPosition + 6);

    setTextColor(colors.body);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(seg.desc, margin + 3, yPosition + 11);

    setTextColor(colors.muted);
    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'italic');
    pdf.text(seg.note, margin + 3, yPosition + 16);

    yPosition += 20;
  });

  // Market timing highlight
  checkPageBreak(14);
  setFillColor(colors.highlightBg);
  pdf.rect(margin, yPosition, maxWidth, 12, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, maxWidth, 12, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Market Timing:', margin + 3, yPosition + 5);
  pdf.setFont('helvetica', 'normal');
  setTextColor(colors.body);
  pdf.text('2026 marks the transition from AI experimentation to mandatory enterprise transformation', margin + 28, yPosition + 5);
  yPosition += 14;

  // ================== BUSINESS MODEL ==================
  pdf.addPage();
  yPosition = margin + 5;
  addSectionHeader('Business Model');

  // Freemium
  checkPageBreak(26);
  setFillColor(colors.cardBg);
  pdf.rect(margin, yPosition, maxWidth, 24, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, maxWidth, 24, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Freemium Growth Engine', margin + 3, yPosition + 6);

  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• 3 free Jumps to experience value                    • 5 welcome credits upon sign up', margin + 3, yPosition + 13);
  pdf.text('• Viral acquisition through free tier                   • Low CAC, high conversion potential', margin + 3, yPosition + 19);

  yPosition += 28;

  // Subscription Tiers
  checkPageBreak(38);
  setFillColor(colors.cardBg);
  pdf.rect(margin, yPosition, maxWidth, 36, 'F');
  setDrawColor(colors.border);
  pdf.rect(margin, yPosition, maxWidth, 36, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Subscription Tiers', margin + 3, yPosition + 6);

  setTextColor(colors.primary);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('$9–$49/month', margin + 38, yPosition + 6);

  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Pro Plan: $15/month (promo) — 100 credits + AI Coach access', margin + 3, yPosition + 13);
  pdf.text('• Growth Plan: $30/month (promo) — 250 credits + priority support', margin + 3, yPosition + 18);
  pdf.text('• 1 credit = 1 complete Jump (3-tab transformation blueprint)', margin + 3, yPosition + 28);
  pdf.text('• All credits roll over month-to-month and never expire', margin + 3, yPosition + 33);

  yPosition += 40;

  // Credit Packs
  checkPageBreak(20);
  setFillColor(colors.cardBg);
  pdf.rect(margin, yPosition, maxWidth, 18, 'F');
  setDrawColor(colors.border);
  pdf.rect(margin, yPosition, maxWidth, 18, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Credit Packs (One-Time Purchases)', margin + 3, yPosition + 6);

  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Flexible pay-as-you-go option       • No recurring commitments       • Credits never expire', margin + 3, yPosition + 13);

  yPosition += 22;

  // Future Revenue Streams
  addSubHeader('Future Revenue Streams', 9);
  yPosition += 2;

  const futW = (maxWidth - 4) / 2;

  setFillColor(colors.cardBg);
  pdf.rect(margin, yPosition, futW, 22, 'F');
  setDrawColor(colors.border);
  pdf.rect(margin, yPosition, futW, 22, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Enterprise Solutions', margin + 3, yPosition + 6);
  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  const entLines = wrapText('Team collaboration, white-label, custom integrations, and dedicated support for organizations', futW - 6, 7);
  pdf.text(entLines, margin + 3, yPosition + 12);

  setFillColor(colors.cardBg);
  pdf.rect(margin + futW + 4, yPosition, futW, 22, 'F');
  setDrawColor(colors.border);
  pdf.rect(margin + futW + 4, yPosition, futW, 22, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Premium Resources', margin + futW + 4 + 3, yPosition + 6);
  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  const premLines = wrapText('Industry-specific templates, advanced analytics, expert consultations, and exclusive guides', futW - 6, 7);
  pdf.text(premLines, margin + futW + 4 + 3, yPosition + 12);

  yPosition += 28;

  // Growth Strategy Phases
  addSubHeader('Growth Strategy', 9);
  yPosition += 3;

  checkPageBreak(58);
  const phaseW = (maxWidth - 6) / 3;
  const phaseH = 55;
  const phaseY = yPosition;

  // Phase 1
  setFillColor(colors.cardBg);
  pdf.rect(margin, phaseY, phaseW, phaseH, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, phaseY, phaseW, phaseH, 'S');

  setTextColor(colors.primary);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Phase 1', margin + phaseW / 2, phaseY + 6, { align: 'center' });
  setTextColor(colors.heading);
  pdf.setFontSize(7.5);
  pdf.text('Launch & Validation', margin + phaseW / 2, phaseY + 12, { align: 'center' });

  setTextColor(colors.body);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Viral freemium growth', margin + 3, phaseY + 20);
  pdf.text('• Product-led growth', margin + 3, phaseY + 25);
  pdf.text('• Rapid iteration', margin + 3, phaseY + 30);
  pdf.text('• Build community', margin + 3, phaseY + 35);
  pdf.text('• Thought leadership', margin + 3, phaseY + 40);

  // Phase 2
  setFillColor(colors.cardBg);
  pdf.rect(margin + phaseW + 3, phaseY, phaseW, phaseH, 'F');
  setDrawColor(colors.primaryLight);
  pdf.rect(margin + phaseW + 3, phaseY, phaseW, phaseH, 'S');

  setTextColor(colors.primary);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Phase 2', margin + phaseW + 3 + phaseW / 2, phaseY + 6, { align: 'center' });
  setTextColor(colors.heading);
  pdf.setFontSize(7.5);
  pdf.text('Scale & Monetization', margin + phaseW + 3 + phaseW / 2, phaseY + 12, { align: 'center' });

  setTextColor(colors.body);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Optimize conversion funnel', margin + phaseW + 3 + 3, phaseY + 20);
  pdf.text('• Content marketing & SEO', margin + phaseW + 3 + 3, phaseY + 25);
  pdf.text('• Influencer partnerships', margin + phaseW + 3 + 3, phaseY + 30);
  pdf.text('• Paid acquisition', margin + phaseW + 3 + 3, phaseY + 35);
  pdf.text('• Mobile app release', margin + phaseW + 3 + 3, phaseY + 40);

  // Phase 3
  setFillColor(colors.cardBg);
  pdf.rect(margin + 2 * (phaseW + 3), phaseY, phaseW, phaseH, 'F');
  setDrawColor(colors.primaryLight);
  pdf.rect(margin + 2 * (phaseW + 3), phaseY, phaseW, phaseH, 'S');

  setTextColor(colors.primary);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Phase 3', margin + 2 * (phaseW + 3) + phaseW / 2, phaseY + 6, { align: 'center' });
  setTextColor(colors.heading);
  pdf.setFontSize(7.5);
  pdf.text('Enterprise & Expansion', margin + 2 * (phaseW + 3) + phaseW / 2, phaseY + 12, { align: 'center' });

  setTextColor(colors.body);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Team collaboration', margin + 2 * (phaseW + 3) + 3, phaseY + 20);
  pdf.text('• Enterprise sales', margin + 2 * (phaseW + 3) + 3, phaseY + 25);
  pdf.text('• API partnerships', margin + 2 * (phaseW + 3) + 3, phaseY + 30);
  pdf.text('• B2B partnerships', margin + 2 * (phaseW + 3) + 3, phaseY + 35);
  pdf.text('• International expansion', margin + 2 * (phaseW + 3) + 3, phaseY + 40);
  pdf.text('• White-label solutions', margin + 2 * (phaseW + 3) + 3, phaseY + 45);

  yPosition = phaseY + phaseH + 6;

  // ================== PROJECTIONS ==================
  pdf.addPage();
  yPosition = margin + 5;
  addSectionHeader('Projections');

  addPara('Conservative estimates based on comparable SaaS benchmarks, freemium conversion rates, and our unique market positioning as a pre-launch platform.', 8, 'italic');
  yPosition += 4;

  // Year cards - 3 columns
  checkPageBreak(65);
  const yearW = (maxWidth - 6) / 3;
  const yearH = 60;
  const yearY = yPosition;

  // 2026
  setFillColor(colors.cardBg);
  pdf.rect(margin, yearY, yearW, yearH, 'F');
  setDrawColor(colors.primary);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, yearY, yearW, yearH, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('2026', margin + yearW / 2, yearY + 7, { align: 'center' });
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Launch & Growth', margin + yearW / 2, yearY + 12, { align: 'center' });

  setFillColor(colors.highlightBg);
  pdf.rect(margin + 3, yearY + 16, yearW - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Users', margin + yearW / 2, yearY + 20, { align: 'center' });
  setTextColor(colors.primary);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('15,000', margin + yearW / 2, yearY + 26, { align: 'center' });

  setFillColor(colors.highlightBg);
  pdf.rect(margin + 3, yearY + 30, yearW - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Paying Customers', margin + yearW / 2, yearY + 34, { align: 'center' });
  setTextColor(colors.primary);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('750 (~5%)', margin + yearW / 2, yearY + 40, { align: 'center' });

  setFillColor(colors.highlightBg);
  pdf.rect(margin + 3, yearY + 44, yearW - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Annual Revenue', margin + yearW / 2, yearY + 48, { align: 'center' });
  setTextColor(colors.success);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('$180K', margin + yearW / 2, yearY + 54, { align: 'center' });

  // 2027
  setFillColor(colors.cardBg);
  pdf.rect(margin + yearW + 3, yearY, yearW, yearH, 'F');
  setDrawColor(colors.primary);
  pdf.rect(margin + yearW + 3, yearY, yearW, yearH, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('2027', margin + yearW + 3 + yearW / 2, yearY + 7, { align: 'center' });
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Scale & Optimize', margin + yearW + 3 + yearW / 2, yearY + 12, { align: 'center' });

  setFillColor(colors.highlightBg);
  pdf.rect(margin + yearW + 3 + 3, yearY + 16, yearW - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Users', margin + yearW + 3 + yearW / 2, yearY + 20, { align: 'center' });
  setTextColor(colors.primary);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('75,000', margin + yearW + 3 + yearW / 2, yearY + 26, { align: 'center' });

  setFillColor(colors.highlightBg);
  pdf.rect(margin + yearW + 3 + 3, yearY + 30, yearW - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Paying Customers', margin + yearW + 3 + yearW / 2, yearY + 34, { align: 'center' });
  setTextColor(colors.primary);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('5,250 (~7%)', margin + yearW + 3 + yearW / 2, yearY + 40, { align: 'center' });

  setFillColor(colors.highlightBg);
  pdf.rect(margin + yearW + 3 + 3, yearY + 44, yearW - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Annual Revenue', margin + yearW + 3 + yearW / 2, yearY + 48, { align: 'center' });
  setTextColor(colors.success);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('$1.4M', margin + yearW + 3 + yearW / 2, yearY + 54, { align: 'center' });

  // 2028
  setFillColor(colors.cardBg);
  pdf.rect(margin + 2 * (yearW + 3), yearY, yearW, yearH, 'F');
  setDrawColor(colors.primary);
  pdf.rect(margin + 2 * (yearW + 3), yearY, yearW, yearH, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('2028', margin + 2 * (yearW + 3) + yearW / 2, yearY + 7, { align: 'center' });
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Enterprise Entry', margin + 2 * (yearW + 3) + yearW / 2, yearY + 12, { align: 'center' });

  setFillColor(colors.highlightBg);
  pdf.rect(margin + 2 * (yearW + 3) + 3, yearY + 16, yearW - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Users', margin + 2 * (yearW + 3) + yearW / 2, yearY + 20, { align: 'center' });
  setTextColor(colors.primary);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('250,000', margin + 2 * (yearW + 3) + yearW / 2, yearY + 26, { align: 'center' });

  setFillColor(colors.highlightBg);
  pdf.rect(margin + 2 * (yearW + 3) + 3, yearY + 30, yearW - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Paying Customers', margin + 2 * (yearW + 3) + yearW / 2, yearY + 34, { align: 'center' });
  setTextColor(colors.primary);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('22,500 (~9%)', margin + 2 * (yearW + 3) + yearW / 2, yearY + 40, { align: 'center' });

  setFillColor(colors.highlightBg);
  pdf.rect(margin + 2 * (yearW + 3) + 3, yearY + 44, yearW - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Annual Revenue', margin + 2 * (yearW + 3) + yearW / 2, yearY + 48, { align: 'center' });
  setTextColor(colors.success);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('$6.2M', margin + 2 * (yearW + 3) + yearW / 2, yearY + 54, { align: 'center' });

  yPosition = yearY + yearH + 6;

  // Key Assumptions & Growth Drivers
  addSubHeader('Key Assumptions & Growth Drivers', 9);
  yPosition += 2;

  checkPageBreak(42);
  const assW = (maxWidth - 4) / 2;

  setFillColor(colors.cardBg);
  pdf.rect(margin, yPosition, assW, 38, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, assW, 38, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Key Assumptions', margin + 3, yPosition + 6);

  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Average subscription value: $20/month (blended)', margin + 3, yPosition + 13);
  pdf.text('• Conservative 5-9% freemium conversion rate', margin + 3, yPosition + 18);
  pdf.text('• 85% annual retention rate for paid users', margin + 3, yPosition + 23);
  pdf.text('• Additional revenue from credit pack purchases', margin + 3, yPosition + 28);

  setFillColor(colors.cardBg);
  pdf.rect(margin + assW + 4, yPosition, assW, 38, 'F');
  setDrawColor(colors.border);
  pdf.rect(margin + assW + 4, yPosition, assW, 38, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Growth Drivers', margin + assW + 4 + 3, yPosition + 6);

  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Product-led growth with viral freemium tier', margin + assW + 4 + 3, yPosition + 13);
  pdf.text('• Content marketing and SEO positioning', margin + assW + 4 + 3, yPosition + 18);
  pdf.text('• Native mobile apps on iOS and Android', margin + assW + 4 + 3, yPosition + 23);
  pdf.text('• Strategic partnerships and affiliates', margin + assW + 4 + 3, yPosition + 28);
  pdf.text('• Enterprise features driving upgrades', margin + assW + 4 + 3, yPosition + 33);

  yPosition += 42;

  // ================== COMPETITIVE ADVANTAGE ==================
  pdf.addPage();
  yPosition = margin + 5;
  addSectionHeader('Competitive Advantage');

  // 4 advantage cards - 2x2 grid
  checkPageBreak(88);
  const advW = (maxWidth - 4) / 2;
  const advH = 40;
  let advY = yPosition;

  // Card 1
  setFillColor(colors.cardBg);
  pdf.rect(margin, advY, advW, advH, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, advY, advW, advH, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Truly Adaptive Personalization', margin + 3, advY + 7);

  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  const adv1 = wrapText('Unlike competitors offering static templates or one-time assessments, our platform adapts in real-time with multi-level clarifications (4 deep) and alternative routes (3 per step). Every Jump is uniquely tailored.', advW - 6, 7);
  pdf.text(adv1, margin + 3, advY + 14);

  // Card 2
  setFillColor(colors.cardBg);
  pdf.rect(margin + advW + 4, advY, advW, advH, 'F');
  setDrawColor(colors.primaryLight);
  pdf.rect(margin + advW + 4, advY, advW, advH, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Complete Transformation Ecosystem', margin + advW + 4 + 3, advY + 7);

  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  const adv2 = wrapText('A complete solution combining strategic overview with alternative routes, adaptive planning, execution tools, and full Implementation—analyze Jumps to build downloadable workflows for n8n and Make.com.', advW - 6, 7);
  pdf.text(adv2, margin + advW + 4 + 3, advY + 14);

  advY += advH + 4;

  // Card 3
  setFillColor(colors.cardBg);
  pdf.rect(margin, advY, advW, advH, 'F');
  setDrawColor(colors.primaryLight);
  pdf.rect(margin, advY, advW, advH, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Speed + Simplicity + Depth + Action', margin + 3, advY + 7);

  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  const adv3 = wrapText('Generate comprehensive transformation blueprints in 2 minutes from just 2 questions—plus the ability to build downloadable AI agent workflows. Speed, ease-of-use, depth, and actionable implementation.', advW - 6, 7);
  pdf.text(adv3, margin + 3, advY + 14);

  // Card 4
  setFillColor(colors.cardBg);
  pdf.rect(margin + advW + 4, advY, advW, advH, 'F');
  setDrawColor(colors.primaryLight);
  pdf.rect(margin + advW + 4, advY, advW, advH, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Scalable AI Architecture', margin + advW + 4 + 3, advY + 7);

  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  const adv4 = wrapText('Our AI engine generates unlimited unique transformations with minimal marginal cost. Traditional consulting scales linearly; our technology enables exponential growth with superior unit economics.', advW - 6, 7);
  pdf.text(adv4, margin + advW + 4 + 3, advY + 14);

  yPosition = advY + advH + 6;

  // Strategic Position highlight
  checkPageBreak(26);
  setFillColor(colors.highlightBg);
  pdf.rect(margin, yPosition, maxWidth, 22, 'F');
  setDrawColor(colors.primary);
  pdf.setLineWidth(0.6);
  pdf.rect(margin, yPosition, maxWidth, 22, 'S');

  setTextColor(colors.primary);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Our Strategic Position', margin + maxWidth / 2, yPosition + 7, { align: 'center' });

  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const stratPos = wrapText('Our adaptive AI transformation platform takes users from strategy to running automation systems. Our technology creates compounding advantages: every Jump improves our AI, every workflow strengthens our platform, and our data moat deepens daily.', maxWidth - 10, 7.5);
  pdf.text(stratPos, margin + 5, yPosition + 13);

  yPosition += 26;

  // ================== TEAM ==================
  addSectionHeader('Our Team');

  addPara('Lean, focused team with complementary expertise in AI, product development, and market strategy', 8.5, 'italic');
  yPosition += 4;

  // Team cards - 3 columns
  checkPageBreak(38);
  const teamW = (maxWidth - 6) / 3;
  const teamH = 34;
  const teamY = yPosition;

  // Technical Leadership
  setFillColor(colors.cardBg);
  pdf.rect(margin, teamY, teamW, teamH, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, teamY, teamW, teamH, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Technical Leadership', margin + teamW / 2, teamY + 8, { align: 'center' });

  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  const tech = wrapText('Deep expertise in AI systems architecture, LLM orchestration, and scalable platform development', teamW - 6, 7);
  pdf.text(tech, margin + 3, teamY + 15);

  // Product & Design
  setFillColor(colors.cardBg);
  pdf.rect(margin + teamW + 3, teamY, teamW, teamH, 'F');
  setDrawColor(colors.border);
  pdf.rect(margin + teamW + 3, teamY, teamW, teamH, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Product & Design', margin + teamW + 3 + teamW / 2, teamY + 8, { align: 'center' });

  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  const prod = wrapText('Experience building intuitive, user-centered products with focus on simplifying complex capabilities', teamW - 6, 7);
  pdf.text(prod, margin + teamW + 3 + 3, teamY + 15);

  // Strategy & Growth
  setFillColor(colors.cardBg);
  pdf.rect(margin + 2 * (teamW + 3), teamY, teamW, teamH, 'F');
  setDrawColor(colors.border);
  pdf.rect(margin + 2 * (teamW + 3), teamY, teamW, teamH, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Strategy & Growth', margin + 2 * (teamW + 3) + teamW / 2, teamY + 8, { align: 'center' });

  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  const strat = wrapText('Background in go-to-market strategy, business development, and scaling early-stage companies', teamW - 6, 7);
  pdf.text(strat, margin + 2 * (teamW + 3) + 3, teamY + 15);

  yPosition = teamY + teamH + 6;

  // Commitment highlight
  checkPageBreak(14);
  setFillColor(colors.highlightBg);
  pdf.rect(margin, yPosition, maxWidth, 12, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, maxWidth, 12, 'S');

  setTextColor(colors.heading);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Commitment:', margin + 3, yPosition + 6);
  setTextColor(colors.body);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Dedicated full-time to building the category-defining platform for personalized AI transformation', margin + 24, yPosition + 6);

  yPosition += 16;

  // ================== USE OF FUNDS ==================
  pdf.addPage();
  yPosition = margin + 5;
  addSectionHeader('Use of Funds');

  // Allocation bars
  checkPageBreak(55);
  const allocations = [
    { label: 'Product Development', pct: 40 },
    { label: 'Customer Acquisition', pct: 30 },
    { label: 'Team Expansion', pct: 20 },
    { label: 'Operations & Infrastructure', pct: 10 }
  ];

  allocations.forEach((alloc) => {
    setTextColor(colors.heading);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(alloc.label, margin, yPosition + 5);

    setTextColor(colors.primary);
    pdf.setFontSize(9);
    const pctText = `${alloc.pct}%`;
    const pctW = pdf.getTextWidth(pctText);
    pdf.text(pctText, margin + maxWidth - pctW, yPosition + 5);

    setFillColor({ r: 240, g: 242, b: 245 });
    pdf.rect(margin, yPosition + 8, maxWidth, 4, 'F');

    setFillColor(colors.primary);
    pdf.rect(margin, yPosition + 8, (maxWidth * alloc.pct) / 100, 4, 'F');

    yPosition += 14;
  });

  yPosition += 4;

  // Key Milestones
  addSubHeader('Key Milestones (12-Month Roadmap)', 9);
  yPosition += 3;

  const milestones = [
    { q: 'Q1', title: 'Launch Enterprise Features', desc: 'Team collaboration, SSO, advanced analytics' },
    { q: 'Q2', title: 'Mobile App Launch & Scale to 100K Users', desc: 'Native apps on iOS/Android; aggressive growth marketing' },
    { q: 'Q3', title: 'International Expansion', desc: 'Multi-language support, regional customization' },
    { q: 'Q4', title: 'API & Integration Platform', desc: 'Enable third-party integrations and ecosystem' }
  ];

  milestones.forEach((m) => {
    checkPageBreak(18);
    setFillColor(colors.cardBg);
    pdf.rect(margin, yPosition, maxWidth, 16, 'F');
    setDrawColor(colors.border);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, yPosition, maxWidth, 16, 'S');

    setFillColor(colors.primary);
    pdf.circle(margin + 7, yPosition + 8, 3.5, 'F');

    setTextColor(colors.white);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text(m.q, margin + 5, yPosition + 9.5);

    setTextColor(colors.heading);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(m.title, margin + 15, yPosition + 7);

    setTextColor(colors.body);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(m.desc, margin + 15, yPosition + 12);

    yPosition += 18;
  });

  // ================== INVESTMENT OPPORTUNITY ==================
  pdf.addPage();
  yPosition = margin + 5;
  addSectionHeader('Investment Opportunity');
  yPosition += 3;

  // Investment metrics - 3 cards
  checkPageBreak(38);
  const invW = (maxWidth - 6) / 3;
  const invY = yPosition;

  // Raising
  setFillColor(colors.highlightBg);
  pdf.rect(margin, invY, invW, 32, 'F');
  setDrawColor(colors.primary);
  pdf.setLineWidth(0.6);
  pdf.rect(margin, invY, invW, 32, 'S');

  setTextColor(colors.muted);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Raising', margin + invW / 2, invY + 7, { align: 'center' });

  setTextColor(colors.primary);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('$500K', margin + invW / 2, invY + 18, { align: 'center' });

  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Pre-Seed Round', margin + invW / 2, invY + 26, { align: 'center' });

  // Valuation
  setFillColor(colors.highlightBg);
  pdf.rect(margin + invW + 3, invY, invW, 32, 'F');
  setDrawColor(colors.primary);
  pdf.rect(margin + invW + 3, invY, invW, 32, 'S');

  setTextColor(colors.muted);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Valuation', margin + invW + 3 + invW / 2, invY + 7, { align: 'center' });

  setTextColor(colors.primary);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('$2M', margin + invW + 3 + invW / 2, invY + 18, { align: 'center' });

  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Post-money', margin + invW + 3 + invW / 2, invY + 26, { align: 'center' });

  // Investor Discount
  setFillColor(colors.highlightBg);
  pdf.rect(margin + 2 * (invW + 3), invY, invW, 32, 'F');
  setDrawColor(colors.primary);
  pdf.rect(margin + 2 * (invW + 3), invY, invW, 32, 'S');

  setTextColor(colors.muted);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Investor Discount', margin + 2 * (invW + 3) + invW / 2, invY + 7, { align: 'center' });

  setTextColor(colors.primary);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('20%', margin + 2 * (invW + 3) + invW / 2, invY + 18, { align: 'center' });

  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Standard Discount', margin + 2 * (invW + 3) + invW / 2, invY + 26, { align: 'center' });

  yPosition += 38;

  // Why Invest Now - 2x2 grid
  addSubHeader('Why Invest Now', 9);
  yPosition += 3;

  checkPageBreak(60);
  const whyW = (maxWidth - 4) / 2;
  const whyH = 26;
  let whyY = yPosition;

  const whyReasons = [
    { title: 'Strong Market Timing', desc: 'AI adoption urgency at all-time high—enterprises mandating transformation' },
    { title: 'Product Ready', desc: 'Fully functional platform, proven technology, ready to scale' },
    { title: 'Massive Market', desc: '$50B+ TAM in AI transformation & automation' },
    { title: 'Scalable Technology', desc: 'AI-powered platform with minimal marginal costs' }
  ];

  whyReasons.forEach((r, idx) => {
    const xPos = idx % 2 === 0 ? margin : margin + whyW + 4;
    const yPos = whyY + Math.floor(idx / 2) * (whyH + 3);

    setFillColor(colors.cardBg);
    pdf.rect(xPos, yPos, whyW, whyH, 'F');
    setDrawColor(colors.border);
    pdf.setLineWidth(0.4);
    pdf.rect(xPos, yPos, whyW, whyH, 'S');

    setFillColor(colors.success);
    pdf.circle(xPos + 6, yPos + 7, 2.5, 'F');
    setTextColor(colors.white);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('✓', xPos + 4.5, yPos + 8.5);

    setTextColor(colors.heading);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(r.title, xPos + 12, yPos + 8);

    setTextColor(colors.body);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    const descLines = wrapText(r.desc, whyW - 14, 7);
    pdf.text(descLines, xPos + 12, yPos + 14);
  });

  yPosition = whyY + 2 * (whyH + 3) + 6;

  // Final CTA - Premium navy with gold accent
  checkPageBreak(32);
  setFillColor(colors.navy);
  pdf.rect(margin, yPosition, maxWidth, 28, 'F');
  
  // Gold accent bars
  setFillColor(colors.gold);
  pdf.rect(margin, yPosition, maxWidth, 2, 'F');

  setTextColor(colors.white);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Join us in democratizing personalized AI transformation', margin + maxWidth / 2, yPosition + 12, { align: 'center' });

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  setTextColor(colors.goldLight);
  pdf.text('Building the category-defining platform for the AI-powered workforce', margin + maxWidth / 2, yPosition + 21, { align: 'center' });

  yPosition += 32;

  // ================== PREMIUM CLOSING PAGE ==================
  pdf.addPage();
  
  // Full navy background
  setFillColor(colors.navy);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Gold accent at top
  setFillColor(colors.gold);
  pdf.rect(0, 0, pageWidth, 4, 'F');
  
  // Centered content
  yPosition = pageHeight / 2 - 45;

  // Brand name with elegance
  setTextColor(colors.white);
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'bold');
  pdf.text('JumpinAI', pageWidth / 2, yPosition, { align: 'center' });
  
  // Gold underline
  setDrawColor(colors.gold);
  pdf.setLineWidth(1.5);
  pdf.line(pageWidth / 2 - 30, yPosition + 6, pageWidth / 2 + 30, yPosition + 6);

  yPosition += 25;

  setTextColor(colors.goldLight);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Let\'s Build Together', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 25;

  // Contact section with refined styling
  setTextColor({ r: 160, g: 175, b: 200 });
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Contact Us', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 14;

  setTextColor(colors.white);
  pdf.setFontSize(11);
  pdf.text('info@jumpinai.com', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;
  pdf.text('www.jumpinai.com', pageWidth / 2, yPosition, { align: 'center' });

  // Tagline at bottom
  setTextColor({ r: 100, g: 115, b: 140 });
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'italic');
  pdf.text('The AI Adaptation Studio That Builds Your Path Forward', pageWidth / 2, pageHeight - 25, { align: 'center' });

  // ================== PREMIUM PAGE NUMBERS & FOOTER ==================
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount) continue;

    pdf.setPage(i);
    
    // Subtle footer line
    setDrawColor(colors.border);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

    // Brand on left
    setTextColor(colors.muted);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text('JumpinAI', margin, pageHeight - 10);
    
    // Confidential in center
    pdf.setFontSize(6.5);
    setTextColor(colors.subtle);
    pdf.text('Confidential', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Page number on right with refined styling
    setTextColor(colors.muted);
    pdf.setFontSize(7.5);
    const pgText = `${i} / ${pageCount}`;
    const pgW = pdf.getTextWidth(pgText);
    pdf.text(pgText, pageWidth - margin - pgW, pageHeight - 10);
  }

  // Save
  const timestamp = new Date().toISOString().slice(0, 10);
  const fileName = `JumpinAI-Pitch-Deck-${timestamp}.pdf`;
  pdf.save(fileName);
};