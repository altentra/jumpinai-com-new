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

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/hooks/useAuth';
import { safeParseJSON } from '@/utils/safeJson';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PlanGeneratedData {
  content: string;
  structuredPlan?: any;
  comprehensivePlan?: any;
}

interface AICoachChatProps {
  userProfile: UserProfile;
  onBack?: () => void;
  onPlanGenerated?: (data: PlanGeneratedData) => void;
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
  const invokeWithTimeout = async (payload: any, ms = 240000): Promise<any> => {
    return await Promise.race([
      supabase.functions.invoke('jumps-ai-coach', { body: payload }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Generation timed out (~240s). Please try again.')), ms))
    ]);
  };
  
  // Format a structured plan into a concise readable text (fallback display + saving)
  const formatPlanToText = (plan: any): string => {
    if (!plan || typeof plan !== 'object') return '';
    const title = plan.title || 'Your AI-Generated Jump Plan';
    const summary = plan.executive_summary || '';
    // Prefer a short header + summary to keep UI responsive
    let out = `# ${title}`;
    if (summary) out += `\n\n${summary}`;
    return out.trim();
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
          
          // If we have a structured plan but no message, synthesize a minimal text
          const sp = resp?.data?.structured_plan;
          if (sp && typeof sp === 'object') {
            const text = formatPlanToText(sp);
            if (text) return text;
          }
          
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

    const tryParseJSON = (text: string): any | null => safeParseJSON(text);

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
          generateComponents: false
        };
        console.log('[AICoachChat] Auto-invoking jumps-ai-coach with payload:', payload);
        const response: any = await invokeWithTimeout(payload);
        console.log('[AICoachChat] Auto-generation response:', response);
        if (response?.error) {
          throw new Error(response.error.message || 'Failed to generate initial plan');
        }

        let aiText = extractAiMessage(response);
        let structuredPlan: any = response?.data?.structured_plan || null;
        if (!structuredPlan && aiText) {
          structuredPlan = tryParseJSON(aiText);
        }
        if ((!aiText || !aiText.trim()) && structuredPlan) {
          aiText = formatPlanToText(structuredPlan);
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiText && aiText.trim() ? aiText : 'No response received from AI.',
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
        setMessages((prev) => [...prev, assistantMessage]);

        if (onPlanGenerated) {
          onPlanGenerated({
            content: aiText || '',
            structuredPlan: structuredPlan || null,
            comprehensivePlan: structuredPlan || null,
          });
        }

        // Save or update Jump if we have useful data
        if ((aiText && aiText.trim()) || structuredPlan) {
          try {
            if (currentJumpId && !isNewJump) {
              const textForMeta = aiText || formatPlanToText(structuredPlan);
              const updatedJump = await updateJump(currentJumpId, {
                title: jumpName || extractTitle(textForMeta),
                summary: extractSummary(textForMeta),
                full_content: textForMeta,
                structured_plan: structuredPlan || null,
                comprehensive_plan: structuredPlan || null,
                jump_type: 'comprehensive',
              });
              if (updatedJump && onJumpSaved) {
                onJumpSaved(updatedJump.id);
                toast({ title: 'Jump Updated!', description: 'Your AI transformation plan has been updated.' });
              }
            } else if (isNewJump) {
              const textForMeta = aiText || formatPlanToText(structuredPlan);
              const title = jumpName || extractTitle(textForMeta);
              const summary = extractSummary(textForMeta);
              const savedJump = await createJump({
                profile_id: userProfile.id,
                title,
                summary,
                full_content: textForMeta,
                structured_plan: structuredPlan || null,
                comprehensive_plan: structuredPlan || null,
                jump_type: 'comprehensive',
              });
              if (savedJump && onJumpSaved) {
                onJumpSaved(savedJump.id);
                toast({ title: 'Jump Saved!', description: 'Your AI transformation plan has been saved to your library.' });
                // Kick off components generation in background
                try {
                  toast({ title: 'Generating Jump Components', description: 'Creating prompts, workflows, blueprints, and strategies...' });
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
                    toast({ title: 'Components Ready', description: `${msg}. ${counts}. If you don’t see them yet, hit refresh in their tabs in ~10–20s.` });
                  } else {
                    toast({ title: 'Components Requested', description: "Generation requested. If items don’t appear, refresh the page in a few seconds." });
                  }
                  if (expected && (expected.workflows === 0 || expected.blueprints === 0 || expected.strategies === 0)) {
                    console.warn('[AICoachChat] Some component categories were empty:', expected);
                    toast({ title: 'Heads up', description: 'Some categories returned empty. You can retry generation from Jumps Studio.' });
                  }
                } catch (genErr) {
                  console.error('Error generating Jump components:', genErr);
                  toast({ title: 'Component generation failed', description: 'Your plan is saved, but components failed to generate. You can retry from Jumps Studio.', variant: 'destructive' });
                }
              }
            }
          } catch (saveErr) {
            console.error('Error saving/updating jump:', saveErr);
            toast({ title: 'Save Error', description: 'Jump generated but failed to save to library', variant: 'destructive' });
          }
        }
      } catch (err) {
        console.error('Error generating initial plan:', err);
        toast({ title: 'Generation error', description: (err as any)?.message || 'Failed to generate your plan. You can try again by sending a message.', variant: 'destructive' });
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

      let aiText = extractAiMessage(response);
      // Try structured plan extraction
      let structuredPlan = (response as any)?.data?.structured_plan || null;
      if (!structuredPlan && aiText) {
        structuredPlan = safeParseJSON(aiText);
      }
      if ((!aiText || !aiText.trim()) && structuredPlan) {
        aiText = formatPlanToText(structuredPlan);
      }

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
      if (currentJumpId && (aiText?.trim() || structuredPlan)) {
        try {
          await updateJump(currentJumpId, {
            title: jumpName || extractTitle(aiText || formatPlanToText(structuredPlan)),
            summary: extractSummary(aiText || formatPlanToText(structuredPlan)),
            full_content: aiText || formatPlanToText(structuredPlan),
            structured_plan: structuredPlan || null,
            comprehensive_plan: structuredPlan || null,
            jump_type: 'comprehensive'
          });
          
          if (onPlanGenerated) {
            onPlanGenerated({
              content: aiText || '',
              structuredPlan: structuredPlan || null,
              comprehensivePlan: structuredPlan || null
            });
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
    <div id="ai-chat" className="max-w-6xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      <Card className="flex-1 flex flex-col bg-gradient-to-br from-card/95 to-primary/5 backdrop-blur-xl rounded-3xl border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-6 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 backdrop-blur-sm border-b border-primary/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg backdrop-blur-sm">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Jumps Studio</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Powered by ChatGPT • {userProfile.currentRole} in {userProfile.industry}
                </p>
              </div>
            </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={downloadPlan} className="rounded-2xl border-primary/30 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 hover:scale-105">
              <Download className="h-4 w-4 mr-2" />
              Download Plan
            </Button>
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack} className="rounded-2xl border-primary/30 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                New Profile
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-8 py-6" ref={scrollAreaRef}>
            <div className="space-y-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
<Avatar className="h-10 w-10 bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20 shadow-lg backdrop-blur-sm">
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
                    className={`max-w-[80%] rounded-3xl p-6 shadow-lg backdrop-blur-sm border transition-all duration-300 hover:shadow-xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground border-primary/30 shadow-primary/20'
                        : 'bg-gradient-to-br from-card/90 to-primary/5 border-primary/20 shadow-primary/10'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                        {(() => {
                          const parsed = safeParseJSON(message.content);
                          const looksLikeJSON = !!parsed || /\s*```/.test(message.content) || /^[{\[]/.test(message.content.trim());
                          if (looksLikeJSON) {
                            return (
                              <div className="space-y-3 bg-primary/5 p-4 rounded-2xl border border-primary/20">
                                <div className="font-semibold text-foreground flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                  Structured Jump Plan received
                                </div>
                                <div className="text-muted-foreground">Your plan is applied to the tabbed view above.</div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all duration-300"
                                  onClick={() => {
                                    try { scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
                                  }}
                                >
                                  View Plan
                                </Button>
                              </div>
                            );
                          }
                          return (
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({children}) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                                ul: ({children}) => <ul className="space-y-1 my-3">{children}</ul>,
                                ol: ({children}) => <ol className="space-y-1 my-3">{children}</ol>,
                                li: ({children}) => <li className="leading-relaxed">{children}</li>,
                                h1: ({children}) => <h1 className="text-lg font-bold mb-3 text-foreground">{children}</h1>,
                                h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
                                h3: ({children}) => <h3 className="text-sm font-semibold mb-2 text-foreground">{children}</h3>,
                                blockquote: ({children}) => <blockquote className="border-l-4 border-primary/30 pl-4 my-3 italic bg-primary/5 rounded-r-lg p-3">{children}</blockquote>,
                                code: ({children}) => <code className="bg-primary/10 px-2 py-1 rounded text-xs font-mono">{children}</code>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-primary/20">
                      <div className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMessage(message.content)}
                          className="h-8 w-8 p-0 opacity-70 hover:opacity-100 hover:bg-primary/10 rounded-full transition-all duration-300"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-10 w-10 bg-gradient-to-br from-primary/90 to-primary/70 border-2 border-primary/30 shadow-lg">
                      <AvatarFallback>
                        <User className="h-5 w-5 text-primary-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20 shadow-lg backdrop-blur-sm">
                    <AvatarFallback className="p-0">
                      <img 
                        src="/lovable-uploads/156b282b-1e93-436c-914a-a886a6a5cdfd.png" 
                        alt="JumpinAI" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gradient-to-br from-card/90 to-primary/5 rounded-3xl p-6 shadow-lg backdrop-blur-sm border border-primary/20 flex items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                        <span className="text-sm text-muted-foreground">
                          {loadingTime < 10
                            ? 'Analyzing your profile...'
                            : loadingTime < 30
                            ? 'Drafting your personalized plan...'
                            : loadingTime < 50
                            ? 'Structuring into phases...'
                            : loadingTime < 80
                            ? 'Saving to your library (if logged in)...'
                            : 'Generating components (prompts, workflows, blueprints, strategies)...'} ({loadingTime}s)
                        </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-8 border-t border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 backdrop-blur-sm">
            {!isPaidUser ? (
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg backdrop-blur-sm">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-2">Premium Feature</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Chat refinement is available for premium subscribers only.
                  </p>
                </div>
                <Button 
                  variant="default" 
                  onClick={() => window.location.href = '/pricing'}
                  className="mt-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 px-8"
                >
                  Upgrade to Premium
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about AI tools, strategies, implementation plans, or request a comprehensive transformation roadmap..."
                  className="min-h-[80px] resize-none rounded-2xl border-primary/30 bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
                  disabled={false}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="self-end h-20 px-8 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 gap-2"
                >
                  <Send className="h-5 w-5" />
                  Send
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}