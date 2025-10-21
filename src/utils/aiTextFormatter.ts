// Utility to heuristically convert raw AI text into clean Markdown for beautiful rendering
// Keeps it conservative to avoid mangling already well-formatted content

const LABELS = [
  'goal', 'goals', 'objective', 'objectives', 'kpi', 'kpis', 'metrics', 'milestones',
  'timeline', 'resources', 'risks', 'deliverables', 'outcomes', 'success criteria',
  'tools', 'budget', 'roi', 'owner', 'priority', 'actions', 'next steps', 'approach',
  'strategy', 'tactics', 'implementation', 'execution', 'overview', 'summary', 'analysis',
  'requirements', 'stakeholders', 'scope', 'assumptions', 'constraints', 'benefits',
  'challenges', 'opportunities', 'recommendations', 'findings', 'conclusion', 'results'
];

function normalize(text: string) {
  let t = text.replace(/\r\n?/g, '\n');
  // collapse 3+ newlines to exactly 2
  t = t.replace(/\n{3,}/g, '\n\n');
  // normalize bullets • and * into dashes
  t = t.replace(/^\s*[•*]\s+/gm, '- ');
  // normalize numbered lists like "1)" → "1."
  t = t.replace(/^(\s*)(\d+)\)\s+/gm, '$1$2. ');
  
  return t.trim();
}

function promoteHeadings(text: string) {
  // Chapter/Section/Step/Phase → headings
  let t = text
    .replace(/^\s*(chapter|section)\s+(\d+)[:\-\s]*(.*)$/gim, (_, k: string, n: string, rest: string) => {
      const title = (rest || '').trim();
      return `\n\n## ${k[0].toUpperCase() + k.slice(1).toLowerCase()} ${n}${title ? `: ${title}` : ''}`;
    })
    .replace(/^\s*(step|phase)\s+(\d+)[:\-\s]*(.*)$/gim, (_, k: string, n: string, rest: string) => {
      const title = (rest || '').trim();
      return `\n\n### ${k[0].toUpperCase() + k.slice(1).toLowerCase()} ${n}${title ? `: ${title}` : ''}`;
    });

  // Enhanced title detection - catch more business/strategy terms
  const titlePatterns = [
    /^\s*(executive summary|overview|introduction|conclusion|key findings|recommendations|next steps|action items|deliverables|timeline|budget|resources|analysis|strategy|approach|methodology|implementation|execution|goals|objectives|metrics|kpis|outcomes|results)[\s:]*$/gim,
    /^\s*([A-Z][A-Z\s&]{10,60})\s*$/gm, // ALL CAPS titles
    /^\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,6})\s*(?=\n\n)/gm // Title Case lines before paragraphs
  ];

  titlePatterns.forEach(pattern => {
    t = t.replace(pattern, (match, title) => {
      const cleanTitle = String(title).trim();
      if (cleanTitle.length > 5 && cleanTitle.length < 80) {
        return `\n\n## ${cleanTitle}`;
      }
      return match;
    });
  });

  // Numbered sections like "1. Introduction" → "### 1. Introduction"
  t = t.replace(/^\s*(\d+)\.\s+([A-Z][a-zA-Z\s]{8,50})\s*(?=\n)/gm, '\n\n### $1. $2');

  return t;
}

function boldLabels(text: string) {
  const labelRe = new RegExp(`^\\s*(${LABELS.join('|')})\\s*:`, 'gmi');
  return text.replace(labelRe, (m: string, label: string) => `**${label.replace(/\b\w/g, c => c.toUpperCase())}:**`);
}

export function formatAIText(input: string): string {
  if (!input) return '';
  let t = normalize(input);
  t = boldLabels(t);
  t = promoteHeadings(t);

  // === FOCUSED FORMATTING FOR READABILITY ===
  
  // 1. BOLD key terms for quick scanning
  t = t.replace(/\b(critical|essential|key|important|priority|urgent|strategic)\b/gi, '**$1**');
  
  // 2. Format metrics and numbers
  t = t.replace(/\b(\d+%|\$[\d,]+(?:\.\d{2})?)\b/gi, '**$1**');

  // 3. Italicize timeframes
  t = t.replace(/\b(week \d+|month \d+|phase \d+|by [A-Z][a-z]+ \d{4})\b/gi, '*$1*');

  // 4. Add icons to section headers
  t = t.replace(/^### (Success|Metrics?|KPI|Results?)[\s:]/gim, '\n### 🎯 $1 ');
  t = t.replace(/^### (Risk|Challenge|Issue|Concern)[\s:]/gim, '\n### ⚠️ $1 ');
  t = t.replace(/^### (Action|Step|Task|Next)[\s:]/gim, '\n### ✅ $1 ');
  t = t.replace(/^### (Timeline|Schedule|Roadmap)[\s:]/gim, '\n### 📅 $1 ');

  // 5. Clean spacing
  t = t.replace(/\n{3,}/g, '\n\n');

  return t.trim();
}

export default formatAIText;
