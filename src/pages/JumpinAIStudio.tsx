import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Send } from 'lucide-react';
import Navigation from '@/components/Navigation';

const JumpinAIStudio = () => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      // TODO: Handle message sending
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Helmet>
        <title>JumpinAI Studio - AI-Powered Transformation Workspace</title>
        <meta name="description" content="Your AI-powered workspace for creating and managing strategic transformations with intelligent guidance." />
      </Helmet>
      
      <div className="min-h-screen scroll-snap-container bg-gradient-to-br from-background via-background/90 to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60">
        {/* Enhanced floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 dark:bg-gradient-to-br dark:from-gray-800/30 dark:to-gray-700/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/15 to-secondary/5 dark:bg-gradient-to-tr dark:from-gray-700/25 dark:to-gray-600/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-accent/10 dark:bg-gradient-radial dark:from-gray-800/20 dark:to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-secondary/8 to-transparent dark:bg-gradient-to-tr dark:from-gray-600/15 dark:to-transparent rounded-full blur-xl"></div>
        </div>
        
        <Navigation />
        
        <main className="relative pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Main Chat Interface */}
            <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
              <div className="w-full max-w-4xl animate-fade-in-up">
                
                {/* Glass Morphism Chat Container */}
                <div className="glass-dark rounded-3xl shadow-modern-lg border border-white/10 dark:border-white/20 overflow-hidden">
                  
                  {/* Chat Messages Area */}
                  <div className="h-[600px] p-8 overflow-y-auto">
                    <div className="flex flex-col space-y-6">
                      
                      {/* Welcome Message */}
                      <div className="flex justify-center">
                        <div className="glass rounded-2xl p-6 max-w-md text-center animate-scale-in">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 dark:from-white/20 dark:to-white/10 flex items-center justify-center mx-auto mb-4">
                            <div className="w-6 h-6 rounded-full bg-primary/60 dark:bg-white/60 animate-pulse"></div>
                          </div>
                          <p className="text-foreground/90 font-medium mb-2">Welcome to JumpinAI Studio</p>
                          <p className="text-muted-foreground text-sm">
                            Your AI-powered workspace is ready. What would you like to create today?
                          </p>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                  
                  {/* Chat Input Area */}
                  <div className="p-6 border-t border-white/10 dark:border-white/20 bg-gradient-to-r from-white/5 to-white/10 dark:from-black/20 dark:to-black/30">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything about your transformation journey..."
                          className="w-full min-h-[80px] max-h-[200px] p-4 glass rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/60 text-foreground bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/30"
                          rows={3}
                        />
                      </div>
                      <button 
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className="modern-button bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:from-muted disabled:to-muted text-primary-foreground disabled:text-muted-foreground px-6 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                      >
                        <Send className="w-5 h-5" />
                        Send
                      </button>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button className="glass px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-white/10">
                        💡 Generate Ideas
                      </button>
                      <button className="glass px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-white/10">
                        🎯 Set Goals
                      </button>
                      <button className="glass px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-white/10">
                        📋 Create Plan
                      </button>
                      <button className="glass px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-white/10">
                        🚀 Get Started
                      </button>
                    </div>
                  </div>
                  
                </div>
                
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default JumpinAIStudio;