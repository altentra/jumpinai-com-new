// Google Gemini API client with retry logic and TRUE streaming support
// Using gemini-3-flash-preview for fast, high-quality responses (latest model as of February 2026)
// Note: Model name must include "-preview" suffix for Gemini 3 models

export async function callGeminiWithRetry(
  prompt: string,
  apiKey: string,
  model: string = 'gemini-3-flash-preview',
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} calling Google Gemini API...`);
      const result = await callGemini(prompt, apiKey, model);
      console.log(`✅ Gemini API call succeeded on attempt ${attempt}`);
      return result;
    } catch (error: any) {
      lastError = error;
      const statusCode = error.status || error.statusCode;
      
      // Retry on 5xx errors (server errors) or rate limits (429)
      if ((statusCode >= 500 && statusCode < 600 || statusCode === 429) && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.warn(`⚠️ Gemini API error ${statusCode} on attempt ${attempt}. Retrying in ${delay}ms...`, {
          error: error.message,
          attempt,
          maxRetries
        });
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Don't retry on 4xx errors (client errors) or if max retries reached
      console.error(`❌ Gemini API call failed definitively:`, {
        statusCode,
        error: error.message,
        attempt,
        willRetry: false
      });
      throw error;
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

async function callGemini(prompt: string, apiKey: string, model: string): Promise<string> {
  // Use the Gemini REST API endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
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
    console.error('❌ Gemini API error response:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    const error: any = new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.response = errorText;
    throw error;
  }

  const data = await response.json();
  
  // Gemini returns content in a different structure
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    console.error('❌ No content in Gemini response:', data);
    throw new Error('No content in Gemini API response');
  }
  
  return content;
}

// Helper for OpenAI-compatible format (system + user messages)
export async function callGeminiChat(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string = 'gemini-3-flash-preview',
  options: {
    temperature?: number;
    maxOutputTokens?: number;
  } = {}
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
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
        temperature: options.temperature ?? 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: options.maxOutputTokens ?? 8192,
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
    console.error('❌ Gemini API error response:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    const error: any = new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.response = errorText;
    throw error;
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    console.error('❌ No content in Gemini response:', data);
    throw new Error('No content in Gemini API response');
  }
  
  return content;
}

// Chat completion with retry logic
export async function callGeminiChatWithRetry(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string = 'gemini-3-flash-preview',
  options: {
    temperature?: number;
    maxOutputTokens?: number;
  } = {},
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} calling Google Gemini API...`);
      const result = await callGeminiChat(systemPrompt, userPrompt, apiKey, model, options);
      console.log(`✅ Gemini API call succeeded on attempt ${attempt}`);
      return result;
    } catch (error: any) {
      lastError = error;
      const statusCode = error.status || error.statusCode;
      
      // Retry on 5xx errors or rate limits
      if ((statusCode >= 500 && statusCode < 600 || statusCode === 429) && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`⚠️ Gemini API error ${statusCode} on attempt ${attempt}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

/**
 * TRUE TOKEN-BY-TOKEN STREAMING from Gemini API
 * Uses streamGenerateContent endpoint for real-time character delivery
 */
export async function* streamGeminiChat(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string = 'gemini-3-flash-preview',
  options: {
    temperature?: number;
    maxOutputTokens?: number;
  } = {}
): AsyncGenerator<string, void, unknown> {
  // Use the streaming endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;
  
  console.log('🌊 Starting Gemini streaming...');
  
  const response = await fetch(url, {
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
        temperature: options.temperature ?? 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: options.maxOutputTokens ?? 8192,
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
    console.error('❌ Gemini streaming API error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    const error: any = new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.response = errorText;
    throw error;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body for streaming');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let totalChunks = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // Process SSE events (data: {...}\n\n format)
      const lines = buffer.split('\n');
      buffer = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // If this might be a partial line, keep it in buffer
        if (i === lines.length - 1 && line && !line.endsWith('}')) {
          buffer = lines[i];
          continue;
        }
        
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          if (jsonStr === '[DONE]') continue;
          
          try {
            const data = JSON.parse(jsonStr);
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (text) {
              totalChunks++;
              yield text;
            }
          } catch (parseError) {
            // Sometimes we get partial JSON, skip it
            console.warn('⚠️ Failed to parse streaming chunk:', jsonStr.substring(0, 100));
          }
        }
      }
    }
    
    console.log(`✅ Gemini streaming complete. Total chunks: ${totalChunks}`);
  } finally {
    reader.releaseLock();
  }
}

/**
 * Streaming with retry logic - collects full response but yields chunks for progress
 */
export async function streamGeminiChatWithCallback(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  onChunk: (chunk: string, accumulated: string) => void,
  model: string = 'gemini-3-flash-preview',
  options: {
    temperature?: number;
    maxOutputTokens?: number;
  } = {},
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} starting Gemini streaming...`);
      
      let accumulated = '';
      for await (const chunk of streamGeminiChat(systemPrompt, userPrompt, apiKey, model, options)) {
        accumulated += chunk;
        onChunk(chunk, accumulated);
      }
      
      console.log(`✅ Gemini streaming succeeded on attempt ${attempt}`);
      return accumulated;
    } catch (error: any) {
      lastError = error;
      const statusCode = error.status || error.statusCode;
      
      // Retry on 5xx errors or rate limits
      if ((statusCode >= 500 && statusCode < 600 || statusCode === 429) && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`⚠️ Gemini streaming error ${statusCode} on attempt ${attempt}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}
