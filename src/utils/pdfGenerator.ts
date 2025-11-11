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
  const margin = 18;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Premium investor-focused color palette - Professional and elegant
  const colors = {
    primary: { r: 30, g: 58, b: 138 },        // Deep professional blue
    primaryLight: { r: 59, g: 130, b: 246 },  // Bright blue accent
    secondary: { r: 55, g: 90, b: 127 },      // Steel blue
    accent: { r: 109, g: 88, b: 249 },        // Vibrant accent
    heading: { r: 15, g: 23, b: 42 },         // Near black
    body: { r: 51, g: 65, b: 85 },            // Professional gray
    muted: { r: 100, g: 116, b: 139 },        // Light gray
    white: { r: 255, g: 255, b: 255 },
    sectionBg: { r: 248, g: 250, b: 252 },    // Very light blue-gray
    cardBg: { r: 245, g: 247, b: 250 },       // Subtle card background
    highlightBg: { r: 241, g: 245, b: 255 },  // Light blue highlight
    border: { r: 226, g: 232, b: 240 },       // Border gray
    success: { r: 34, g: 197, b: 94 },        // Success green
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

  const checkPageBreak = (neededHeight: number) => {
    if (yPosition + neededHeight > pageHeight - 25) {
      pdf.addPage();
      yPosition = margin + 5;
      return true;
    }
    return false;
  };

  const wrapText = (text: string, maxW: number, fontSize: number) => {
    pdf.setFontSize(fontSize);
    return pdf.splitTextToSize(text, maxW);
  };

  // ================== COVER PAGE ==================
  setFillColor(colors.primary);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Elegant top accent line
  setFillColor(colors.primaryLight);
  pdf.rect(0, 0, pageWidth, 2, 'F');

  // Company name - Large and bold
  setTextColor(colors.white);
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'bold');
  pdf.text('JumpinAI', pageWidth / 2, 80, { align: 'center' });

  // Tagline - Elegant
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  setTextColor({ r: 200, g: 220, b: 255 });
  pdf.text('Your Personalized AI Adaptation Studio', pageWidth / 2, 95, { align: 'center' });

  // Divider line
  setDrawColor({ r: 200, g: 220, b: 255 });
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth / 2 - 40, 105, pageWidth / 2 + 40, 105);

  // Main title
  setTextColor(colors.white);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVESTOR PITCH DECK', pageWidth / 2, 140, { align: 'center' });

  // Subtitle
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'normal');
  setTextColor({ r: 200, g: 220, b: 255 });
  pdf.text('Pre-Seed Investment Opportunity', pageWidth / 2, 155, { align: 'center' });

  // Date
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  pdf.setFontSize(11);
  pdf.text(currentDate, pageWidth / 2, pageHeight - 40, { align: 'center' });

  // Footer text
  pdf.setFontSize(9);
  setTextColor({ r: 180, g: 200, b: 235 });
  pdf.text('Confidential & Proprietary', pageWidth / 2, pageHeight - 25, { align: 'center' });

  // ================== NEW PAGE - SETUP CONTENT HELPERS ==================
  pdf.addPage();
  yPosition = margin + 5;

  const addSectionHeader = (title: string) => {
    checkPageBreak(22);
    
    // Background bar
    setFillColor(colors.sectionBg);
    pdf.rect(margin - 8, yPosition - 3, maxWidth + 16, 14, 'F');
    
    // Left accent bar
    setFillColor(colors.primary);
    pdf.rect(margin - 8, yPosition - 3, 3, 14, 'F');
    
    // Title text
    setTextColor(colors.heading);
    pdf.setFontSize(15);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, yPosition + 6);
    
    yPosition += 20;
  };

  const addSubsectionHeader = (title: string, size: number = 11) => {
    checkPageBreak(12);
    setTextColor(colors.heading);
    pdf.setFontSize(size);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, yPosition);
    yPosition += size + 3;
  };

  const addParagraph = (text: string, fontSize: number = 9, fontStyle: 'normal' | 'bold' | 'italic' = 'normal') => {
    checkPageBreak(10);
    setTextColor(colors.body);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    const lines = wrapText(text, maxWidth, fontSize);
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * (fontSize * 0.42) + 4;
  };

  const addBullet = (text: string, fontSize: number = 9, indent: number = 0) => {
    checkPageBreak(10);
    const bulletX = margin + indent;
    
    // Bullet point
    setFillColor(colors.primaryLight);
    pdf.circle(bulletX + 1.5, yPosition - 1.5, 0.9, 'F');
    
    // Text
    setTextColor(colors.body);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    const lines = wrapText(text, maxWidth - 6 - indent, fontSize);
    pdf.text(lines, bulletX + 5, yPosition);
    yPosition += lines.length * (fontSize * 0.42) + 3;
  };

  const addHighlightBox = (title: string, value: string, subtitle?: string) => {
    checkPageBreak(28);
    
    // Box background with gradient effect
    setFillColor(colors.highlightBg);
    pdf.rect(margin, yPosition, maxWidth, 22, 'F');
    
    // Border
    setDrawColor(colors.primaryLight);
    pdf.setLineWidth(0.6);
    pdf.rect(margin, yPosition, maxWidth, 22, 'S');
    
    // Title
    setTextColor(colors.primary);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin + 5, yPosition + 8);
    
    // Value
    setTextColor(colors.heading);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, margin + 5, yPosition + 16);
    
    // Subtitle if provided
    if (subtitle) {
      setTextColor(colors.muted);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(subtitle, margin + 5, yPosition + 20);
    }
    
    yPosition += 26;
  };

  const addMetricCard = (label: string, value: string, x: number, y: number, width: number) => {
    // Card background
    setFillColor(colors.cardBg);
    pdf.rect(x, y, width, 18, 'F');
    
    // Border
    setDrawColor(colors.border);
    pdf.setLineWidth(0.4);
    pdf.rect(x, y, width, 18, 'S');
    
    // Label
    setTextColor(colors.muted);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text(label, x + width / 2, y + 6, { align: 'center' });
    
    // Value
    setTextColor(colors.primary);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, x + width / 2, y + 14, { align: 'center' });
  };

  // ================== THE PROBLEM ==================
  addSectionHeader('The Problem');
  
  addParagraph('The AI revolution has created a paradox: while AI capabilities advance exponentially, actual adoption and successful implementation lag dramatically behind. Organizations and individuals face a fundamental disconnect between AI\'s promise and their ability to harness it effectively.', 9.5);
  yPosition += 3;

  // Problem cards - 3 columns
  checkPageBreak(65);
  const cardWidth = (maxWidth - 8) / 3;
  const cardHeight = 58;
  const startY = yPosition;

  // Card 1: Personalization Crisis
  setFillColor(colors.cardBg);
  pdf.rect(margin, startY, cardWidth, cardHeight, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, startY, cardWidth, cardHeight, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Personalization Crisis', margin + cardWidth / 2, startY + 7, { align: 'center' });
  
  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const crisis1 = wrapText('Generic AI consulting and cookie-cutter frameworks fundamentally misunderstand successful transformation. Every organization operates within unique constraints.', cardWidth - 6, 7.5);
  pdf.text(crisis1, margin + 3, startY + 15);
  
  setTextColor(colors.primary);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('78% of AI initiatives fail', margin + cardWidth / 2, startY + 48, { align: 'center' });
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('due to poor personalization', margin + cardWidth / 2, startY + 54, { align: 'center' });

  // Card 2: Implementation Gap
  setFillColor(colors.cardBg);
  pdf.rect(margin + cardWidth + 4, startY, cardWidth, cardHeight, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin + cardWidth + 4, startY, cardWidth, cardHeight, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Implementation Gap', margin + cardWidth + 4 + cardWidth / 2, startY + 7, { align: 'center' });
  
  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const crisis2 = wrapText('People invest 40+ hours researching AI strategies, yet remain paralyzed at the starting line. The market floods users with concepts while failing to deliver actionable guidance.', cardWidth - 6, 7.5);
  pdf.text(crisis2, margin + cardWidth + 4 + 3, startY + 15);
  
  setTextColor(colors.primary);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('40+ hours wasted', margin + cardWidth + 4 + cardWidth / 2, startY + 48, { align: 'center' });
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('without actionable results', margin + cardWidth + 4 + cardWidth / 2, startY + 54, { align: 'center' });

  // Card 3: Adaptation Void
  setFillColor(colors.cardBg);
  pdf.rect(margin + 2 * (cardWidth + 4), startY, cardWidth, cardHeight, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin + 2 * (cardWidth + 4), startY, cardWidth, cardHeight, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Adaptation Void', margin + 2 * (cardWidth + 4) + cardWidth / 2, startY + 7, { align: 'center' });
  
  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const crisis3 = wrapText('Traditional solutions offer static documents that become obsolete when reality deviates from assumptions. Users are abandoned when they most need intelligent guidance.', cardWidth - 6, 7.5);
  pdf.text(crisis3, margin + 2 * (cardWidth + 4) + 3, startY + 15);
  
  setTextColor(colors.primary);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Static plans fail', margin + 2 * (cardWidth + 4) + cardWidth / 2, startY + 48, { align: 'center' });
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('when obstacles arise', margin + 2 * (cardWidth + 4) + cardWidth / 2, startY + 54, { align: 'center' });

  yPosition += cardHeight + 8;

  // Market Opportunity highlight
  addHighlightBox('Market Opportunity', '$12.4B AI Education & Transformation Market by 2027', 'Millions desperately need a solution bridging AI\'s potential and their ability to realize it');

  // ================== OUR SOLUTION ==================
  pdf.addPage();
  yPosition = margin + 5;
  addSectionHeader('Our Solution');
  
  addParagraph('JumpinAI is the world\'s first truly adaptive AI transformation platform, delivering complete personalized blueprints in 2 minutes from just 2 questions.', 10, 'bold');
  yPosition += 2;

  addSubsectionHeader('The 3-Tab Transformation System', 10);
  yPosition += 2;

  // 3-Tab visual cards
  checkPageBreak(48);
  const tabWidth = (maxWidth - 8) / 3;
  const tabHeight = 42;
  const tabY = yPosition;

  // Tab 1: Overview
  setFillColor(colors.cardBg);
  pdf.rect(margin, tabY, tabWidth, tabHeight, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, tabY, tabWidth, tabHeight, 'S');
  
  // Tab number circle
  setFillColor(colors.primary);
  pdf.circle(margin + 8, tabY + 8, 4, 'F');
  setTextColor(colors.white);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('1', margin + 7, tabY + 10);
  
  setTextColor(colors.heading);
  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overview Tab', margin + tabWidth / 2, tabY + 20, { align: 'center' });
  
  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  const tab1Text = wrapText('Strategic foundation with current situation analysis, vision & objectives, and high-level roadmap', tabWidth - 6, 7);
  pdf.text(tab1Text, margin + 3, tabY + 27);

  // Tab 2: Adaptive Plan
  setFillColor(colors.cardBg);
  pdf.rect(margin + tabWidth + 4, tabY, tabWidth, tabHeight, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.5);
  pdf.rect(margin + tabWidth + 4, tabY, tabWidth, tabHeight, 'S');
  
  setFillColor(colors.primary);
  pdf.circle(margin + tabWidth + 4 + 8, tabY + 8, 4, 'F');
  setTextColor(colors.white);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('2', margin + tabWidth + 4 + 7, tabY + 10);
  
  setTextColor(colors.heading);
  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Adaptive Plan Tab', margin + tabWidth + 4 + tabWidth / 2, tabY + 20, { align: 'center' });
  
  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  const tab2Text = wrapText('Step-by-step guidance with 4-level clarification for granular details and 3 alternative routes to pivot when obstacles arise', tabWidth - 6, 7);
  pdf.text(tab2Text, margin + tabWidth + 4 + 3, tabY + 27);

  // Tab 3: Tools & Prompts
  setFillColor(colors.cardBg);
  pdf.rect(margin + 2 * (tabWidth + 4), tabY, tabWidth, tabHeight, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.5);
  pdf.rect(margin + 2 * (tabWidth + 4), tabY, tabWidth, tabHeight, 'S');
  
  setFillColor(colors.primary);
  pdf.circle(margin + 2 * (tabWidth + 4) + 8, tabY + 8, 4, 'F');
  setTextColor(colors.white);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('3', margin + 2 * (tabWidth + 4) + 7, tabY + 10);
  
  setTextColor(colors.heading);
  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tools & Prompts', margin + 2 * (tabWidth + 4) + tabWidth / 2, tabY + 20, { align: 'center' });
  
  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  const tab3Text = wrapText('9 custom tool-prompt combinations, copy-paste ready, with AI Coach access for ongoing guidance', tabWidth - 6, 7);
  pdf.text(tab3Text, margin + 2 * (tabWidth + 4) + 3, tabY + 27);

  yPosition += tabHeight + 8;

  // Key Differentiators
  addSubsectionHeader('Key Differentiators', 10);
  addBullet('Hyper-personalization at scale using multi-model AI orchestration (xAI as primary choice, supplemented by ChatGPT-5, Claude, and Gemini)', 8.5);
  addBullet('True adaptability with multi-level clarifications and alternative routes—no static templates', 8.5);
  addBullet('Complete transformation in ~2 minutes, not months of expensive consulting', 8.5);
  addBullet('Ongoing AI Coach for continuous refinement and strategic adjustments post-generation', 8.5);

  // ================== MARKET OPPORTUNITY ==================
  pdf.addPage();
  yPosition = margin + 5;
  addSectionHeader('Market Opportunity');
  
  addSubsectionHeader('Explosive Market Growth (November 2025)', 10);
  yPosition += 2;

  // Market metrics - Grid layout
  checkPageBreak(50);
  const metricCardWidth = (maxWidth - 4) / 2;
  const metricStartY = yPosition;
  
  addMetricCard('Global AI Market', '$467B+', margin, metricStartY, metricCardWidth);
  addMetricCard('AI Education Market', '$15.8B', margin + metricCardWidth + 4, metricStartY, metricCardWidth);
  
  yPosition += 20;
  
  addMetricCard('Knowledge Workers', '520M+', margin, yPosition, metricCardWidth);
  addMetricCard('Organizations Adopting AI', '92%', margin + metricCardWidth + 4, yPosition, metricCardWidth);
  
  yPosition += 22;

  // Additional context bullets
  addBullet('Global AI Market growing at 37.3% CAGR through 2030 (Fortune Business Insights, Nov 2025)', 8);
  addBullet('AI Education Market expanding at 46.3% CAGR through 2028 (MarketsandMarkets, Nov 2025)', 8);
  addBullet('520M+ Knowledge Workers globally all requiring AI transformation guidance', 8);
  addBullet('92% of organizations adopting AI by end of 2025, up from 84% in early 2025 (Gartner, Nov 2025)', 8);
  yPosition += 4;

  // Target Segments
  addSubsectionHeader('Target Segments', 10);
  yPosition += 2;
  
  checkPageBreak(45);
  const segmentHeight = 21;
  
  // Segment 1: Individuals & Entrepreneurs
  setFillColor(colors.cardBg);
  pdf.rect(margin, yPosition, maxWidth, segmentHeight, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, maxWidth, segmentHeight, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Individuals & Entrepreneurs (Primary)', margin + 3, yPosition + 6);
  
  setTextColor(colors.body);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Founders, creators, and knowledge workers seeking personal AI upskilling and competitive advantage', margin + 3, yPosition + 12);
  
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Immediate monetization through subscription and credit sales', margin + 3, yPosition + 18);
  
  yPosition += segmentHeight + 3;

  // Segment 2: Small-Medium Businesses
  setFillColor(colors.cardBg);
  pdf.rect(margin, yPosition, maxWidth, segmentHeight, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, maxWidth, segmentHeight, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Small-Medium Businesses', margin + 3, yPosition + 6);
  
  setTextColor(colors.body);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('1-200 employee companies needing affordable AI transformation without expensive consultants', margin + 3, yPosition + 12);
  
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('High-value segment with team subscription potential', margin + 3, yPosition + 18);
  
  yPosition += segmentHeight + 3;

  // Segment 3: Enterprise Teams
  setFillColor(colors.cardBg);
  pdf.rect(margin, yPosition, maxWidth, segmentHeight, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, maxWidth, segmentHeight, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Enterprise Teams (Future)', margin + 3, yPosition + 6);
  
  setTextColor(colors.body);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Scaling AI adoption across departments with team collaboration features', margin + 3, yPosition + 12);
  
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Largest revenue opportunity through enterprise licensing', margin + 3, yPosition + 18);
  
  yPosition += segmentHeight + 5;

  // Market timing highlight
  checkPageBreak(15);
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
  pdf.text('AI adoption urgency at all-time high following ChatGPT\'s mainstream breakthrough', margin + 24, yPosition + 5);
  pdf.text('and enterprise AI transformation mandates', margin + 3, yPosition + 9);
  
  yPosition += 14;

  // ================== BUSINESS MODEL ==================
  pdf.addPage();
  yPosition = margin + 5;
  addSectionHeader('Business Model');

  addSubsectionHeader('Multi-Revenue Stream Strategy', 10);
  yPosition += 3;

  // Freemium
  checkPageBreak(28);
  setFillColor(colors.cardBg);
  pdf.rect(margin, yPosition, maxWidth, 26, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, maxWidth, 26, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Freemium Growth Engine', margin + 3, yPosition + 6);
  
  setTextColor(colors.muted);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Viral acquisition with low CAC', margin + 3, yPosition + 11);
  
  setTextColor(colors.body);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• 3 free Jumps to experience value', margin + 3, yPosition + 16);
  pdf.text('• 5 welcome credits upon sign up', margin + 3, yPosition + 20);
  pdf.text('• Product-led growth with high conversion potential', margin + 3, yPosition + 24);
  
  yPosition += 28;

  // Subscription Tiers
  checkPageBreak(38);
  setFillColor(colors.cardBg);
  pdf.rect(margin, yPosition, maxWidth, 36, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, maxWidth, 36, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Subscription Tiers', margin + 3, yPosition + 6);
  
  setTextColor(colors.primary);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('$9–$49/month', margin + 38, yPosition + 6);
  
  setTextColor(colors.body);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Starter Plan: $9/month — 25 credits monthly', margin + 3, yPosition + 13);
  pdf.text('• Pro Plan: $25/month — 100 credits + AI Coach access', margin + 3, yPosition + 17);
  pdf.text('• Growth Plan: $49/month — 250 credits + priority support', margin + 3, yPosition + 21);
  pdf.text('• 1 credit = 1 complete Jump (3-tab transformation blueprint)', margin + 3, yPosition + 25);
  pdf.text('• All credits roll over month-to-month and never expire', margin + 3, yPosition + 29);
  
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Recurring revenue with strong retention', margin + 3, yPosition + 34);
  
  yPosition += 38;

  // Credit Packs
  checkPageBreak(22);
  setFillColor(colors.cardBg);
  pdf.rect(margin, yPosition, maxWidth, 20, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, maxWidth, 20, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Credit Packs (One-Time Purchases)', margin + 3, yPosition + 6);
  
  setTextColor(colors.body);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Flexible pay-as-you-go option for occasional users', margin + 3, yPosition + 12);
  pdf.text('• No recurring commitments, credits never expire', margin + 3, yPosition + 16);
  
  yPosition += 26;

  // Future Revenue Streams
  addSubsectionHeader('Future Revenue Streams', 9.5);
  yPosition += 3;
  
  const futureCardWidth = (maxWidth - 4) / 2;
  const futureY = yPosition;
  
  setFillColor(colors.cardBg);
  pdf.rect(margin, futureY, futureCardWidth, 22, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, futureY, futureCardWidth, 22, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Enterprise Solutions', margin + 3, futureY + 6);
  
  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const enterprise = wrapText('Team collaboration, white-label, custom integrations, and dedicated support for organizations', futureCardWidth - 6, 7.5);
  pdf.text(enterprise, margin + 3, futureY + 11);
  
  setFillColor(colors.cardBg);
  pdf.rect(margin + futureCardWidth + 4, futureY, futureCardWidth, 22, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin + futureCardWidth + 4, futureY, futureCardWidth, 22, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Premium Resources', margin + futureCardWidth + 4 + 3, futureY + 6);
  
  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const premium = wrapText('Industry-specific templates, advanced analytics, expert consultations, and exclusive AI transformation guides', futureCardWidth - 6, 7.5);
  pdf.text(premium, margin + futureCardWidth + 4 + 3, futureY + 11);
  
  yPosition += 28;

  // Growth Strategy - Keep title and content together
  checkPageBreak(82); // Ensure title + all 3 phase cards stay together
  addSubsectionHeader('Growth Strategy', 10);
  yPosition += 4;

  // Phase cards
  const phaseWidth = (maxWidth - 8) / 3;
  const phaseHeight = 58;
  const phaseY = yPosition;

  // Phase 1
  setFillColor(colors.cardBg);
  pdf.rect(margin, phaseY, phaseWidth, phaseHeight, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, phaseY, phaseWidth, phaseHeight, 'S');
  
  setTextColor(colors.primary);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Phase 1', margin + phaseWidth / 2, phaseY + 6, { align: 'center' });
  
  setTextColor(colors.heading);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Launch & Validation', margin + phaseWidth / 2, phaseY + 12, { align: 'center' });
  
  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Viral freemium growth', margin + 3, phaseY + 20);
  pdf.text('• Product-led growth', margin + 3, phaseY + 25);
  pdf.text('• Rapid iteration', margin + 3, phaseY + 30);
  pdf.text('• Build community', margin + 3, phaseY + 35);
  pdf.text('• Content marketing', margin + 3, phaseY + 40);
  pdf.text('• Thought leadership', margin + 3, phaseY + 45);

  // Phase 2
  setFillColor(colors.cardBg);
  pdf.rect(margin + phaseWidth + 4, phaseY, phaseWidth, phaseHeight, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.5);
  pdf.rect(margin + phaseWidth + 4, phaseY, phaseWidth, phaseHeight, 'S');
  
  setTextColor(colors.primary);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Phase 2', margin + phaseWidth + 4 + phaseWidth / 2, phaseY + 6, { align: 'center' });
  
  setTextColor(colors.heading);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Scale & Monetization', margin + phaseWidth + 4 + phaseWidth / 2, phaseY + 12, { align: 'center' });
  
  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Optimize funnel', margin + phaseWidth + 4 + 3, phaseY + 20);
  pdf.text('• Content marketing', margin + phaseWidth + 4 + 3, phaseY + 25);
  pdf.text('• SEO dominance', margin + phaseWidth + 4 + 3, phaseY + 30);
  pdf.text('• Influencer partnerships', margin + phaseWidth + 4 + 3, phaseY + 35);
  pdf.text('• Paid acquisition', margin + phaseWidth + 4 + 3, phaseY + 40);
  pdf.text('• Strategic partnerships', margin + phaseWidth + 4 + 3, phaseY + 45);

  // Phase 3
  setFillColor(colors.cardBg);
  pdf.rect(margin + 2 * (phaseWidth + 4), phaseY, phaseWidth, phaseHeight, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.5);
  pdf.rect(margin + 2 * (phaseWidth + 4), phaseY, phaseWidth, phaseHeight, 'S');
  
  setTextColor(colors.primary);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Phase 3', margin + 2 * (phaseWidth + 4) + phaseWidth / 2, phaseY + 6, { align: 'center' });
  
  setTextColor(colors.heading);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Enterprise & Expansion', margin + 2 * (phaseWidth + 4) + phaseWidth / 2, phaseY + 12, { align: 'center' });
  
  setTextColor(colors.body);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Team collaboration', margin + 2 * (phaseWidth + 4) + 3, phaseY + 20);
  pdf.text('• Enterprise sales', margin + 2 * (phaseWidth + 4) + 3, phaseY + 25);
  pdf.text('• Mobile app release', margin + 2 * (phaseWidth + 4) + 3, phaseY + 30);
  pdf.text('• B2B partnerships', margin + 2 * (phaseWidth + 4) + 3, phaseY + 35);
  pdf.text('• API partnerships', margin + 2 * (phaseWidth + 4) + 3, phaseY + 40);
  pdf.text('• International expansion', margin + 2 * (phaseWidth + 4) + 3, phaseY + 45);
  pdf.text('• White-label solutions', margin + 2 * (phaseWidth + 4) + 3, phaseY + 50);

  yPosition += phaseHeight + 5;

  // ================== PROJECTIONS ==================
  pdf.addPage();
  yPosition = margin + 5;
  addSectionHeader('Projections');

  addParagraph('Conservative estimates based on comparable SaaS benchmarks, freemium conversion rates, and our unique market positioning as a pre-launch platform.', 8.5, 'italic');
  yPosition += 3;

  // Year cards - 3 columns
  checkPageBreak(75);
  const yearWidth = (maxWidth - 8) / 3;
  const yearHeight = 62;
  const yearY = yPosition;

  // Year 1
  setFillColor(colors.cardBg);
  pdf.rect(margin, yearY, yearWidth, yearHeight, 'F');
  setDrawColor(colors.primary);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, yearY, yearWidth, yearHeight, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Year 1', margin + yearWidth / 2, yearY + 7, { align: 'center' });
  
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Launch & Growth', margin + yearWidth / 2, yearY + 12, { align: 'center' });
  
  // Metric boxes within card
  setFillColor(colors.highlightBg);
  pdf.rect(margin + 3, yearY + 17, yearWidth - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.text('Users', margin + yearWidth / 2, yearY + 21, { align: 'center' });
  setTextColor(colors.primary);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('15,000', margin + yearWidth / 2, yearY + 27, { align: 'center' });
  
  setFillColor(colors.highlightBg);
  pdf.rect(margin + 3, yearY + 31, yearWidth - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Paying Customers', margin + yearWidth / 2, yearY + 35, { align: 'center' });
  setTextColor(colors.primary);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('750', margin + yearWidth / 2, yearY + 41, { align: 'center' });
  
  setFillColor(colors.highlightBg);
  pdf.rect(margin + 3, yearY + 45, yearWidth - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Annual Revenue', margin + yearWidth / 2, yearY + 49, { align: 'center' });
  setTextColor(colors.success);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('$180K', margin + yearWidth / 2, yearY + 55, { align: 'center' });

  // Year 2
  setFillColor(colors.cardBg);
  pdf.rect(margin + yearWidth + 4, yearY, yearWidth, yearHeight, 'F');
  setDrawColor(colors.primary);
  pdf.setLineWidth(0.5);
  pdf.rect(margin + yearWidth + 4, yearY, yearWidth, yearHeight, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Year 2', margin + yearWidth + 4 + yearWidth / 2, yearY + 7, { align: 'center' });
  
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Scale & Optimize', margin + yearWidth + 4 + yearWidth / 2, yearY + 12, { align: 'center' });
  
  setFillColor(colors.highlightBg);
  pdf.rect(margin + yearWidth + 4 + 3, yearY + 17, yearWidth - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Users', margin + yearWidth + 4 + yearWidth / 2, yearY + 21, { align: 'center' });
  setTextColor(colors.primary);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('75,000', margin + yearWidth + 4 + yearWidth / 2, yearY + 27, { align: 'center' });
  
  setFillColor(colors.highlightBg);
  pdf.rect(margin + yearWidth + 4 + 3, yearY + 31, yearWidth - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Paying Customers', margin + yearWidth + 4 + yearWidth / 2, yearY + 35, { align: 'center' });
  setTextColor(colors.primary);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('5,250', margin + yearWidth + 4 + yearWidth / 2, yearY + 41, { align: 'center' });
  
  setFillColor(colors.highlightBg);
  pdf.rect(margin + yearWidth + 4 + 3, yearY + 45, yearWidth - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Annual Revenue', margin + yearWidth + 4 + yearWidth / 2, yearY + 49, { align: 'center' });
  setTextColor(colors.success);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('$1.4M', margin + yearWidth + 4 + yearWidth / 2, yearY + 55, { align: 'center' });

  // Year 3
  setFillColor(colors.cardBg);
  pdf.rect(margin + 2 * (yearWidth + 4), yearY, yearWidth, yearHeight, 'F');
  setDrawColor(colors.primary);
  pdf.setLineWidth(0.5);
  pdf.rect(margin + 2 * (yearWidth + 4), yearY, yearWidth, yearHeight, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Year 3', margin + 2 * (yearWidth + 4) + yearWidth / 2, yearY + 7, { align: 'center' });
  
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Enterprise Entry', margin + 2 * (yearWidth + 4) + yearWidth / 2, yearY + 12, { align: 'center' });
  
  setFillColor(colors.highlightBg);
  pdf.rect(margin + 2 * (yearWidth + 4) + 3, yearY + 17, yearWidth - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Users', margin + 2 * (yearWidth + 4) + yearWidth / 2, yearY + 21, { align: 'center' });
  setTextColor(colors.primary);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('250,000', margin + 2 * (yearWidth + 4) + yearWidth / 2, yearY + 27, { align: 'center' });
  
  setFillColor(colors.highlightBg);
  pdf.rect(margin + 2 * (yearWidth + 4) + 3, yearY + 31, yearWidth - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Paying Customers', margin + 2 * (yearWidth + 4) + yearWidth / 2, yearY + 35, { align: 'center' });
  setTextColor(colors.primary);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('22,500', margin + 2 * (yearWidth + 4) + yearWidth / 2, yearY + 41, { align: 'center' });
  
  setFillColor(colors.highlightBg);
  pdf.rect(margin + 2 * (yearWidth + 4) + 3, yearY + 45, yearWidth - 6, 12, 'F');
  setTextColor(colors.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Annual Revenue', margin + 2 * (yearWidth + 4) + yearWidth / 2, yearY + 49, { align: 'center' });
  setTextColor(colors.success);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('$6.2M', margin + 2 * (yearWidth + 4) + yearWidth / 2, yearY + 55, { align: 'center' });

  yPosition += yearHeight + 6;

  // Key Assumptions & Growth Drivers - 2 columns
  addSubsectionHeader('Key Assumptions & Growth Drivers', 9.5);
  yPosition += 2;

  checkPageBreak(48);
  const assumptionWidth = (maxWidth - 4) / 2;
  const assumptionY = yPosition;
  
  // Key Assumptions
  setFillColor(colors.cardBg);
  pdf.rect(margin, assumptionY, assumptionWidth, 42, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, assumptionY, assumptionWidth, 42, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Key Assumptions', margin + 3, assumptionY + 6);
  
  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Average subscription: $20/mo', margin + 3, assumptionY + 13);
  pdf.text('  (blended across tiers)', margin + 3, assumptionY + 17);
  pdf.text('• Conservative 5-9% freemium', margin + 3, assumptionY + 22);
  pdf.text('  conversion rate', margin + 3, assumptionY + 26);
  pdf.text('• 85% annual retention rate for', margin + 3, assumptionY + 31);
  pdf.text('  paid users', margin + 3, assumptionY + 35);
  pdf.text('• Additional revenue from credit', margin + 3, assumptionY + 40);
  
  // Growth Drivers
  setFillColor(colors.cardBg);
  pdf.rect(margin + assumptionWidth + 4, assumptionY, assumptionWidth, 42, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin + assumptionWidth + 4, assumptionY, assumptionWidth, 42, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Growth Drivers', margin + assumptionWidth + 4 + 3, assumptionY + 6);
  
  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('• Product-led growth with viral', margin + assumptionWidth + 4 + 3, assumptionY + 13);
  pdf.text('  freemium tier', margin + assumptionWidth + 4 + 3, assumptionY + 17);
  pdf.text('• Content marketing and SEO', margin + assumptionWidth + 4 + 3, assumptionY + 22);
  pdf.text('  positioning', margin + assumptionWidth + 4 + 3, assumptionY + 26);
  pdf.text('• Native mobile apps on iOS', margin + assumptionWidth + 4 + 3, assumptionY + 31);
  pdf.text('  and Android', margin + assumptionWidth + 4 + 3, assumptionY + 35);
  pdf.text('• Strategic partnerships and', margin + assumptionWidth + 4 + 3, assumptionY + 40);
  
  yPosition += 45;

  // ================== COMPETITIVE ADVANTAGE ==================
  pdf.addPage();
  yPosition = margin + 5;
  addSectionHeader('Competitive Advantage');

  // 4 advantage cards in 2x2 grid
  checkPageBreak(90);
  const advCardWidth = (maxWidth - 4) / 2;
  const advCardHeight = 40;
  let advY = yPosition;

  // Card 1: Truly Adaptive Personalization
  setFillColor(colors.cardBg);
  pdf.rect(margin, advY, advCardWidth, advCardHeight, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, advY, advCardWidth, advCardHeight, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Truly Adaptive Personalization', margin + 3, advY + 7);
  
  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const adv1 = wrapText('Unlike competitors offering static templates or one-time assessments, our platform adapts in real-time with multi-level clarifications (4 deep) and alternative routes (3 per step). Every Jump is uniquely tailored to specific context, goals, and constraints.', advCardWidth - 6, 7.5);
  pdf.text(adv1, margin + 3, advY + 14);

  // Card 2: Complete Transformation Ecosystem
  setFillColor(colors.cardBg);
  pdf.rect(margin + advCardWidth + 4, advY, advCardWidth, advCardHeight, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.5);
  pdf.rect(margin + advCardWidth + 4, advY, advCardWidth, advCardHeight, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Complete Transformation Ecosystem', margin + advCardWidth + 4 + 3, advY + 7);
  
  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const adv2 = wrapText('We\'re the only solution combining strategic overview, adaptive planning, execution tools, and ongoing AI coaching in one integrated platform. Competitors offer pieces; we deliver the complete journey from insight to implementation.', advCardWidth - 6, 7.5);
  pdf.text(adv2, margin + advCardWidth + 4 + 3, advY + 14);

  advY += advCardHeight + 4;

  // Card 3: Speed + Simplicity + Depth
  setFillColor(colors.cardBg);
  pdf.rect(margin, advY, advCardWidth, advCardHeight, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.5);
  pdf.rect(margin, advY, advCardWidth, advCardHeight, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Speed + Simplicity + Depth', margin + 3, advY + 7);
  
  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const adv3 = wrapText('Generate comprehensive 3-tab transformation blueprints in 2 minutes from just 2 questions. No competitor matches this combination of speed, ease-of-use, and depth of personalization. We\'ve cracked the code on making sophistication simple.', advCardWidth - 6, 7.5);
  pdf.text(adv3, margin + 3, advY + 14);

  // Card 4: Scalable AI Architecture
  setFillColor(colors.cardBg);
  pdf.rect(margin + advCardWidth + 4, advY, advCardWidth, advCardHeight, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.5);
  pdf.rect(margin + advCardWidth + 4, advY, advCardWidth, advCardHeight, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Scalable AI Architecture', margin + advCardWidth + 4 + 3, advY + 7);
  
  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const adv4 = wrapText('Our AI engine generates unlimited unique transformations with minimal marginal cost. Traditional consulting scales linearly; our technology enables exponential growth with superior unit economics and defensible moats through network effects.', advCardWidth - 6, 7.5);
  pdf.text(adv4, margin + advCardWidth + 4 + 3, advY + 14);

  yPosition = advY + advCardHeight + 6;

  // Strategic Position highlight
  checkPageBreak(28);
  setFillColor(colors.highlightBg);
  pdf.rect(margin, yPosition, maxWidth, 24, 'F');
  setDrawColor(colors.primary);
  pdf.setLineWidth(0.6);
  pdf.rect(margin, yPosition, maxWidth, 24, 'S');
  
  setTextColor(colors.primary);
  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Our Strategic Position', margin + maxWidth / 2, yPosition + 7, { align: 'center' });
  
  setTextColor(colors.body);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  const stratPos = wrapText('We\'re first-to-market with adaptive AI transformation at scale. Our technology creates compounding advantages: every Jump improves our AI, every user interaction strengthens our network effects, and our data moat deepens daily. As the market matures, we\'ll be established with millions of transformation journeys powering a defensible platform.', maxWidth - 10, 8);
  pdf.text(stratPos, margin + 5, yPosition + 13);
  
  yPosition += 28;

  // ================== TEAM ==================
  pdf.addPage();
  yPosition = margin + 5;
  addSectionHeader('Our Team');

  addParagraph('Lean, focused team with complementary expertise in AI, product development, and market strategy', 9, 'italic');
  yPosition += 4;

  // Team cards - 3 columns
  checkPageBreak(42);
  const teamWidth = (maxWidth - 8) / 3;
  const teamHeight = 38;
  const teamY = yPosition;

  // Technical Leadership
  setFillColor(colors.cardBg);
  pdf.rect(margin, teamY, teamWidth, teamHeight, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, teamY, teamWidth, teamHeight, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Technical Leadership', margin + teamWidth / 2, teamY + 8, { align: 'center' });
  
  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const tech = wrapText('Deep expertise in AI systems architecture, LLM orchestration, and scalable platform development with proven track record', teamWidth - 6, 7.5);
  pdf.text(tech, margin + 3, teamY + 16);

  // Product & Design
  setFillColor(colors.cardBg);
  pdf.rect(margin + teamWidth + 4, teamY, teamWidth, teamHeight, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin + teamWidth + 4, teamY, teamWidth, teamHeight, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Product & Design', margin + teamWidth + 4 + teamWidth / 2, teamY + 8, { align: 'center' });
  
  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const product = wrapText('Experience building intuitive, user-centered products with focus on simplifying complex technical capabilities', teamWidth - 6, 7.5);
  pdf.text(product, margin + teamWidth + 4 + 3, teamY + 16);

  // Strategy & Growth
  setFillColor(colors.cardBg);
  pdf.rect(margin + 2 * (teamWidth + 4), teamY, teamWidth, teamHeight, 'F');
  setDrawColor(colors.border);
  pdf.setLineWidth(0.4);
  pdf.rect(margin + 2 * (teamWidth + 4), teamY, teamWidth, teamHeight, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Strategy & Growth', margin + 2 * (teamWidth + 4) + teamWidth / 2, teamY + 8, { align: 'center' });
  
  setTextColor(colors.body);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const strategy = wrapText('Background in go-to-market strategy, business development, and scaling early-stage technology companies', teamWidth - 6, 7.5);
  pdf.text(strategy, margin + 2 * (teamWidth + 4) + 3, teamY + 16);

  yPosition += teamHeight + 6;

  // Commitment highlight
  checkPageBreak(16);
  setFillColor(colors.highlightBg);
  pdf.rect(margin, yPosition, maxWidth, 14, 'F');
  setDrawColor(colors.primaryLight);
  pdf.setLineWidth(0.4);
  pdf.rect(margin, yPosition, maxWidth, 14, 'S');
  
  setTextColor(colors.heading);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Commitment:', margin + 3, yPosition + 6);
  
  setTextColor(colors.body);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Dedicated full-time to building the category-defining platform for personalized AI transformation', margin + 22, yPosition + 6);
  
  yPosition += 18;

  // ================== USE OF FUNDS ==================
  addSectionHeader('Use of Funds');
  yPosition += 2;

  // Allocation bars with percentages
  checkPageBreak(62);
  const allocations = [
    { label: 'Product Development', percentage: 40, color: colors.primary },
    { label: 'Customer Acquisition', percentage: 30, color: colors.primaryLight },
    { label: 'Team Expansion', percentage: 20, color: colors.accent },
    { label: 'Operations & Infrastructure', percentage: 10, color: colors.secondary }
  ];

  allocations.forEach((alloc, index) => {
    // Label and percentage
    setTextColor(colors.heading);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text(alloc.label, margin, yPosition + 5);
    
    setTextColor(colors.primary);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    const percentText = `${alloc.percentage}%`;
    const percentWidth = pdf.getTextWidth(percentText);
    pdf.text(percentText, margin + maxWidth - percentWidth, yPosition + 5);
    
    // Progress bar background
    setFillColor({ r: 240, g: 242, b: 245 });
    pdf.rect(margin, yPosition + 8, maxWidth, 4, 'F');
    
    // Progress bar fill
    setFillColor(alloc.color);
    pdf.rect(margin, yPosition + 8, (maxWidth * alloc.percentage) / 100, 4, 'F');
    
    yPosition += 14;
  });

  yPosition += 4;

  // Key Milestones
  addSubsectionHeader('Key Milestones (12-Month Roadmap)', 9.5);
  yPosition += 3;

  const milestones = [
    { quarter: 'Q1', title: 'Launch Enterprise Features', desc: 'Team collaboration, SSO, advanced analytics' },
    { quarter: 'Q2', title: 'Mobile App Launch & Scale to 100K Users', desc: 'Release native apps on iOS and Android; aggressive growth marketing' },
    { quarter: 'Q3', title: 'International Expansion', desc: 'Multi-language support, regional customization' },
    { quarter: 'Q4', title: 'API & Integration Platform', desc: 'Enable third-party integrations and ecosystem' }
  ];

  milestones.forEach((milestone) => {
    checkPageBreak(20);
    
    setFillColor(colors.cardBg);
    pdf.rect(margin, yPosition, maxWidth, 16, 'F');
    setDrawColor(colors.border);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, yPosition, maxWidth, 16, 'S');
    
    // Quarter badge
    setFillColor(colors.primary);
    pdf.circle(margin + 7, yPosition + 8, 3.5, 'F');
    
    setTextColor(colors.white);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text(milestone.quarter, margin + 5, yPosition + 9.5);
    
    // Title
    setTextColor(colors.heading);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text(milestone.title, margin + 15, yPosition + 7);
    
    // Description
    setTextColor(colors.body);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text(milestone.desc, margin + 15, yPosition + 12);
    
    yPosition += 18;
  });

  // ================== INVESTMENT OPPORTUNITY ==================
  pdf.addPage();
  yPosition = margin + 5;
  addSectionHeader('Investment Opportunity');
  yPosition += 3;

  // Investment metrics - 3 cards
  checkPageBreak(38);
  const invCardWidth = (maxWidth - 8) / 3;
  const invY = yPosition;
  
  // Card 1: Raising
  setFillColor(colors.highlightBg);
  pdf.rect(margin, invY, invCardWidth, 32, 'F');
  setDrawColor(colors.primary);
  pdf.setLineWidth(0.6);
  pdf.rect(margin, invY, invCardWidth, 32, 'S');
  
  setTextColor(colors.muted);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Raising', margin + invCardWidth / 2, invY + 7, { align: 'center' });
  
  setTextColor(colors.primary);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('$500K', margin + invCardWidth / 2, invY + 18, { align: 'center' });
  
  setTextColor(colors.muted);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Pre-Seed Round', margin + invCardWidth / 2, invY + 26, { align: 'center' });

  // Card 2: Valuation
  setFillColor(colors.highlightBg);
  pdf.rect(margin + invCardWidth + 4, invY, invCardWidth, 32, 'F');
  setDrawColor(colors.primary);
  pdf.setLineWidth(0.6);
  pdf.rect(margin + invCardWidth + 4, invY, invCardWidth, 32, 'S');
  
  setTextColor(colors.muted);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Valuation', margin + invCardWidth + 4 + invCardWidth / 2, invY + 7, { align: 'center' });
  
  setTextColor(colors.primary);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('$2M', margin + invCardWidth + 4 + invCardWidth / 2, invY + 18, { align: 'center' });
  
  setTextColor(colors.muted);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Post-money', margin + invCardWidth + 4 + invCardWidth / 2, invY + 26, { align: 'center' });

  // Card 3: Investor Discount
  setFillColor(colors.highlightBg);
  pdf.rect(margin + 2 * (invCardWidth + 4), invY, invCardWidth, 32, 'F');
  setDrawColor(colors.primary);
  pdf.setLineWidth(0.6);
  pdf.rect(margin + 2 * (invCardWidth + 4), invY, invCardWidth, 32, 'S');
  
  setTextColor(colors.muted);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Investor Discount', margin + 2 * (invCardWidth + 4) + invCardWidth / 2, invY + 7, { align: 'center' });
  
  setTextColor(colors.primary);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('20%', margin + 2 * (invCardWidth + 4) + invCardWidth / 2, invY + 18, { align: 'center' });
  
  setTextColor(colors.muted);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Standard Discount', margin + 2 * (invCardWidth + 4) + invCardWidth / 2, invY + 26, { align: 'center' });

  yPosition += 38;

  // Why Invest Now - 2x2 grid
  addSubsectionHeader('Why Invest Now', 10);
  yPosition += 3;

  checkPageBreak(60);
  const whyWidth = (maxWidth - 4) / 2;
  const whyHeight = 28;
  let whyY = yPosition;

  const whyReasons = [
    { title: 'First-Mover Advantage', desc: 'Capture market before competition emerges in this greenfield opportunity' },
    { title: 'Product Ready', desc: 'Fully functional platform, proven technology, ready to scale immediately' },
    { title: 'Massive Market', desc: '$12.4B TAM growing 45% annually with urgent AI adoption pressure' },
    { title: 'Scalable Technology', desc: 'AI-powered platform with minimal marginal costs per user and superior unit economics' }
  ];

  whyReasons.forEach((reason, index) => {
    const xPos = index % 2 === 0 ? margin : margin + whyWidth + 4;
    const yPos = whyY + Math.floor(index / 2) * (whyHeight + 3);
    
    setFillColor(colors.cardBg);
    pdf.rect(xPos, yPos, whyWidth, whyHeight, 'F');
    setDrawColor(colors.border);
    pdf.setLineWidth(0.4);
    pdf.rect(xPos, yPos, whyWidth, whyHeight, 'S');
    
    // Checkmark circle
    setFillColor(colors.success);
    pdf.circle(xPos + 6, yPos + 7, 2.5, 'F');
    setTextColor(colors.white);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('✓', xPos + 4.8, yPos + 8.5);
    
    // Title
    setTextColor(colors.heading);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text(reason.title, xPos + 12, yPos + 8);
    
    // Description
    setTextColor(colors.body);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    const descLines = wrapText(reason.desc, whyWidth - 14, 7.5);
    pdf.text(descLines, xPos + 12, yPos + 14);
  });

  yPosition += 2 * (whyHeight + 3) + 6;

  // Final call to action
  checkPageBreak(32);
  setFillColor(colors.primary);
  pdf.rect(margin, yPosition, maxWidth, 28, 'F');
  
  setTextColor(colors.white);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Join us in democratizing personalized AI transformation', margin + maxWidth / 2, yPosition + 10, { align: 'center' });
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Building the category-defining platform for the AI-powered workforce', margin + maxWidth / 2, yPosition + 18, { align: 'center' });

  yPosition += 32;

  // ================== CLOSING PAGE ==================
  pdf.addPage();
  yPosition = pageHeight / 2 - 30;

  setTextColor(colors.primary);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Let\'s Build Together', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 16;
  
  setTextColor(colors.body);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Contact Us', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  
  pdf.setFontSize(9.5);
  pdf.text('Email: info@jumpinai.com', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  pdf.text('Website: www.jumpinai.com', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 18;
  
  setTextColor(colors.muted);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text('JumpinAI - Your Personalized AI Adaptation Studio', pageWidth / 2, yPosition, { align: 'center' });

  // ================== PAGE NUMBERS & FOOTER ==================
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount) continue; // Skip cover and last page
    
    pdf.setPage(i);
    
    // Page number
    setTextColor(colors.muted);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const pageText = `${i} of ${pageCount}`;
    const pageTextWidth = pdf.getTextWidth(pageText);
    pdf.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 10);
    
    // Footer text
    pdf.setFontSize(7);
    pdf.text('JumpinAI Investor Pitch Deck', margin, pageHeight - 10);
  }

  // Save the PDF
  pdf.save('JumpinAI-Pitch-Deck.pdf');
};