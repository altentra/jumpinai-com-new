import "https://deno.land/x/xhr@0.1.0/mod.ts";

const xaiApiKey = Deno.env.get('XAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jumpOverview, phaseTitle, phaseNumber, stepTitle, stepDescription, stepNumber } = await req.json();

    console.log('Reroute Step - Generating alternative routes for:', { phaseTitle, stepTitle });

    const systemPrompt = `You are an expert AI assistant helping users find alternative approaches to achieve their goals. 
Your task is to generate 3 completely different but viable alternative directions for a specific step in their plan.

Each direction should:
1. Offer a unique approach or perspective
2. Be practical and actionable
3. Include 3 detailed sub-steps with comprehensive descriptions
4. Maintain similar scope and effort as the original step

IMPORTANT: Each sub-step description should be substantial and detailed - approximately half to two-thirds the length of the original step's description. Provide clear, actionable guidance with specific examples and context.

Format your response as valid JSON with this exact structure:
{
  "directions": [
    {
      "direction_number": 1,
      "overview": "Brief overview of this direction and why it's valuable (2-3 sentences)",
      "sub_steps": [
        {
          "sub_step_number": 1,
          "title": "Clear, actionable title",
          "description": "Detailed, comprehensive description with specific guidance, examples, and actionable steps. This should be substantial - aim for half to two-thirds the length of the original step description.",
          "estimated_time": "Time estimate (e.g., '30 minutes', '2 hours')"
        }
      ]
    }
  ]
}`;

    const userPrompt = `Context:
Jump Overview: ${jumpOverview}
Phase ${phaseNumber}: ${phaseTitle}

Current Step (Step ${stepNumber}):
Title: ${stepTitle}
Description: ${stepDescription}

Generate 3 completely different alternative approaches/directions to accomplish this step. Each direction should have a unique perspective and include 3 detailed sub-steps.

Make each direction:
- Distinctly different from the others
- Practical and actionable
- Similar in scope to the original step
- Include specific, clear sub-steps with substantial descriptions (each sub-step description should be approximately half to two-thirds the length of the original step description)

Return ONLY valid JSON, no markdown formatting.`;

    console.log('🚀 Calling xAI API with max_tokens: 16000');
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${xaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-4-fast-non-reasoning',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API error:', response.status, errorText);
      throw new Error(`xAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw xAI response length:', content.length);
    console.log('First 500 chars:', content.substring(0, 500));
    console.log('Last 500 chars:', content.substring(content.length - 500));
    
    // Parse the JSON response with intelligent repair
    let parsedContent;
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      console.log('Cleaned content length:', cleanContent.length);
      
      // Try to fix common JSON issues
      // Fix trailing commas before closing brackets/braces
      cleanContent = cleanContent.replace(/,(\s*[}\]])/g, '$1');
      
      // Remove incomplete content at the end if it's not properly closed
      // This handles cases where text is cut off mid-sentence
      if (!cleanContent.endsWith('}') && !cleanContent.endsWith(']')) {
        // Find the last complete property by looking for the last quote before any incomplete text
        const lastCompleteQuote = cleanContent.lastIndexOf('"');
        if (lastCompleteQuote > 0) {
          // Check if there's an unclosed string or incomplete property
          const afterLastQuote = cleanContent.substring(lastCompleteQuote + 1);
          // If there's text after the last quote that doesn't properly close, truncate
          if (afterLastQuote && !afterLastQuote.match(/^\s*[,}\]]/)) {
            cleanContent = cleanContent.substring(0, lastCompleteQuote + 1);
            console.log('🔧 Truncated incomplete content at the end');
          }
        }
      }
      
      // Count brackets and braces to understand nesting
      const openBraces = (cleanContent.match(/{/g) || []).length;
      const closeBraces = (cleanContent.match(/}/g) || []).length;
      const openBrackets = (cleanContent.match(/\[/g) || []).length;
      const closeBrackets = (cleanContent.match(/]/g) || []).length;
      
      console.log('Bracket counts:', { openBraces, closeBraces, openBrackets, closeBrackets });
      
      // Intelligently close the JSON structure
      // We need to close in the right order: innermost objects first, then arrays
      if (openBraces > closeBraces || openBrackets > closeBrackets) {
        console.warn('⚠️ Repairing truncated JSON...');
        
        // Analyze the structure to understand what needs closing
        // We'll track the stack of open structures
        const stack: string[] = [];
        for (let i = 0; i < cleanContent.length; i++) {
          const char = cleanContent[i];
          // Skip content inside strings
          if (char === '"') {
            let j = i + 1;
            while (j < cleanContent.length && cleanContent[j] !== '"') {
              if (cleanContent[j] === '\\') j++; // Skip escaped quotes
              j++;
            }
            i = j;
            continue;
          }
          if (char === '{') stack.push('}');
          else if (char === '[') stack.push(']');
          else if (char === '}' || char === ']') {
            if (stack.length > 0 && stack[stack.length - 1] === char) {
              stack.pop();
            }
          }
        }
        
        // Add the missing closing characters in reverse order
        console.log('🔧 Stack of unclosed structures:', stack);
        while (stack.length > 0) {
          cleanContent += stack.pop();
        }
        
        console.log('✅ Repaired JSON by adding', (openBraces - closeBraces) + (openBrackets - closeBrackets), 'closing characters');
      }
      
      parsedContent = JSON.parse(cleanContent);
      console.log('✅ Successfully parsed JSON with', parsedContent.directions?.length, 'directions');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed content (first 1000 chars):', content.substring(0, 1000));
      console.error('Failed content (last 1000 chars):', content.substring(content.length - 1000));
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate structure
    if (!parsedContent.directions || !Array.isArray(parsedContent.directions)) {
      console.error('Invalid response structure - no directions array:', parsedContent);
      throw new Error('Invalid response structure from AI - missing directions array');
    }
    
    if (parsedContent.directions.length !== 3) {
      console.warn(`⚠️ Expected 3 directions but got ${parsedContent.directions.length}`);
      // Don't throw error, but warn - we can work with less than 3 directions
    }

    console.log('✅ Returning', parsedContent.directions.length, 'alternative routes');

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in reroute-step function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
