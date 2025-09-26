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
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Professional color palette
  const colors = {
    foreground: [10, 10, 10],
    muted: [115, 115, 115],
    border: [229, 229, 229],
    accent: [245, 245, 245],
    primary: [23, 23, 23],
    sectionBg: [250, 250, 250],
  } as const;

  // Helper functions
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

  const addPageHeader = () => {
    pdf.setFillColor(...colors.accent);
    pdf.rect(0, 0, pageWidth, 18, 'F');
    
    pdf.setTextColor(...colors.primary);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('JumpinAI', margin, 12);
    
    pdf.setTextColor(...colors.muted);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('AI-Generated Jump Plan', pageWidth - margin - 40, 12);
    
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.3);
    pdf.line(0, 18, pageWidth, 18);
  };

  const addSectionHeader = (title: string, fontSize: number = 16) => {
    checkPageBreak(25);
    
    // Section background
    pdf.setFillColor(...colors.sectionBg);
    pdf.rect(margin - 5, yPosition - 5, maxWidth + 10, 20, 'F');
    
    pdf.setTextColor(...colors.primary);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'bold');
    const titleLines = wrapText(title, maxWidth, fontSize);
    pdf.text(titleLines, margin, yPosition + 8);
    yPosition += titleLines.length * 8 + 8;
    
    // Underline
    pdf.setDrawColor(...colors.primary);
    pdf.setLineWidth(1);
    pdf.line(margin, yPosition, margin + maxWidth * 0.3, yPosition);
    yPosition += 15;
  };

  const addSubsectionHeader = (title: string) => {
    checkPageBreak(20);
    pdf.setTextColor(...colors.foreground);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const titleLines = wrapText(title, maxWidth, 12);
    pdf.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * 6 + 8;
  };

  const addParagraph = (text: string, fontSize: number = 10) => {
    if (!text) return;
    checkPageBreak(15);
    pdf.setTextColor(...colors.foreground);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    
    // Clean text
    let cleanText = text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
    cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/`([^`]+)`/g, '$1');
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    const textLines = wrapText(cleanText, maxWidth, fontSize);
    pdf.text(textLines, margin, yPosition);
    yPosition += textLines.length * (fontSize * 0.6) + 8;
  };

  const addBulletPoint = (text: string, fontSize: number = 10) => {
    if (!text) return;
    checkPageBreak(15);
    pdf.setTextColor(...colors.foreground);
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    
    // Add bullet
    pdf.setFillColor(...colors.primary);
    pdf.circle(margin + 3, yPosition - 1, 1, 'F');
    
    const bulletLines = wrapText(text, maxWidth - 12, fontSize);
    pdf.text(bulletLines, margin + 10, yPosition);
    yPosition += bulletLines.length * (fontSize * 0.6) + 3;
  };

  const addDivider = () => {
    checkPageBreak(10);
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, margin + maxWidth, yPosition);
    yPosition += 15;
  };

  // Start PDF generation
  addPageHeader();
  yPosition = 35;

  // Title section
  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  const titleLines = wrapText(jumpData.title, maxWidth, 20);
  pdf.text(titleLines, margin, yPosition);
  yPosition += titleLines.length * 10 + 10;

  // Title underline
  pdf.setDrawColor(...colors.primary);
  pdf.setLineWidth(1.5);
  pdf.line(margin, yPosition, margin + maxWidth * 0.5, yPosition);
  yPosition += 20;

  // Metadata
  pdf.setTextColor(...colors.muted);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const dateText = new Date(jumpData.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  pdf.text(`Created: ${dateText}`, margin, yPosition);
  pdf.text('AI GENERATED', pageWidth - margin - 30, yPosition);
  yPosition += 25;

  // Summary section
  if (jumpData.summary) {
    addSubsectionHeader('Executive Summary');
    addParagraph(jumpData.summary, 11);
    addDivider();
  }

  // 1. OVERVIEW SECTION - Strategic Action Plan
  if (jumpData.content) {
    addSectionHeader('Strategic Action Plan');
    
    // Process markdown content with proper formatting
    const lines = jumpData.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        yPosition += 3;
        continue;
      }

      if (line.startsWith('# ')) {
        addSubsectionHeader(line.substring(2).trim());
      } else if (line.startsWith('## ')) {
        checkPageBreak(15);
        pdf.setTextColor(...colors.foreground);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        const headerLines = wrapText(line.substring(3).trim(), maxWidth, 11);
        pdf.text(headerLines, margin, yPosition);
        yPosition += headerLines.length * 6 + 8;
      } else if (line.startsWith('### ')) {
        checkPageBreak(12);
        pdf.setTextColor(...colors.foreground);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        const headerLines = wrapText(line.substring(4).trim(), maxWidth, 10);
        pdf.text(headerLines, margin, yPosition);
        yPosition += headerLines.length * 5 + 6;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        addBulletPoint(line.substring(2).trim());
      } else if (line.match(/^\d+\. /)) {
        addParagraph(line);
      } else if (line.startsWith('**') && line.endsWith('**')) {
        checkPageBreak(10);
        pdf.setTextColor(...colors.foreground);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        const boldLines = wrapText(line.substring(2, line.length - 2), maxWidth, 10);
        pdf.text(boldLines, margin, yPosition);
        yPosition += boldLines.length * 5 + 6;
      } else {
        addParagraph(line);
      }
    }
    addDivider();
  }

  // 2. IMPLEMENTATION PLAN
  if (jumpData.structured_plan) {
    addSectionHeader('Implementation Plan');
    
    if (jumpData.structured_plan.overview) {
      addParagraph(jumpData.structured_plan.overview, 11);
      yPosition += 10;
    }

    if (jumpData.structured_plan.phases && jumpData.structured_plan.phases.length > 0) {
      jumpData.structured_plan.phases.forEach((phase: any, index: number) => {
        checkPageBreak(35);
        
        // Phase header with background
        pdf.setFillColor(...colors.sectionBg);
        pdf.rect(margin - 3, yPosition - 3, maxWidth + 6, 15, 'F');
        
        pdf.setTextColor(...colors.primary);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        const phaseTitle = `Phase ${phase.phase_number || index + 1}: ${phase.title}`;
        pdf.text(phaseTitle, margin, yPosition + 5);
        yPosition += 18;

        if (phase.duration) {
          pdf.setTextColor(...colors.muted);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'italic');
          pdf.text(`Duration: ${phase.duration}`, margin, yPosition);
          yPosition += 10;
        }

        if (phase.description) {
          addParagraph(phase.description);
        }

        if (phase.tasks && phase.tasks.length > 0) {
          pdf.setTextColor(...colors.muted);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Key Tasks:', margin, yPosition);
          yPosition += 8;
          
          phase.tasks.forEach((task: any) => {
            const taskText = typeof task === 'string' ? task : task.description || task.name || 'Task';
            addBulletPoint(taskText, 9);
          });
        }
        yPosition += 8;
      });
    }
    addDivider();
  }

  // 3. COMPREHENSIVE PLAN SECTIONS
  if (jumpData.comprehensive_plan) {
    const plan = jumpData.comprehensive_plan;

    if (plan.executive_summary) {
      addSectionHeader('Executive Summary');
      addParagraph(plan.executive_summary, 11);
      addDivider();
    }

    if (plan.key_objectives) {
      addSectionHeader('Key Objectives');
      const objectives = Array.isArray(plan.key_objectives) ? plan.key_objectives : [plan.key_objectives];
      objectives.forEach((objective: string) => addBulletPoint(objective));
      addDivider();
    }

    if (plan.success_metrics) {
      addSectionHeader('Success Metrics');
      const metrics = Array.isArray(plan.success_metrics) ? plan.success_metrics : [plan.success_metrics];
      metrics.forEach((metric: string) => addBulletPoint(metric));
      addDivider();
    }

    if (plan.resource_requirements) {
      addSectionHeader('Resource Requirements');
      if (typeof plan.resource_requirements === 'string') {
        addParagraph(plan.resource_requirements);
      } else if (plan.resource_requirements.overview) {
        addParagraph(plan.resource_requirements.overview);
      }
      addDivider();
    }
  }

  // 4. AI TOOLS & RESOURCES
  if (jumpData.components?.tools && jumpData.components.tools.length > 0) {
    addSectionHeader('AI Tools & Resources');
    
    jumpData.components.tools.forEach((tool: any) => {
      checkPageBreak(40);
      
      // Tool header with background
      pdf.setFillColor(...colors.sectionBg);
      pdf.rect(margin - 3, yPosition - 3, maxWidth + 6, 12, 'F');
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(tool.name || 'AI Tool', margin, yPosition + 4);
      
      if (tool.category) {
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`[${tool.category}]`, pageWidth - margin - 40, yPosition + 4);
      }
      yPosition += 15;

      if (tool.description) {
        addParagraph(tool.description);
      }

      if (tool.when_to_use) {
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('When to use:', margin, yPosition);
        yPosition += 8;
        addParagraph(tool.when_to_use, 9);
      }

      if (tool.why_this_tool) {
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Why this tool:', margin, yPosition);
        yPosition += 8;
        addParagraph(tool.why_this_tool, 9);
      }

      if (tool.how_to_integrate || tool.integration_notes) {
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('How to integrate:', margin, yPosition);
        yPosition += 8;
        addParagraph(tool.how_to_integrate || tool.integration_notes, 9);
      }

      if (tool.website_url || tool.url || tool.website) {
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Website: ${tool.website_url || tool.url || tool.website}`, margin, yPosition);
        yPosition += 8;
      }

      yPosition += 8;
    });
    addDivider();
  }

  // 5. AI PROMPTS
  if (jumpData.components?.prompts && jumpData.components.prompts.length > 0) {
    addSectionHeader('AI Prompts');
    
    jumpData.components.prompts.forEach((prompt: any) => {
      checkPageBreak(35);
      
      addSubsectionHeader(prompt.title || 'AI Prompt');
      
      if (prompt.description) {
        addParagraph(prompt.description);
      }

      if (prompt.prompt_text) {
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Prompt:', margin, yPosition);
        yPosition += 8;
        
        // Prompt text in box
        pdf.setFillColor(...colors.sectionBg);
        const promptLines = wrapText(prompt.prompt_text, maxWidth - 10, 9);
        const boxHeight = promptLines.length * 5 + 8;
        checkPageBreak(boxHeight + 10);
        pdf.rect(margin - 2, yPosition - 4, maxWidth + 4, boxHeight, 'F');
        
        pdf.setTextColor(...colors.foreground);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(promptLines, margin + 3, yPosition);
        yPosition += boxHeight + 5;
      }

      if (prompt.ai_tools && prompt.ai_tools.length > 0) {
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Compatible with: ${prompt.ai_tools.join(', ')}`, margin, yPosition);
        yPosition += 10;
      }
      
      yPosition += 8;
    });
    addDivider();
  }

  // 6. WORKFLOWS
  if (jumpData.components?.workflows && jumpData.components.workflows.length > 0) {
    addSectionHeader('Workflows');
    
    jumpData.components.workflows.forEach((workflow: any) => {
      checkPageBreak(35);
      
      addSubsectionHeader(workflow.title || 'AI Workflow');
      
      if (workflow.description) {
        addParagraph(workflow.description);
      }

      if (workflow.workflow_steps && workflow.workflow_steps.length > 0) {
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Steps:', margin, yPosition);
        yPosition += 8;
        
        workflow.workflow_steps.forEach((step: any, index: number) => {
          checkPageBreak(15);
          pdf.setTextColor(...colors.foreground);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          
          const stepText = `${step.step || index + 1}. ${step.title || step.description || step.action || 'Step'}`;
          if (step.description && step.title) {
            const stepLines = wrapText(`${stepText}: ${step.description}`, maxWidth - 8, 9);
            pdf.text(stepLines, margin + 5, yPosition);
            yPosition += stepLines.length * 5 + 3;
          } else {
            const stepLines = wrapText(stepText, maxWidth - 8, 9);
            pdf.text(stepLines, margin + 5, yPosition);
            yPosition += stepLines.length * 5 + 3;
          }
        });
      }

      if (workflow.complexity_level || workflow.duration_estimate) {
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        let info = '';
        if (workflow.complexity_level) info += `Complexity: ${workflow.complexity_level}`;
        if (workflow.duration_estimate) info += (info ? ' | ' : '') + `Duration: ${workflow.duration_estimate}`;
        pdf.text(info, margin, yPosition);
        yPosition += 10;
      }
      
      yPosition += 8;
    });
    addDivider();
  }

  // 7. BLUEPRINTS
  if (jumpData.components?.blueprints && jumpData.components.blueprints.length > 0) {
    addSectionHeader('Blueprints');
    
    jumpData.components.blueprints.forEach((blueprint: any) => {
      checkPageBreak(25);
      
      addSubsectionHeader(blueprint.title || 'AI Blueprint');
      
      if (blueprint.description) {
        addParagraph(blueprint.description);
      }

      if (blueprint.implementation) {
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Implementation:', margin, yPosition);
        yPosition += 8;
        addParagraph(blueprint.implementation, 9);
      }

      if (blueprint.deliverables && blueprint.deliverables.length > 0) {
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Deliverables:', margin, yPosition);
        yPosition += 8;
        blueprint.deliverables.forEach((deliverable: string) => addBulletPoint(deliverable, 9));
      }

      if (blueprint.difficulty_level || blueprint.implementation_time) {
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        let info = '';
        if (blueprint.difficulty_level) info += `Difficulty: ${blueprint.difficulty_level}`;
        if (blueprint.implementation_time) info += (info ? ' | ' : '') + `Time: ${blueprint.implementation_time}`;
        pdf.text(info, margin, yPosition);
        yPosition += 10;
      }
      
      yPosition += 8;
    });
    addDivider();
  }

  // 8. STRATEGIES
  if (jumpData.components?.strategies && jumpData.components.strategies.length > 0) {
    addSectionHeader('Strategies');
    
    jumpData.components.strategies.forEach((strategy: any) => {
      checkPageBreak(30);
      
      addSubsectionHeader(strategy.title || 'AI Strategy');
      
      if (strategy.description) {
        addParagraph(strategy.description);
      }

      if (strategy.key_actions && strategy.key_actions.length > 0) {
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Key Actions:', margin, yPosition);
        yPosition += 8;
        strategy.key_actions.forEach((action: string) => addBulletPoint(action, 9));
      }

      if (strategy.success_metrics && strategy.success_metrics.length > 0) {
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Success Metrics:', margin, yPosition);
        yPosition += 8;
        strategy.success_metrics.forEach((metric: string) => addBulletPoint(metric, 9));
      }

      if (strategy.potential_challenges && strategy.potential_challenges.length > 0) {
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Potential Challenges:', margin, yPosition);
        yPosition += 8;
        strategy.potential_challenges.forEach((challenge: string) => addBulletPoint(challenge, 9));
      }

      if (strategy.priority_level || strategy.timeline) {
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        let info = '';
        if (strategy.priority_level) info += `Priority: ${strategy.priority_level}`;
        if (strategy.timeline) info += (info ? ' | ' : '') + `Timeline: ${strategy.timeline}`;
        pdf.text(info, margin, yPosition);
        yPosition += 10;
      }
      
      yPosition += 8;
    });
  }

  // Add professional footer to all pages
  const pageCount = pdf.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    // Footer separator line
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
    
    // Footer content
    pdf.setTextColor(...colors.muted);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    // Page number (right)
    pdf.text(`${i} / ${pageCount}`, pageWidth - margin - 20, pageHeight - 15);
    
    // Generated by text (left)
    pdf.text('Generated by JumpinAI', margin, pageHeight - 15);
    
    // Date generated (center)  
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    const centerText = `Generated on ${currentDate}`;
    const centerX = (pageWidth - pdf.getTextWidth(centerText)) / 2;
    pdf.text(centerText, centerX, pageHeight - 15);
  }

  // Download the PDF with clean filename
  const cleanTitle = jumpData.title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 50);
  
  const fileName = `${cleanTitle || 'jump-plan'}.pdf`;
  pdf.save(fileName);
};