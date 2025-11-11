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

  // Premium investor-focused color palette
  const colors = {
    primary: { r: 30, g: 58, b: 138 },
    secondary: { r: 55, g: 90, b: 127 },
    accent: { r: 59, g: 130, b: 246 },
    heading: { r: 15, g: 23, b: 42 },
    body: { r: 51, g: 65, b: 85 },
    muted: { r: 100, g: 116, b: 139 },
    white: { r: 255, g: 255, b: 255 },
    sectionBg: { r: 248, g: 250, b: 252 },
    border: { r: 226, g: 232, b: 240 },
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
      yPosition = margin;
    }
  };

  const wrapText = (text: string, maxW: number, fontSize: number) => {
    pdf.setFontSize(fontSize);
    return pdf.splitTextToSize(text, maxW);
  };

  // Cover Page
  setFillColor(colors.primary);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Title
  setTextColor(colors.white);
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.text('JumpinAI', pageWidth / 2, pageHeight / 2 - 30, { align: 'center' });

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Your Personalized AI Adaptation Studio', pageWidth / 2, pageHeight / 2 - 15, { align: 'center' });

  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PITCH DECK', pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  pdf.text(currentDate, pageWidth / 2, pageHeight / 2 + 30, { align: 'center' });

  setTextColor({ r: 200, g: 220, b: 255 });
  pdf.setFontSize(10);
  pdf.text('Pre-Seed Investment Opportunity', pageWidth / 2, pageHeight - 30, { align: 'center' });

  // New page for content
  pdf.addPage();
  yPosition = margin;

  // Helper functions
  const addSectionHeader = (title: string) => {
    checkPageBreak(20);
    setFillColor(colors.sectionBg);
    pdf.rect(margin - 5, yPosition - 2, maxWidth + 10, 12, 'F');
    setFillColor(colors.primary);
    pdf.rect(margin - 5, yPosition - 2, 3, 12, 'F');
    setTextColor(colors.heading);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, yPosition + 6);
    yPosition += 18;
  };

  const addParagraph = (text: string, fontSize: number = 9, fontStyle: 'normal' | 'bold' = 'normal') => {
    checkPageBreak(10);
    setTextColor(colors.body);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    const lines = wrapText(text, maxWidth, fontSize);
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * (fontSize * 0.4) + 4;
  };

  const addBullet = (text: string, indent: number = 0) => {
    checkPageBreak(8);
    const bulletX = margin + indent;
    setFillColor(colors.accent);
    pdf.circle(bulletX + 1.5, yPosition - 1.5, 0.8, 'F');
    setTextColor(colors.body);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const lines = wrapText(text, maxWidth - 6 - indent, 9);
    pdf.text(lines, bulletX + 5, yPosition);
    yPosition += lines.length * 3.6 + 2;
  };

  const addHighlightBox = (title: string, content: string) => {
    checkPageBreak(25);
    const boxHeight = 20;
    setFillColor({ r: 241, g: 245, b: 255 });
    pdf.rect(margin, yPosition, maxWidth, boxHeight, 'F');
    setDrawColor(colors.accent);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPosition, maxWidth, boxHeight, 'S');
    setTextColor(colors.primary);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin + 5, yPosition + 7);
    setTextColor(colors.body);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const lines = wrapText(content, maxWidth - 10, 9);
    pdf.text(lines, margin + 5, yPosition + 14);
    yPosition += boxHeight + 5;
  };

  // THE PROBLEM
  addSectionHeader('The Problem');
  addParagraph('The AI revolution has created a paradox: while AI capabilities advance exponentially, actual adoption and successful implementation lag dramatically behind. Organizations and individuals face a fundamental disconnect between AI\'s promise and their ability to harness it effectively.');
  yPosition += 3;

  addParagraph('The Personalization Crisis', 9, 'bold');
  addBullet('Generic AI consulting and cookie-cutter frameworks fundamentally misunderstand the nature of successful transformation.');
  addBullet('78% of AI transformation initiatives fail because the implementation strategy doesn\'t fit the specific organizational reality.');
  yPosition += 2;

  addParagraph('The Implementation Gap', 9, 'bold');
  addBullet('Individuals invest 40+ hours researching AI strategies, yet remain paralyzed at the starting line.');
  addBullet('The market floods users with conceptual frameworks while failing to deliver concrete, personalized, step-by-step guidance.');
  yPosition += 2;

  addParagraph('The Adaptation Void', 9, 'bold');
  addBullet('Traditional solutions offer static documents that become obsolete when reality deviates from assumptions.');
  addBullet('Users are abandoned with outdated plans and no recourse when they most need intelligent guidance.');
  yPosition += 5;

  addHighlightBox('Market Opportunity', '$12.4B AI Education & Transformation Market by 2027');

  // OUR SOLUTION
  pdf.addPage();
  yPosition = margin;
  addSectionHeader('Our Solution');
  addParagraph('JumpinAI is the world\'s first truly adaptive AI transformation platform, delivering complete personalized blueprints in 2 minutes from just 2 questions.', 10, 'bold');
  yPosition += 3;

  addParagraph('The 3-Tab Transformation System', 10, 'bold');
  yPosition += 2;

  checkPageBreak(30);
  setFillColor({ r: 245, g: 247, b: 250 });
  pdf.rect(margin, yPosition, (maxWidth - 4) / 3, 35, 'F');
  pdf.rect(margin + (maxWidth - 4) / 3 + 2, yPosition, (maxWidth - 4) / 3, 35, 'F');
  pdf.rect(margin + 2 * ((maxWidth - 4) / 3 + 2), yPosition, (maxWidth - 4) / 3, 35, 'F');

  setTextColor(colors.primary);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('1. Overview Tab', margin + 3, yPosition + 8);
  pdf.text('2. Adaptive Plan Tab', margin + (maxWidth - 4) / 3 + 5, yPosition + 8);
  pdf.text('3. Tools & Prompts', margin + 2 * ((maxWidth - 4) / 3 + 2) + 3, yPosition + 8);

  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  
  const tab1Text = wrapText('Strategic foundation with analysis, vision, and high-level roadmap', (maxWidth - 4) / 3 - 6, 7.5);
  pdf.text(tab1Text, margin + 3, yPosition + 15);
  
  const tab2Text = wrapText('Step-by-step guidance with 4-level clarification and 3 alternative routes per step', (maxWidth - 4) / 3 - 6, 7.5);
  pdf.text(tab2Text, margin + (maxWidth - 4) / 3 + 5, yPosition + 15);
  
  const tab3Text = wrapText('9 custom tool-prompt combinations, copy-paste ready, with AI Coach access', (maxWidth - 4) / 3 - 6, 7.5);
  pdf.text(tab3Text, margin + 2 * ((maxWidth - 4) / 3 + 2) + 3, yPosition + 15);

  yPosition += 40;

  addParagraph('Key Differentiators', 9, 'bold');
  addBullet('Hyper-personalization at scale using multi-model AI orchestration (xAI as primary choice)');
  addBullet('True adaptability with multi-level clarifications and alternative routes');
  addBullet('Complete transformation in ~2 minutes, not months of consulting');
  addBullet('Ongoing AI Coach for continuous refinement and strategic adjustments');

  // MARKET OPPORTUNITY
  pdf.addPage();
  yPosition = margin;
  addSectionHeader('Market Opportunity');
  
  addParagraph('Explosive Market Growth (November 2025)', 9, 'bold');
  addBullet('$467B+ Global AI Market Size, growing at 37.3% CAGR through 2030');
  addBullet('$15.8B AI Education & Training Market, 46.3% CAGR through 2028');
  addBullet('520M+ Knowledge Workers Globally requiring AI transformation guidance');
  addBullet('92% of Organizations Adopting AI by End of 2025 (up from 84% in early 2025)');
  yPosition += 3;

  addParagraph('Target Segments', 9, 'bold');
  addBullet('Individuals & Entrepreneurs (Primary): Founders, creators, knowledge workers seeking competitive advantage');
  addBullet('Small-Medium Businesses: 1-200 employee companies needing affordable AI transformation');
  addBullet('Enterprise Teams (Future): Scaling AI adoption across departments');
  addBullet('Educational Institutions: Universities preparing students for AI-driven workforce');

  // BUSINESS MODEL
  pdf.addPage();
  yPosition = margin;
  addSectionHeader('Business Model');
  
  addParagraph('Multi-Revenue Stream Strategy', 9, 'bold');
  yPosition += 2;

  addParagraph('Freemium Growth Engine:', 9, 'bold');
  addBullet('3 free Jumps to experience value');
  addBullet('5 welcome credits upon sign up');
  addBullet('Viral acquisition through free tier with high conversion potential');
  yPosition += 2;

  addParagraph('Subscription Tiers ($9–$49/month):', 9, 'bold');
  addBullet('Starter Plan: $9/month — 25 credits monthly');
  addBullet('Pro Plan: $25/month — 100 credits + AI Coach access');
  addBullet('Growth Plan: $49/month — 250 credits + priority support');
  addBullet('1 credit = 1 complete Jump (3-tab transformation blueprint)');
  addBullet('All credits roll over month-to-month and never expire');
  yPosition += 2;

  addParagraph('Credit Packs (One-Time Purchases):', 9, 'bold');
  addBullet('Flexible pay-as-you-go option for occasional users');
  addBullet('No recurring commitments, credits never expire');
  yPosition += 3;

  addParagraph('Future Revenue Streams:', 9, 'bold');
  addBullet('Enterprise Solutions: Team collaboration, white-label, custom integrations');
  addBullet('Premium Resources: Industry-specific templates, advanced analytics, expert consultations');
  yPosition += 3;

  addParagraph('Growth Strategy', 9, 'bold');
  addBullet('Phase 1: Launch — Free tier viral growth, build user base, gather feedback');
  addBullet('Phase 2: Scale — Convert free users to paid, expand features, optimize funnel');
  addBullet('Phase 3: Enterprise — Launch team features, enterprise sales, strategic partnerships');

  // COMPETITIVE ADVANTAGE
  pdf.addPage();
  yPosition = margin;
  addSectionHeader('Competitive Advantage');
  
  addParagraph('Truly Adaptive Personalization', 9, 'bold');
  addParagraph('Unlike competitors offering static templates or one-time assessments, our platform adapts in real-time with multi-level clarifications (4 deep) and alternative routes (3 per step).');
  yPosition += 2;

  addParagraph('Complete Transformation Ecosystem', 9, 'bold');
  addParagraph('The only solution combining strategic overview, adaptive planning, execution tools, and ongoing AI coaching in one integrated platform.');
  yPosition += 2;

  addParagraph('Speed + Simplicity + Depth', 9, 'bold');
  addParagraph('Generate comprehensive 3-tab transformation blueprints in 2 minutes from just 2 questions. No competitor matches this combination.');
  yPosition += 2;

  addParagraph('Scalable AI Architecture', 9, 'bold');
  addParagraph('Our AI engine generates unlimited unique transformations with minimal marginal cost. Traditional consulting scales linearly; our technology enables exponential growth with superior unit economics.');

  // INVESTMENT DETAILS
  pdf.addPage();
  yPosition = margin;
  addSectionHeader('Investment Details');
  
  checkPageBreak(45);
  setFillColor({ r: 240, g: 245, b: 255 });
  pdf.rect(margin, yPosition, maxWidth, 40, 'F');
  setDrawColor(colors.primary);
  pdf.setLineWidth(0.8);
  pdf.rect(margin, yPosition, maxWidth, 40, 'S');

  setTextColor(colors.primary);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Pre-Seed Round', margin + 5, yPosition + 10);

  setTextColor(colors.body);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Raising: $500,000', margin + 5, yPosition + 20);
  pdf.text('Valuation: $2,000,000', margin + 5, yPosition + 27);
  pdf.text('Investor Discount: 20% (Standard)', margin + 5, yPosition + 34);

  yPosition += 45;

  addParagraph('Use of Funds', 9, 'bold');
  addBullet('Product Development (40%): Enhanced AI models, new features, platform optimization');
  addBullet('Marketing & Growth (30%): User acquisition, brand building, strategic partnerships');
  addBullet('Operations & Infrastructure (20%): Cloud infrastructure, security, compliance');
  addBullet('Team Expansion (10%): Key technical and business hires');

  // CONTACT & CLOSING
  pdf.addPage();
  yPosition = pageHeight / 2 - 40;
  
  setTextColor(colors.primary);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Let\'s Build the Future of AI Adoption Together', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;
  setTextColor(colors.body);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Contact Us:', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  pdf.setFontSize(10);
  pdf.text('Email: info@jumpinai.com', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  pdf.text('Website: www.jumpinai.com', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;
  setTextColor(colors.muted);
  pdf.setFontSize(8);
  pdf.text('JumpinAI - Your Personalized AI Adaptation Studio', pageWidth / 2, yPosition, { align: 'center' });

  // Add page numbers
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1) continue; // Skip cover page
    pdf.setPage(i);
    setTextColor(colors.muted);
    pdf.setFontSize(8);
    const pageText = `${i} of ${pageCount}`;
    const pageTextWidth = pdf.getTextWidth(pageText);
    pdf.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 10);
  }

  // Save the PDF
  pdf.save('JumpinAI-Pitch-Deck.pdf');
};