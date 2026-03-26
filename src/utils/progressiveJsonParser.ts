/**
 * Progressive JSON Parser
 * Extracts complete sections from a streaming JSON response
 * so we can render frames in the final UI as they arrive.
 */

export interface ParsedOverview {
  jumpForward?: string;
  strategicEdge?: { analysis?: string; keyPoints?: string[] };
  flightPath?: { vision?: string; roadmap?: Array<{ phase: string; timeframe: string; focus: string }> };
  newBaseline?: string;
}

export interface ParsedPhase {
  phase_number?: number;
  title: string;
  duration?: string;
  description?: string;
  steps?: Array<{ step_number: number; title: string; description: string; estimated_time?: string }>;
}

export interface ParsedPlan {
  phases: ParsedPhase[];
}

export interface ParsedToolPrompt {
  title: string;
  tool_name?: string;
  prompt_text?: string;
  description?: string;
  phase?: number;
}

export interface ParsedToolPrompts {
  tool_prompts: ParsedToolPrompt[];
}

/**
 * Try to extract a simple string field from partial JSON
 * e.g. "jumpForward": "Some text here",
 */
function extractStringField(json: string, fieldName: string): string | undefined {
  // Match "fieldName": "value" (handles escaped quotes inside)
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const match = json.match(regex);
  if (match) {
    // Unescape the string
    return match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
  }
  return undefined;
}

/**
 * Try to extract an object field from partial JSON
 * Uses brace counting to find complete objects
 */
function extractObjectField(json: string, fieldName: string): any | undefined {
  const startPattern = new RegExp(`"${fieldName}"\\s*:\\s*\\{`);
  const match = startPattern.exec(json);
  if (!match) return undefined;

  const startIndex = match.index + match[0].length - 1; // Start at the {
  let braceCount = 0;
  let inString = false;
  let escaped = false;

  for (let i = startIndex; i < json.length; i++) {
    const char = json[i];
    
    if (escaped) {
      escaped = false;
      continue;
    }
    
    if (char === '\\') {
      escaped = true;
      continue;
    }
    
    if (char === '"' && !escaped) {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{') braceCount++;
      if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          // Found complete object
          const objectStr = json.substring(startIndex, i + 1);
          try {
            return JSON.parse(objectStr);
          } catch {
            return undefined;
          }
        }
      }
    }
  }
  return undefined;
}

/**
 * Try to extract complete array items from partial JSON
 * Used for extracting phases or tool_prompts arrays progressively
 */
function extractArrayItems(json: string, fieldName: string): any[] {
  const items: any[] = [];
  const startPattern = new RegExp(`"${fieldName}"\\s*:\\s*\\[`);
  const match = startPattern.exec(json);
  if (!match) return items;

  const startIndex = match.index + match[0].length;
  let braceCount = 0;
  let bracketCount = 1; // We're inside the array
  let inString = false;
  let escaped = false;
  let itemStart = startIndex;

  for (let i = startIndex; i < json.length; i++) {
    const char = json[i];
    
    if (escaped) {
      escaped = false;
      continue;
    }
    
    if (char === '\\') {
      escaped = true;
      continue;
    }
    
    if (char === '"' && !escaped) {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{') {
        if (braceCount === 0) itemStart = i;
        braceCount++;
      }
      if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          // Found complete object item
          const itemStr = json.substring(itemStart, i + 1);
          try {
            items.push(JSON.parse(itemStr));
          } catch {
            // Incomplete item, skip
          }
        }
      }
      if (char === '[') bracketCount++;
      if (char === ']') {
        bracketCount--;
        if (bracketCount === 0) break; // End of array
      }
    }
  }
  
  return items;
}

/**
 * Parse streaming Overview JSON into structured frames
 */
export function parseStreamingOverview(rawJson: string): ParsedOverview {
  const result: ParsedOverview = {};
  
  // Extract simple string fields
  const jumpForward = extractStringField(rawJson, 'jumpForward');
  if (jumpForward) result.jumpForward = jumpForward;
  
  const newBaseline = extractStringField(rawJson, 'newBaseline');
  if (newBaseline) result.newBaseline = newBaseline;
  
  // Extract object fields
  const strategicEdge = extractObjectField(rawJson, 'strategicEdge');
  if (strategicEdge) result.strategicEdge = strategicEdge;
  
  const flightPath = extractObjectField(rawJson, 'flightPath');
  if (flightPath) result.flightPath = flightPath;
  
  return result;
}

/**
 * Parse streaming Plan JSON into phases
 */
export function parseStreamingPlan(rawJson: string): ParsedPlan {
  const phases = extractArrayItems(rawJson, 'phases');
  return { phases };
}

/**
 * Parse streaming Tool Prompts JSON
 */
export function parseStreamingToolPrompts(rawJson: string): ParsedToolPrompts {
  const tool_prompts = extractArrayItems(rawJson, 'tool_prompts');
  return { tool_prompts };
}
