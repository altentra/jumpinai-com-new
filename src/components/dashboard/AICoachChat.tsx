import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { supabase } from '@/integrations/supabase/client';
import { Bot, User, Send, Sparkles, Download, Copy, Lock } from 'lucide-react';
import { UserProfile } from '@/services/userProfileService';
import { createJump, updateJump, extractTitle, extractSummary } from '@/services/jumpService';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AICoachChatProps {
  userProfile: UserProfile;
  onBack?: () => void;
  onPlanGenerated?: (plan: string) => void;
  onJumpSaved?: (jumpId: string) => void;
  hideChat?: boolean;
  initialPlan?: string;
  isRefinementMode?: boolean;
  currentJumpId?: string | null;
  jumpName?: string;
  isNewJump?: boolean;
}

export default function AICoachChat({ 
  userProfile, 
  onBack,
  onPlanGenerated,
  onJumpSaved,
  hideChat = false,
  initialPlan = '',
  isRefinementMode = false,
  currentJumpId = null,
  jumpName = '',
  isNewJump = true
}: AICoachChatProps) {
  const { user } = useOptimizedAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const hasGeneratedRef = useRef(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { subscription } = useAuth();
  
  const startLoadingTimer = () => {
    setLoadingTime(0);
    loadingTimerRef.current = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);
  };

  const stopLoadingTimer = () => {
    if (loadingTimerRef.current) {
      clearInterval(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    setLoadingTime(0);
  };

  const isPaidUser = subscription?.subscribed || false;
  const invokeWithTimeout = async (payload: any, ms = 420000): Promise<any> => {
    return await Promise.race([
      supabase.functions.invoke('jumps-ai-coach', { body: payload }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Generation timed out. Please try again within ~420s.')), ms))
    ]);
  };
  
  // Normalize various possible response shapes from the Edge Function/Supabase client
  const extractAiMessage = (resp: any): string => {
    try {
      // Supabase Functions usual shape
      if (resp?.data?.message && typeof resp.data.message === 'string') return resp.data.message as string;
      // Common alternative keys
      if (resp?.data?.generatedText) return resp.data.generatedText;
      if (resp?.data?.plan) return resp.data.plan;
      if (resp?.data?.content) return resp.data.content;
      // Sometimes the data is a JSON string
      if (typeof resp?.data === 'string') {
        try {
          const parsed = JSON.parse(resp.data);
          if (parsed?.message) return parsed.message;
          if (parsed?.generatedText) return parsed.generatedText;
          if (parsed?.plan) return parsed.plan;
          if (parsed?.choices?.[0]?.message?.content) return parsed.choices[0].message.content;
          return typeof parsed === 'string' ? parsed : '';
        } catch {
          return resp.data;
        }
      }
      // Some clients return body at the root
      if (resp?.message) return resp.message;
      // Raw OpenAI passthrough just in case
      if (resp?.data?.choices?.[0]?.message?.content) return resp.data.choices[0].message.content;
      // Last resort: stringify object if small
      if (resp?.data && typeof resp.data === 'object') {
        try {
          const s = JSON.stringify(resp.data);
          if (s && s.length < 5000) return s;
        } catch {}
      }
      return '';
    } catch (e) {
      console.warn('[AICoachChat] extractAiMessage error:', e, resp);
      return '';
    }
  };
  
  useEffect(() => {
    // If refining an existing plan, seed a helper message and skip auto-generation
    if (isRefinementMode && initialPlan) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `I can see your current Jump Plan. How would you like to refine or improve it? You can ask me to:\n\n• Add more details to specific sections\n• Adjust timelines or priorities\n• Include additional strategies\n• Modify recommendations\n• Focus on particular areas\n\nWhat would you like to change?`,
          timestamp: new Date()
        }
      ]);
      return;
    }

    // Define generator first so we can call it for both hidden and visible chat modes
    const generateInitialPlan = async () => {
      setIsLoading(true);
      startLoadingTimer();
      try {
        const initialPrompt =
          "Using the provided profile context, generate a fully comprehensive, professional, elite-level, actionable 'Jump' plan following the RESPONSE STRUCTURE from the system prompt. Be specific with tools, steps, timelines, and metrics. Tailor everything to the user's role, industry, experience, time, and budget. Use clear headings and bullet points.";
        const payload = {
          messages: [{ role: 'user', content: initialPrompt }],
          userProfile,
          userId: user?.id,
          jumpId: currentJumpId,
          generateComponents: false // Defer component generation until after jump is saved
        };
        console.log('[AICoachChat] Auto-invoking jumps-ai-coach with payload:', payload);
        const response: any = await invokeWithTimeout(payload);
        console.log('[AICoachChat] Auto-generation response:', response);
        if (response.error) {
          throw new Error(response.error.message || 'Failed to generate initial plan');
        }
        const aiText = extractAiMessage(response);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiText || 'No response received from AI.',
          timestamp: new Date()
        };
        if (!aiText) {
          console.warn('[AICoachChat] Unexpected AI response shape:', response);
          toast({
            title: 'AI response issue',
            description: 'Received an unexpected response from the AI. Please try again.',
            variant: 'destructive'
          });
        }
        setMessages(prev => [...prev, assistantMessage]);
        if (onPlanGenerated && aiText) {
          onPlanGenerated(aiText);
          
          // Auto-save or update the jump to database
          if (aiText.trim()) {
            try {
              if (currentJumpId && !isNewJump) {
                // Update existing jump
                const updatedJump = await updateJump(currentJumpId, {
                  title: jumpName || extractTitle(aiText),
                  summary: extractSummary(aiText),
                  full_content: aiText
                });
                
                if (updatedJump && onJumpSaved) {
                  onJumpSaved(updatedJump.id);
                  toast({
                    title: 'Jump Updated!',
                    description: 'Your AI transformation plan has been updated.',
                  });
                }
              } else if (isNewJump) {
                // Create new jump
                const title = jumpName || extractTitle(aiText);
                const summary = extractSummary(aiText);
                
                const savedJump = await createJump({
                  profile_id: userProfile.id,
                  title,
                  summary,
                  full_content: aiText
                });
                
                if (savedJump && onJumpSaved) {
                  onJumpSaved(savedJump.id);
                  toast({
                    title: 'Jump Saved!',
                    description: 'Your AI transformation plan has been saved to your library.',
                  });

                  // After creating a new Jump, trigger background generation of components
                  try {
                    toast({
                      title: 'Generating Jump Components',
                      description: 'Creating prompts, workflows, blueprints, and strategies...',
                    });
                    const { data: { user: authUser } } = await supabase.auth.getUser();
                    const compPayload = {
                      messages: [{ role: 'user', content: 'Generate Jump components for this profile.' }],
                      userProfile,
                      userId: authUser?.id,
                      jumpId: savedJump.id,
                      generateComponents: true,
                    };
                    const compResp: any = await invokeWithTimeout(compPayload, 240000);
                    console.log('[AICoachChat] Components generation response:', compResp);
                    const status = compResp?.data?.components as string | undefined;
                    const detail = compResp?.data?.components_detail as any;
                    const expected = detail?.expectedCounts || {};
                    const saveSummary = detail?.saveSummary || {};

                    if (status && typeof status === 'string' && status.toLowerCase().includes('generated')) {
                      const msg = `Saved ${saveSummary.saved ?? '?'} of ${saveSummary.total ?? '?'} items`;
                      const counts = `Prompts: ${expected.prompts ?? 0}, Workflows: ${expected.workflows ?? 0}, Blueprints: ${expected.blueprints ?? 0}, Strategies: ${expected.strategies ?? 0}`;
                      toast({
                        title: 'Components Ready',
                        description: `${msg}. ${counts}. If you don’t see them yet, hit refresh in their tabs in ~10–20s.`,
                      });
                    } else {
                      toast({
                        title: 'Components Requested',
                        description: "Generation requested. If items don’t appear, refresh the page in a few seconds.",
                      });
                    }

                    // Extra hint if any category came back empty
                    if (expected && (expected.workflows === 0 || expected.blueprints === 0 || expected.strategies === 0)) {
                      console.warn('[AICoachChat] Some component categories were empty:', expected);
                      toast({
                        title: 'Heads up',
                        description: 'Some categories returned empty. You can retry generation from Jumps Studio.',
                      });
                    }
                  } catch (genErr) {
                    console.error('Error generating Jump components:', genErr);
                    toast({
                      title: 'Component generation failed',
                      description: 'Your plan is saved, but components failed to generate. You can retry from Jumps Studio.',
                      variant: 'destructive',
                    });
                  }
                }
              }
            } catch (error) {
              console.error('Error saving/updating jump:', error);
              toast({
                title: 'Save Error',
                description: 'Jump generated but failed to save to library',
                variant: 'destructive'
              });
            }
          }
        }
      } catch (error: any) {
        console.error('Error generating initial plan:', error);
        toast({
          title: 'Generation error',
          description: error?.message || 'Failed to generate your plan. You can try again by sending a message.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
        stopLoadingTimer();
      }
    };

    // If chat UI is hidden, still generate the plan in the background
    if (hideChat) {
      generateInitialPlan();
      return;
    }

    // Otherwise, show welcome message and then generate
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `Welcome to Jumps Studio.\n\nI've reviewed your profile and I'm ready to create your custom "Jump" plan. Based on your role as a ${userProfile.currentRole} in ${userProfile.industry}, there are strong opportunities for AI integration.\n\nI'll generate a comprehensive plan now. You can refine it with chat after.`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    generateInitialPlan();
  }, [userProfile, hideChat, isRefinementMode, initialPlan, onPlanGenerated]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!isPaidUser) {
      toast({
        title: 'Premium Feature',
        description: 'Chat refinement is available for premium subscribers only.',
        variant: 'destructive'
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    startLoadingTimer();

    try {
      const payload = {
        messages: [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: input }
        ],
        userProfile
      };
      console.log('[AICoachChat] Invoking jumps-ai-coach with payload:', payload);

      const response: any = await invokeWithTimeout(payload);

      console.log('[AICoachChat] Function response:', response);

      if (response.error) {
        throw new Error(response.error.message || 'Failed to get response');
      }

      const aiText = extractAiMessage(response);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiText || 'No response received from AI.',
        timestamp: new Date()
      };
      if (!aiText) {
        console.warn('[AICoachChat] Unexpected AI response shape:', response);
        toast({
          title: 'AI response issue',
          description: 'Received an unexpected response from the AI. Please try again.',
          variant: 'destructive'
        });
      }

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update existing jump with chat refinements
      if (currentJumpId && aiText.trim()) {
        try {
          await updateJump(currentJumpId, {
            title: jumpName || extractTitle(aiText),
            summary: extractSummary(aiText),
            full_content: aiText
          });
          
          if (onPlanGenerated) {
            onPlanGenerated(aiText);
          }
        } catch (error) {
          console.error('Error updating jump during chat:', error);
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Chat error',
        description: error?.message || 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      stopLoadingTimer();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied!',
      description: 'Message copied to clipboard'
    });
  };

  const downloadPlan = () => {
    const planContent = messages
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .join('\n\n---\n\n');
    
    const blob = new Blob([planContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-ai-transformation-plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded!',
      description: 'Your AI transformation plan has been downloaded'
    });
  };

  // If hideChat is true, just run the initial generation without showing chat UI
  if (hideChat) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Generating your personalized Jump Plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Jumps Studio</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Powered by ChatGPT • {userProfile.currentRole} in {userProfile.industry}
                </p>
              </div>
            </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadPlan}>
              <Download className="h-4 w-4 mr-2" />
              Download Plan
            </Button>
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack}>
                New Profile
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            <div className="space-y-6 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 bg-gradient-to-br from-primary/10 to-primary/5">
                      <AvatarFallback className="p-0">
                        <img 
                          src="/lovable-uploads/156b282b-1e93-436c-914a-a886a6a5cdfd.png" 
                          alt="JumpinAI" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="text-sm leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMessage(message.content)}
                          className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 bg-primary">
                      <AvatarFallback>
                        <User className="h-4 w-4 text-primary-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 bg-gradient-to-br from-primary/10 to-primary/5">
                    <AvatarFallback className="p-0">
                      <img 
                        src="/lovable-uploads/156b282b-1e93-436c-914a-a886a6a5cdfd.png" 
                        alt="JumpinAI" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted/50 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      <span className="text-sm text-muted-foreground">
                        Thinking for {loadingTime}s...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-6 border-t">
            {!isPaidUser ? (
              <div className="text-center py-4 space-y-3">
                <div className="flex justify-center">
                  <div className="p-3 rounded-full bg-muted">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Premium Feature</h3>
                  <p className="text-sm text-muted-foreground">
                    Chat refinement is available for premium subscribers only.
                  </p>
                </div>
                <Button 
                  variant="default" 
                  onClick={() => window.location.href = '/pricing'}
                  className="mt-2"
                >
                  Upgrade to Premium
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about AI tools, strategies, implementation plans, or request a comprehensive transformation roadmap..."
                  className="min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}