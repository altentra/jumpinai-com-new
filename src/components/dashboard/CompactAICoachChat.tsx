import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { supabase } from '@/integrations/supabase/client';
import { Bot, User, Send, Sparkles, Lock } from 'lucide-react';
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

interface CompactAICoachChatProps {
  userProfile: UserProfile;
  onPlanGenerated?: (data: PlanGeneratedData) => void;
  onJumpSaved?: (jumpId: string) => void;
  initialPlan?: string;
  isRefinementMode?: boolean;
  currentJumpId?: string | null;
  jumpName?: string;
  isNewJump?: boolean;
}

export default function CompactAICoachChat({ 
  userProfile, 
  onPlanGenerated,
  onJumpSaved,
  initialPlan = '',
  isRefinementMode = false,
  currentJumpId = null,
  jumpName = '',
  isNewJump = true
}: CompactAICoachChatProps) {
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
  
  const formatPlanToText = (plan: any): string => {
    if (!plan || typeof plan !== 'object') return '';
    const title = plan.title || 'Your AI-Generated Jump Plan';
    const summary = plan.executive_summary || '';
    let out = `# ${title}`;
    if (summary) out += `\n\n${summary}`;
    return out.trim();
  };

  const extractAiMessage = (response: any): string => {
    if (typeof response === 'string') return response;
    if (response?.choices?.[0]?.message?.content) return response.choices[0].message.content;
    if (response?.content) return response.content;
    if (response?.data?.choices?.[0]?.message?.content) return response.data.choices[0].message.content;
    return JSON.stringify(response, null, 2);
  };

  useEffect(() => {
    if ((!isRefinementMode || !hasGeneratedRef.current) && userProfile) {
      const initializeChat = async () => {
        hasGeneratedRef.current = true;
        
        if (isRefinementMode) {
          setMessages([{
            id: Date.now().toString(),
            role: 'assistant',
            content: "I can help you refine your transformation plan. What would you like to adjust or improve?",
            timestamp: new Date()
          }]);
        } else {
          setMessages([{
            id: Date.now().toString(),
            role: 'assistant',
            content: "I'll create your personalized transformation plan based on your profile. Let me analyze your information and generate a comprehensive roadmap...",
            timestamp: new Date()
          }]);

          setIsLoading(true);
          startLoadingTimer();

          try {
            const response = await invokeWithTimeout({
              messages: [],
              userProfile,
              jumpName: jumpName || `${userProfile.currentRole} Transformation Plan`,
              currentJumpId,
              isNewJump
            });

            const assistantMessage = extractAiMessage(response.data);
            
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              role: 'assistant', 
              content: assistantMessage,
              timestamp: new Date()
            }]);

            if (response.data?.comprehensivePlan || response.data?.structuredPlan || response.data?.plan) {
              const plan = response.data.comprehensivePlan || response.data.structuredPlan || response.data.plan;
              onPlanGenerated?.({
                content: formatPlanToText(plan),
                comprehensivePlan: plan,
                structuredPlan: plan
              });
            } else {
              onPlanGenerated?.({ content: assistantMessage });
            }

            if (response.data?.jumpId) {
              onJumpSaved?.(response.data.jumpId);
              toast({
                title: "Jump Plan Created!",
                description: "Your transformation plan has been saved successfully.",
              });
            }

          } catch (error: any) {
            console.error('Error generating plan:', error);
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `I apologize, but there was an error generating your plan: ${error.message || 'Unknown error'}. Please try again.`,
              timestamp: new Date()
            }]);
          } finally {
            setIsLoading(false);
            stopLoadingTimer();
          }
        }
      };

      initializeChat();
    }
  }, [userProfile, isRefinementMode, jumpName, currentJumpId, isNewJump]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!isPaidUser) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to continue chatting with your AI coach.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    startLoadingTimer();

    try {
      const response = await invokeWithTimeout({
        messages: [...messages, userMessage],
        userProfile,
        jumpName: jumpName || `${userProfile.currentRole} Transformation Plan`,
        currentJumpId,
        isNewJump: false
      });

      const assistantMessage = extractAiMessage(response.data);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date()
      }]);

      if (response.data?.comprehensivePlan || response.data?.structuredPlan || response.data?.plan) {
        const plan = response.data.comprehensivePlan || response.data.structuredPlan || response.data.plan;
        onPlanGenerated?.({
          content: formatPlanToText(plan),
          comprehensivePlan: plan,
          structuredPlan: plan
        });
      } else {
        onPlanGenerated?.({ content: assistantMessage });
      }

      if (response.data?.jumpId && response.data.jumpId !== currentJumpId) {
        onJumpSaved?.(response.data.jumpId);
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but there was an error processing your message: ${error.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      }]);
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

  return (
    <div className="h-80 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border/30">
        <Bot className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">AI Coach</span>
        {isLoading && (
          <div className="flex items-center gap-2 ml-auto">
            <Sparkles className="h-3 w-3 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Thinking... {loadingTime}s</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3">
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    <Bot className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[85%] rounded-lg p-2 text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.role === 'assistant' ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-sm max-w-none prose-headings:text-xs prose-p:text-xs prose-li:text-xs"
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
              
              {message.role === 'user' && (
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  <Bot className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-2">
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border/30">
        {!isPaidUser ? (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Upgrade to premium to chat with your AI coach</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI coach for guidance..."
              className="min-h-[2.5rem] max-h-20 resize-none text-sm"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="shrink-0"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}