// Utility to heuristically convert raw AI text into clean Markdown for beautiful rendering
// Keeps it conservative to avoid mangling already well-formatted content

const LABELS = [
  'goal', 'goals', 'objective', 'objectives', 'kpi', 'kpis', 'metrics', 'milestones',
  'timeline', 'resources', 'risks', 'deliverables', 'outcomes', 'success criteria',
  'tools', 'budget', 'roi', 'owner', 'priority', 'actions', 'next steps'
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

  // Standalone lines that look like titles (short, no period, surrounded by blank lines) → H2
  t = t.replace(/(^|\n)\s*([^\n:.]{4,80})\s*(?=\n\n)/g, (match, p1, line) => {
    const trimmed = String(line).trim();
    if (!trimmed) return match;
    const hasPunctuation = /[.:!?]$/.test(trimmed);
    const hasSpaces = /\s/.test(trimmed);
    const looksTitleCase = /^(?:[A-Z][^a-z]*|[A-Z][a-z]+)(?:\s+[A-Z][a-z]+|\s+[A-Za-z]+)*$/.test(trimmed);
    if (!hasPunctuation && hasSpaces && looksTitleCase && trimmed.length < 80) {
      return `${p1}## ${trimmed}`;
    }
    return match;
  });

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

  // Ensure paragraph spacing: add a blank line before lists/headings when missing
  t = t
    .replace(/([^\n])\n(\s*[-\d])/g, '$1\n\n$2')
    .replace(/([^\n])\n(\s*##?#+\s)/g, '$1\n\n$2');

  return t.trim();
}

export default formatAIText;
