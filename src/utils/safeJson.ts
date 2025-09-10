// Robust JSON parsing with extraction and repair attempts
export const safeParseJSON = (text: string): any | null => {
  if (!text || typeof text !== 'string') return null;

  const tryParse = (t: string) => {
    try { return JSON.parse(t); } catch { return null; }
  };

  // 1) Direct parse
  let obj = tryParse(text);
  if (obj) return obj;

  // 2) Normalize/clean input
  let cleaned = text.trim();

  // Strip common code fences (single or multi)
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();

  // Attempt parse again
  obj = tryParse(cleaned);
  if (obj) return obj;

  // Extract largest object slice
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const sliceObj = cleaned.slice(firstBrace, lastBrace + 1);
    obj = tryParse(sliceObj);
    if (obj) return obj;
  }

  // Extract largest array slice (in case the model returned an array)
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const sliceArr = cleaned.slice(firstBracket, lastBracket + 1);
    obj = tryParse(sliceArr);
    if (obj) return obj;
  }

  // Remove BOM if present
  cleaned = cleaned.replace(/^\uFEFF/, '');

  // Normalize smart quotes
  cleaned = cleaned.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");

  // Remove JS-style comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '');

  // Remove trailing commas
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  obj = tryParse(cleaned);
  if (obj) return obj;

  // 3) Attempt single-quoted JSON repair (cautious)
  const singleCount = (cleaned.match(/'/g) || []).length;
  const doubleCount = (cleaned.match(/\"/g) || []).length;
  if (doubleCount < singleCount) {
    const singleToDouble = cleaned
      // property names
      .replace(/'([^'\\]*(\\.[^'\\]*)*)'\s*:/g, '"$1":')
      // string values
      .replace(/:\s*'([^'\\]*(\\.[^'\\]*)*)'/g, ': "$1"');
    obj = tryParse(singleToDouble);
    if (obj) return obj;
  }

  // 4) Try parsing candidate top-level objects greedily
  const candidates: string[] = [];
  const stack: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === '{' || ch === '[') stack.push(i);
    if ((ch === '}' || ch === ']') && stack.length) {
      const s = stack.pop()!;
      if (stack.length === 0) candidates.push(cleaned.slice(s, i + 1));
    }
  }
  for (const cand of candidates) {
    const fixed = cand.replace(/,(\s*[}\]])/g, '$1');
    obj = tryParse(fixed);
    if (obj) return obj;
  }

  return null;
};
