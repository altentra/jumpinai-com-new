import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jumpForward, formGoals, formChallenges, jumpTitle, existingAlternatives } = await req.json();

    console.log('Generating alternative jumps for:', { 
      jumpTitle, 
      formGoals: formGoals?.substring(0, 100),
      existingCount: existingAlternatives?.length || 0
    });

    if (!jumpForward || !formGoals) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: jumpForward and formGoals' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GOOGLE_GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GOOGLE_GEMINI_API_KEY) {
      console.error('GOOGLE_GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the context of existing alternatives to avoid
    const existingContext = existingAlternatives && existingAlternatives.length > 0
      ? `\n\nIMPORTANT - AVOID THESE ALREADY GENERATED ALTERNATIVES (generate completely DIFFERENT approaches):
${existingAlternatives.map((alt: { title: string; description: string }, i: number) => 
  `${i + 1}. "${alt.title}": ${alt.description}`
).join('\n')}`
      : '';

    const systemPrompt = `You are JumpinAI, an expert AI strategist specializing in AI adaptation and implementation planning.

Your task is to generate 3 COMPLETELY DIFFERENT alternative strategic approaches to help the user achieve their goals.

IMPORTANT GUIDELINES:
- Each alternative must be DISTINCT and offer a genuinely different pathway/methodology
- Alternatives should vary in approach, timeline, tools, or methodology
- Be creative but practical - each alternative must be actionable
- Consider different risk tolerances, budgets, and time commitments
- Each alternative should be compelling and well-reasoned
${existingAlternatives && existingAlternatives.length > 0 
  ? `- CRITICAL: You must generate alternatives that are COMPLETELY DIFFERENT from the ${existingAlternatives.length} alternatives already generated. Do NOT repeat similar ideas, approaches, or methodologies.`
  : ''}

Output Format: Return ONLY valid JSON with this exact structure:
{
  "alternatives": [
    {
      "title": "Short compelling title (5-8 words max)",
      "description": "2-3 sentence description explaining this alternative approach, what makes it different, and why someone might choose it"
    },
    {
      "title": "...",
      "description": "..."
    },
    {
      "title": "...",
      "description": "..."
    }
  ]
}`;

    const userPrompt = `The user wants to achieve the following:

GOALS:
${formGoals}

${formChallenges ? `CHALLENGES/OBSTACLES:
${formChallenges}` : ''}

The AI initially proposed this approach (The Jump Forward):
"${jumpForward}"
${existingContext}

Now, generate 3 NEW ALTERNATIVE approaches that are DIFFERENT from the original approach${existingAlternatives?.length > 0 ? ' AND different from all the alternatives listed above' : ''}. Each should offer a distinct pathway to achieve the same goals. Consider:
- Alternative 1: Could focus on a different methodology or framework
- Alternative 2: Could prioritize different aspects (speed vs thoroughness, cost vs quality, etc.)
- Alternative 3: Could use entirely different tools or strategies

Make each alternative genuinely compelling and different from the original${existingAlternatives?.length > 0 ? ', from each other, and from all previously generated alternatives' : ' and from each other'}.`;

    console.log('Calling Google Gemini API for alternative jumps...');

    // Call Google Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GOOGLE_GEMINI_API_KEY}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.85, // Slightly higher for more variety
          maxOutputTokens: 1500,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error('No content in Gemini response');
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Raw Gemini response:', content.substring(0, 500));

    // Parse the JSON response
    let alternatives;
    try {
      // Try to extract JSON from the response
      let jsonStr = content;
      
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      
      // Clean up common issues
      jsonStr = jsonStr
        .replace(/[\u0000-\u001F\u007F]/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      const parsed = JSON.parse(jsonStr);
      alternatives = parsed.alternatives;

      if (!Array.isArray(alternatives) || alternatives.length !== 3) {
        throw new Error('Invalid alternatives structure');
      }

      // Validate each alternative has required fields
      for (const alt of alternatives) {
        if (!alt.title || !alt.description) {
          throw new Error('Alternative missing title or description');
        }
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      
      // Fallback: generate generic alternatives if parsing fails
      const batchNumber = Math.floor((existingAlternatives?.length || 0) / 3) + 1;
      alternatives = [
        {
          title: batchNumber === 1 ? "Rapid AI Integration Sprint" : `Accelerated Implementation Path ${batchNumber}`,
          description: "Focus on quick wins by implementing the most impactful AI tools first. This approach prioritizes speed and immediate results over comprehensive coverage."
        },
        {
          title: batchNumber === 1 ? "Strategic Foundation Building" : `Methodical Growth Strategy ${batchNumber}`,
          description: "Take a methodical approach by establishing solid foundations before scaling. This ensures long-term success and sustainable growth with AI integration."
        },
        {
          title: batchNumber === 1 ? "Hybrid Human-AI Workflow" : `Balanced Automation Approach ${batchNumber}`,
          description: "Balance AI automation with human oversight, creating workflows that leverage the best of both. Ideal for those who want control while gaining efficiency."
        }
      ];
    }

    console.log('Successfully generated alternatives:', alternatives.map((a: { title: string }) => a.title));

    return new Response(
      JSON.stringify({ alternatives }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-alternative-jumps:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
