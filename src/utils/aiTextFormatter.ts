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
  
  // Break up long paragraphs (300+ chars) into smaller chunks at sentence boundaries
  t = t.replace(/^([^\n]{300,})$/gm, (match) => {
    // Split at sentence boundaries (. ! ?)
    const sentences = match.match(/[^.!?]+[.!?]+/g) || [match];
    let result = '';
    let chunk = '';
    
    sentences.forEach((sentence, idx) => {
      chunk += sentence;
      // Create a new paragraph after every 2-3 sentences or ~200 chars
      if ((idx > 0 && idx % 2 === 0) || chunk.length > 200) {
        result += chunk.trim() + '\n\n';
        chunk = '';
      }
    });
    
    if (chunk.trim()) {
      result += chunk.trim();
    }
    
    return result;
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

  // === ENHANCED VISUAL FORMATTING FOR MAXIMUM READABILITY ===
  
  // 1. BOLD key business/strategic terms for emphasis
  t = t.replace(/\b(important|key|critical|essential|significant|major|primary|fundamental|crucial|vital|strategic|core|priority|urgent|valuable|impactful)\b/gi, '**$1**');
  
  // 2. BOLD action verbs to highlight actionable items
  t = t.replace(/\b(implement|execute|develop|create|establish|achieve|optimize|enhance|improve|analyze|evaluate|monitor|measure|track|assess|review|design|build|launch|deploy|test|validate|integrate|automate|streamline|accelerate|scale|transform)\b/gi, '**$1**');

  // 3. BOLD metrics, numbers, and quantifiable data
  t = t.replace(/\b(\d+%|\$\d+[kmb]?|\d+[kmb]?\s*(?:users|customers|revenue|profit|growth|increase|decrease|reduction|improvement|hours?|days?|weeks?|months?))\b/gi, '**$1**');

  // 4. Italicize timeframes for visual distinction
  t = t.replace(/\b(within \d+\s*(?:days?|weeks?|months?|years?)|by (?:q\d|quarter \d|\w+ \d{4})|short[- ]?term|long[- ]?term|immediate|ongoing|phase \d+)\b/gi, '*$1*');

  // 5. Convert section headers to proper heading levels
  t = t.replace(/^(Success Criteria|Success Metrics|Key Results|Expected Outcomes?):\s*(.*)$/gim, '\n### 🎯 $1\n\n$2\n');
  t = t.replace(/^(Risks?|Challenges?|Potential Issues?|Concerns?):\s*(.*)$/gim, '\n### ⚠️ $1\n\n$2\n');
  t = t.replace(/^(Action Items?|Next Steps?|Immediate Actions?):\s*(.*)$/gim, '\n### ✅ $1\n\n$2\n');
  t = t.replace(/^(Benefits?|Advantages?|Value Proposition):\s*(.*)$/gim, '\n### 💡 $1\n\n$2\n');
  t = t.replace(/^(Timeline|Schedule|Roadmap):\s*(.*)$/gim, '\n### 📅 $1\n\n$2\n');
  t = t.replace(/^(Resources?|Tools?|Requirements?):\s*(.*)$/gim, '\n### 🔧 $1\n\n$2\n');

  // 6. Format numbered phases/stages with visual hierarchy
  t = t.replace(/^(\d+)\.\s*(Phase|Stage|Sprint|Milestone|Step)\s*(\d*)[:\-\s]*(.*)$/gim, '\n### 📍 $2 $1$3: $4\n');

  // 7. Emphasize ALL CAPS sections (usually important callouts)
  t = t.replace(/\b([A-Z]{3,})\b/g, '**$1**');

  // 8. Format bullet points with prefixes for better scanning
  t = t.replace(/^(\s*)-\s*(Action|Task|Goal|Objective|Deliverable|Requirement|Output|Outcome):\s*(.+)$/gim, '$1- **$2:** $3');

  // 9. Add visual separators before major sections
  t = t.replace(/\n### /g, '\n\n---\n\n### ');

  // 10. Highlight dollar amounts and ROI
  t = t.replace(/\$[\d,]+(?:\.\d{2})?/g, '**$&**');
  t = t.replace(/\b(ROI|return on investment)\b/gi, '**$1**');

  // 11. Bold comparative/superlative terms
  t = t.replace(/\b(best|top|leading|maximum|minimum|highest|lowest|fastest|slowest|most|least)\b/gi, '**$1**');

  // 12. Create visual breaks between sections
  t = t
    .replace(/([^\n])\n(\s*[-\d])/g, '$1\n\n$2')  // Space before lists
    .replace(/([^\n])\n(\s*##?#+\s)/g, '$1\n\n$2')  // Space before headings
    .replace(/([^\n])\n(\s*>\s)/g, '$1\n\n$2')  // Space before blockquotes
    .replace(/\n{4,}/g, '\n\n\n');  // Limit excessive spacing to max 2 blank lines

  // 13. Format KPIs and metrics headers
  t = t.replace(/^(KPIs?|Metrics?|Indicators?):\s*/gim, '\n### 📊 $1\n\n');

  // 14. Emphasize urgency/priority levels
  t = t.replace(/\b(high priority|urgent|asap|critical priority|immediate attention)\b/gi, '**$1**');

  return t.trim();
}

export default formatAIText;
