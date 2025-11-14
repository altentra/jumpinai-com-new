import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

export interface StudioFormData {
  goals: string;
  challenges: string;
  turnstileToken?: string;
}

export const StudioFormSchema = z.object({
  goals: z.string().trim().min(10, 'Goals must be at least 10 characters').max(2000, 'Goals must be less than 2000 characters'),
  challenges: z.string().trim().min(10, 'Challenges must be at least 10 characters').max(2000, 'Challenges must be less than 2000 characters')
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
