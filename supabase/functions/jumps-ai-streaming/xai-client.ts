// XAI API client with retry logic
export async function callXAIWithRetry(
  prompt: string,
  apiKey: string,
  model: string = 'grok-2-latest',
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} calling xAI API...`);
      const result = await callXAI(prompt, apiKey, model);
      console.log(`✅ xAI API call succeeded on attempt ${attempt}`);
      return result;
    } catch (error: any) {
      lastError = error;
      const statusCode = error.status || error.statusCode;
      
      // Retry on 5xx errors (server errors)
      if (statusCode >= 500 && statusCode < 600 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.warn(`⚠️ xAI API error ${statusCode} on attempt ${attempt}. Retrying in ${delay}ms...`, {
          error: error.message,
          attempt,
          maxRetries
        });
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Don't retry on 4xx errors (client errors) or if max retries reached
      console.error(`❌ xAI API call failed definitively:`, {
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

async function callXAI(prompt: string, apiKey: string, model: string): Promise<string> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant specialized in creating action plans and providing practical tools and resources.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: model,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ xAI API error response:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    const error: any = new Error(`xAI API error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.response = errorText;
    throw error;
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
