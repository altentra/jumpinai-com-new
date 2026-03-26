import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

export interface StudioFormData {
  goals: string;
  challenges?: string;
  turnstileToken?: string;
}

export const StudioFormSchema = z.object({
  goals: z.string().trim().min(10, 'Please share more details (at least 10 characters)').max(4000, 'Input must be less than 4000 characters'),
  challenges: z.string().max(4000, 'Challenges must be less than 4000 characters').optional()
});

export async function verifyTurnstile(token: string, secretKey: string, ipAddress: string): Promise<boolean> {
  const verifyEndpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  
  const response = await fetch(verifyEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: secretKey,
      response: token,
      remoteip: ipAddress,
    }),
  });

  if (!response.ok) {
    console.error('Turnstile verification request failed:', response.statusText);
    return false;
  }

  const data = await response.json();
  return data.success === true;
}
