import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';

const JumpinAIStudio = () => {
  return (
    <>
      <Helmet>
        <title>JumpinAI Studio - AI-Powered Transformation Workspace</title>
        <meta name="description" content="Your AI-powered workspace for creating and managing strategic transformations with intelligent guidance." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />
        
        <main className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center py-12">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text-primary mb-6">
                JumpinAI Studio
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Your AI-powered workspace for creating and managing strategic transformations
              </p>
            </div>
            
            {/* Chat Interface Container */}
            <div className="max-w-4xl mx-auto pb-20">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl shadow-2xl p-8">
                <div className="min-h-[500px] flex flex-col">
                  {/* Chat Messages Area */}
                  <div className="flex-1 mb-6">
                    <div className="bg-muted/30 rounded-2xl p-6 text-center">
                      <p className="text-muted-foreground text-lg">
                        Welcome to your AI Studio workspace. Start a conversation to begin your transformation journey.
                      </p>
                    </div>
                  </div>
                  
                  {/* Chat Input Area */}
                  <div className="border-t border-border/30 pt-6">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <textarea
                          placeholder="Type your message here..."
                          className="w-full min-h-[100px] p-4 bg-background/50 border border-border/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        />
                      </div>
                      <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl">
                        Send
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