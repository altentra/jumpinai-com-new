import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, User, Send, Sparkles, Download, Copy } from 'lucide-react';
import type { UserProfile } from './UserProfileForm';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AICoachChatProps {
  userProfile: UserProfile;
  onBack: () => void;
}

const AICoachChat: React.FC<AICoachChatProps> = ({ userProfile, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const invokeWithTimeout = async (payload: any, ms = 45000): Promise<any> => {
    return await Promise.race([
      supabase.functions.invoke('jumps-ai-coach', { body: payload }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Generation timed out. Please try again.')), ms))
    ]);
  };
  
  useEffect(() => {
    // Welcome message when chat starts and auto-generate initial plan
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `Welcome to your personalized AI Transformation Coach! 🚀

I've reviewed your profile and I'm excited to help you create your custom "Jump" plan. Based on your role as a ${userProfile.currentRole} in ${userProfile.industry}, I can see tremendous opportunities for AI integration.

I'll generate a comprehensive plan for you now. You can refine it with chat after.`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);

    // Auto-generate an initial comprehensive Jump plan
    const generateInitialPlan = async () => {
      setIsLoading(true);
      try {
        const initialPrompt =
          "Using the provided profile context, generate a fully comprehensive, professional, elite-level, actionable 'Jump' plan following the RESPONSE STRUCTURE from the system prompt. Be specific with tools, steps, timelines, and metrics. Tailor everything to the user's role, industry, experience, time, and budget. Use clear headings and bullet points.";
        const payload = {
          messages: [{ role: 'user', content: initialPrompt }],
          userProfile
        };
        console.log('[AICoachChat] Auto-invoking jumps-ai-coach with payload:', payload);
        const response: any = await invokeWithTimeout(payload);
        console.log('[AICoachChat] Auto-generation response:', response);
        if (response.error) {
          throw new Error(response.error.message || 'Failed to generate initial plan');
        }
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data?.message || 'No response received from AI.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error: any) {
        console.error('Error generating initial plan:', error);
        toast({
          title: 'Generation error',
          description: error?.message || 'Failed to generate your plan. You can try again by sending a message.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateInitialPlan();
  }, [userProfile]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data?.message || 'No response received from AI.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Chat error',
        description: error?.message || 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
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

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">AI Transformation Coach</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Powered by ChatGPT-5 • {userProfile.currentRole} in {userProfile.industry}
                </p>
              </div>
            </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadPlan}>
              <Download className="h-4 w-4 mr-2" />
              Download Plan
            </Button>
            <Button variant="outline" size="sm" onClick={onBack}>
              New Profile
            </Button>
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
                      <AvatarFallback>
                        <Bot className="h-4 w-4 text-primary" />
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
                    <AvatarFallback>
                      <Bot className="h-4 w-4 text-primary animate-pulse" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-6 border-t">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AICoachChat;