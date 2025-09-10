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
  let inString = false;
  let escape = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
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

  // 5) Slice to last balanced position if any
  const sliceToLastBalanced = (t: string): string => {
    let resEnd = -1;
    let inStr = false;
    let esc = false;
    const st: number[] = [];
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === '{') st.push(1);
      else if (c === '[') st.push(2);
      else if (c === '}' || c === ']') {
        if (st.length && ((st[st.length - 1] === 1 && c === '}') || (st[st.length - 1] === 2 && c === ']'))) {
          st.pop();
          if (st.length === 0) resEnd = i;
        }
      }
    }
    return resEnd >= 0 ? t.slice(0, resEnd + 1) : t;
  };

  const lastBalanced = sliceToLastBalanced(cleaned);
  if (lastBalanced && lastBalanced !== cleaned) {
    obj = tryParse(lastBalanced);
    if (obj) return obj;
  }

  // 6) Balance unclosed braces/brackets by appending necessary closers
  const balanceAndClose = (t: string): string => {
    let inStr = false;
    let esc = false;
    const st: string[] = [];
    let out = '';
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      out += c;
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === '{' || c === '[') st.push(c);
      else if (c === '}' || c === ']') {
        if (st.length && ((st[st.length - 1] === '{' && c === '}') || (st[st.length - 1] === '[' && c === ']'))) {
          st.pop();
        } else {
          // ignore unmatched closer
        }
      }
    }
    while (st.length) {
      const open = st.pop()!;
      out += open === '{' ? '}' : ']';
    }
    return out;
  };

  const balanced = balanceAndClose(cleaned);
  if (balanced && balanced !== cleaned) {
    obj = tryParse(balanced);
    if (obj) return obj;
  }

  return null;
};
