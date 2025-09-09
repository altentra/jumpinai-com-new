// Utility to heuristically convert raw AI text into clean Markdown for beautiful rendering
// Keeps it conservative to avoid mangling already well-formatted content

const LABELS = [
  'goal', 'goals', 'objective', 'objectives', 'kpi', 'kpis', 'metrics', 'milestones',
  'timeline', 'resources', 'risks', 'deliverables', 'outcomes', 'success criteria',
  'tools', 'budget', 'roi', 'owner', 'priority', 'actions', 'next steps', 'approach',
  'strategy', 'tactics', 'implementation', 'execution', 'overview', 'summary', 'analysis'
];

function normalize(text: string) {
  let t = text.replace(/\r\n?/g, '\n');
  // collapse 3+ newlines to exactly 2
  t = t.replace(/\n{3,}/g, '\n\n');
  // normalize bullets • and * into dashes
  t = t.replace(/^\s*[•*]\s+/gm, '- ');
  // normalize numbered lists like "1)" → "1."
  t = t.replace(/^(\s*)(\d+)\)\s+/gm, '$1$2. ');
  // reduce excessive bullet points - convert nested bullets to simple text
  t = t.replace(/^(\s*-\s+.*\n)(\s*-\s+.*\n){4,}/gm, (match) => {
    const lines = match.split('\n').filter(line => line.trim());
    // Keep first 3 bullets, convert rest to regular paragraphs
    const bullets = lines.slice(0, 3);
    const rest = lines.slice(3).map(line => line.replace(/^\s*-\s+/, ''));
    return bullets.join('\n') + '\n' + rest.join(' ') + '\n';
  });
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

  // Enhanced text formatting
  // Make key phrases italic for emphasis
  t = t.replace(/\b(important|key|critical|essential|significant|major|primary|fundamental|crucial)\b/gi, '*$1*');
  
  // Bold action words
  t = t.replace(/\b(implement|execute|develop|create|establish|achieve|optimize|enhance|improve|analyze|evaluate|monitor|measure|track|assess|review)\b/gi, '**$1**');

  // Ensure paragraph spacing: add a blank line before lists/headings when missing
  t = t
    .replace(/([^\n])\n(\s*[-\d])/g, '$1\n\n$2')
    .replace(/([^\n])\n(\s*##?#+\s)/g, '$1\n\n$2');

  return t.trim();
}

export default formatAIText;
