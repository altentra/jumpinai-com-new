import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, Clock, User, Lock, CheckCircle, Zap, Target, Brain, Rocket, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { guestLimitService } from '@/services/guestLimitService';
import JumpResultDisplay from '@/components/JumpResultDisplay';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import MiniFooter from '@/components/MiniFooter';

interface StudioFormData {
  goals: string;
  challenges: string;
  industry: string;
  ai_experience: string;
  urgency: string;
  budget: string;
}

const JumpinAIStudio: React.FC = () => {
  const [formData, setFormData] = useState<StudioFormData>({
    goals: '',
    challenges: '',
    industry: '',
    ai_experience: '',
    urgency: '',
    budget: ''
  });

  const [guestCanUse, setGuestCanUse] = useState(true);
  const [guestUsageCount, setGuestUsageCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jumpResult, setJumpResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    checkGuestLimits();
  }, []);

  // Load saved form data for authenticated users
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadSavedFormData();
    }
  }, [isAuthenticated, user]);

  const loadSavedFormData = async () => {
    // SECURITY: Only load data for authenticated users with verified user ID
    if (!isAuthenticated || !user?.id) {
      console.log('No authenticated user - keeping empty form fields');
      return;
    }
    
    try {
      console.log('Loading saved form data for authenticated user:', user.id);
      
      // SECURITY: Query with explicit user_id filter to ensure data isolation
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id) // CRITICAL: Only get data for THIS specific user
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading saved form data:', error);
        return;
      }

      if (profiles) {
        console.log('Populating form with user saved data');
        setFormData(prev => ({
          goals: profiles.goals || prev.goals,
          challenges: profiles.challenges || prev.challenges,
          industry: profiles.industry || prev.industry,
          ai_experience: profiles.experience_level || prev.ai_experience,
          urgency: profiles.time_commitment || prev.urgency,
          budget: profiles.budget || prev.budget
        }));
      }
    } catch (error) {
      console.error('Unexpected error loading saved form data:', error);
    }
  };

  const saveFormData = async (data: StudioFormData) => {
    // SECURITY: Only save data for authenticated users with verified user ID
    if (!isAuthenticated || !user?.id) {
      console.log('No authenticated user - not saving form data');
      return;
    }

    try {
      console.log('Saving form data for authenticated user:', user.id);
      
      // SECURITY: Always set user_id explicitly to prevent data leakage
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id, // CRITICAL: Explicit user_id ensures data belongs to current user
          goals: data.goals,
          challenges: data.challenges,
          industry: data.industry,
          ai_experience: data.ai_experience,
          urgency: data.urgency,
          budget: data.budget,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving form data:', error);
      } else {
        console.log('Form data saved successfully');
      }
    } catch (error) {
      console.error('Unexpected error saving form data:', error);
    }
  };

  const checkGuestLimits = async () => {
    try {
      const { canUse, usageCount } = await guestLimitService.checkGuestLimit();
      setGuestCanUse(canUse);
      setGuestUsageCount(usageCount);
    } catch (error) {
      console.error('Error checking guest limits:', error);
    }
  };

  const handleGenerate = async () => {
    // Validate required fields
    if (!formData.goals.trim() || !formData.challenges.trim()) {
      toast.error('Please fill in your goals and challenges');
      return;
    }

    // Check guest limits
    if (!isAuthenticated && !guestCanUse) {
      toast.error('You\'ve reached the guest limit. Please sign up to continue.');
      return;
    }

    try {
      setIsGenerating(true);
      setShowResult(false);
      
      // Save form data for logged-in users
      if (isAuthenticated && user?.id) {
        await saveFormData(formData);
      }

      // Record guest usage if not authenticated
      if (!isAuthenticated) {
        await guestLimitService.recordGuestUsage();
      }

      // Generate Jump using jumpinai-coach edge function
      const { data: result, error } = await supabase.functions.invoke('jumps-ai-coach', {
        body: { 
          profile: formData,
          userId: user?.id || null
        }
      });

      if (error) {
        throw error;
      }

      setJumpResult(result);
      setShowResult(true);

      // Update guest limits
      if (!isAuthenticated) {
        setGuestCanUse(false);
        setGuestUsageCount(1);
      }

      if (result?.jump_id && isAuthenticated) {
        toast.success('Your Jump in AI has been saved to your dashboard!');
      } else if (!isAuthenticated) {
        toast.success('Your Jump in AI is ready! Sign up to save and access more features.');
      }

    } catch (error) {
      console.error('Error generating Jump:', error);
      toast.error('Failed to generate your Jump in AI. Please try again.');
      setShowResult(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (field: keyof StudioFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Helmet>
        <title>Jump in AI Studio - AI Transformation Studio | Create Your Jump</title>
        <meta name="description" content="Create your personalized AI transformation plan with our intelligent studio. Get custom prompts, workflows, blueprints, and strategies tailored to your goals and challenges." />
        <meta name="keywords" content="AI transformation, AI studio, business automation, AI strategy, custom AI prompts, AI workflows, AI blueprints" />
        <link rel="canonical" href="https://jumpinai.com/jumpinai-studio" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Jump in AI Studio - Create Your AI Transformation Plan" />
        <meta property="og:description" content="Get a personalized AI transformation plan with custom prompts, workflows, and strategies. Transform your business with AI in minutes." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jumpinai.com/jumpinai-studio" />
        
        {/* Twitter Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Jump in AI Studio - AI Transformation Studio" />
        <meta name="twitter:description" content="Create your personalized AI transformation plan with custom prompts, workflows, and strategies." />
        
        {/* Schema.org markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Jump in AI Studio",
            "description": "AI transformation studio for creating personalized business automation plans",
            "url": "https://jumpinai.com/jumpinai-studio",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

      <Navigation />
      
      <main className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-background via-background/90 to-primary/5 dark:bg-gradient-to-br dark:from-black dark:via-gray-950/90 dark:to-gray-900/60">
        {/* Enhanced floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 dark:bg-gradient-to-br dark:from-gray-800/30 dark:to-gray-700/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/15 to-secondary/5 dark:bg-gradient-to-tr dark:from-gray-700/25 dark:to-gray-600/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-accent/10 dark:bg-gradient-radial dark:from-gray-800/20 dark:to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent dark:bg-gradient-to-br dark:from-gray-700/20 dark:to-transparent rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-secondary/8 to-transparent dark:bg-gradient-to-tr dark:from-gray-600/15 dark:to-transparent rounded-full blur-xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Authentication Status - Compact Corner Display */}
          <div className="fixed top-24 right-4 z-20 flex items-center gap-2 p-2 glass rounded-lg border border-white/20 text-sm">
            {isAuthenticated ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Authenticated
              </Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                <Lock className="w-3 h-3 mr-1" />
                Guest ({guestCanUse ? `${1 - guestUsageCount} left` : 'Sign up'})
              </Badge>
            )}
          </div>

          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-primary-bright bg-clip-text text-transparent">
              JumpinAI Studio
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Generate your personalized Jump that includes: A step-by-step strategic action plan, set of 4 prompts, set of 4 workflows, set of 4 blueprints, set of 4 strategies.
            </p>
          </div>

          {/* Main Form */}
          <Card className="glass border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                Tell Us About Your Goals
              </CardTitle>
              <CardDescription className="text-center">
                The more specific you are, the better we can tailor your Jump
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="goals" className="text-base font-medium">
                    What are your main goals? *
                  </Label>
                  <Textarea
                    id="goals"
                    placeholder="e.g., Automate customer service, improve sales processes, streamline operations..."
                    value={formData.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    className="min-h-[120px] glass border-white/20 resize-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="challenges" className="text-base font-medium">
                    What challenges are you facing? *
                  </Label>
                  <Textarea
                    id="challenges"
                    placeholder="e.g., Manual processes taking too much time, inconsistent customer experience, data scattered across systems..."
                    value={formData.challenges}
                    onChange={(e) => handleInputChange('challenges', e.target.value)}
                    className="min-h-[120px] glass border-white/20 resize-none"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-base font-medium">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                    <SelectTrigger className="glass border-white/20">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="retail">Retail/E-commerce</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="real-estate">Real Estate</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="marketing">Marketing/Advertising</SelectItem>
                      <SelectItem value="legal">Legal Services</SelectItem>
                      <SelectItem value="hospitality">Hospitality</SelectItem>
                      <SelectItem value="non-profit">Non-Profit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai_experience" className="text-base font-medium">AI Experience Level</Label>
                  <Select value={formData.ai_experience} onValueChange={(value) => handleInputChange('ai_experience', value)}>
                    <SelectTrigger className="glass border-white/20">
                      <SelectValue placeholder="Select your AI experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (New to AI)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (Some AI experience)</SelectItem>
                      <SelectItem value="advanced">Advanced (Regular AI user)</SelectItem>
                      <SelectItem value="expert">Expert (AI implementation experience)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="urgency" className="text-base font-medium">Timeline Urgency</Label>
                  <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                    <SelectTrigger className="glass border-white/20">
                      <SelectValue placeholder="How quickly do you need results?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate (This week)</SelectItem>
                      <SelectItem value="urgent">Urgent (This month)</SelectItem>
                      <SelectItem value="standard">Standard (Within 3 months)</SelectItem>
                      <SelectItem value="flexible">Flexible (When ready)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-base font-medium">Budget Range</Label>
                  <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                    <SelectTrigger className="glass border-white/20">
                      <SelectValue placeholder="What's your budget range?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal (Under $1,000)</SelectItem>
                      <SelectItem value="small">Small ($1,000 - $5,000)</SelectItem>
                      <SelectItem value="moderate">Moderate ($5,000 - $15,000)</SelectItem>
                      <SelectItem value="substantial">Substantial ($15,000 - $50,000)</SelectItem>
                      <SelectItem value="enterprise">Enterprise ($50,000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-6">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || (!isAuthenticated && !guestCanUse)}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary via-primary-glow to-primary-bright hover:opacity-90 transition-all duration-300 shadow-glow hover:shadow-glow-intense disabled:opacity-50"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Generating Your Jump in AI...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6" />
                      Generate My Jump in AI
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Result Display */}
          {showResult && jumpResult && (
            <div className="mt-8">
              <JumpResultDisplay 
                fullContent={jumpResult.full_content || jumpResult.fullContent || ''} 
                structuredPlan={jumpResult.structured_plan || jumpResult.structuredPlan}
                comprehensivePlan={jumpResult.comprehensive_plan || jumpResult.comprehensivePlan}
                components={{
                  prompts: jumpResult.prompts || [],
                  workflows: jumpResult.workflows || [],
                  blueprints: jumpResult.blueprints || [], 
                  strategies: jumpResult.strategies || []
                }}
                isAuthenticated={isAuthenticated}
                jumpId={jumpResult.jump_id || jumpResult.jumpId}
              />
            </div>
          )}
        </div>
      </main>
      
      <MiniFooter />
    </>
  );
};

export default JumpinAIStudio;