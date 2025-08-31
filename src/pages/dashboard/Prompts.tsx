import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Plus, Search, Star, Bookmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

type PromptTemplate = {
  name: string;
  description: string;
  prompt: string;
  category: string;
};

const freePrompts: PromptTemplate[] = [
  { name: "Product Marketing Brief", description: "Create comprehensive product launch briefs", prompt: "Act as a senior product marketer. Create a 500‑word launch brief for a B2B SaaS feature. Include: 1) narrative, 2) ICP pain, 3) 3 key benefits, 4) messaging pillars, 5) CTA. Tone: confident, concise.", category: "Marketing" },
  { name: "Policy Analysis", description: "Analyze and summarize policy documents", prompt: "You are an operations analyst. Summarize this policy PDF into an SOP with steps, owners, and SLAs. Flag ambiguities and propose fixes.", category: "Analysis" },
  { name: "Executive Summary", description: "Create executive summaries from data", prompt: "As a data storyteller, explain these metrics (paste table) to an executive in 5 bullets. Add a final risk/opportunity section.", category: "Business Intelligence" },
  { name: "Trend Analysis", description: "Analyze current trends with citations", prompt: "Act as a trend analyst. Using fresh web sources, outline the 5 biggest AI regulation changes in 2025 with citations and implications for SaaS founders.", category: "Research" },
];

const proPrompts: PromptTemplate[] = [
  { name: "Strategic Planning Framework", description: "Comprehensive business strategy development", prompt: "You are a senior strategy consultant at McKinsey. Develop a 3-year strategic plan for [COMPANY]. Include: 1) Market analysis with Porter's 5 Forces, 2) SWOT analysis, 3) Strategic objectives with KPIs, 4) Resource allocation plan, 5) Risk mitigation strategies, 6) Implementation roadmap with quarterly milestones. Format as executive presentation.", category: "Strategic Planning" },
  { name: "Investment Pitch Deck", description: "Professional investor presentation", prompt: "Act as a Series A startup founder. Create a compelling 12-slide pitch deck for [STARTUP] raising $5M. Include: Problem, Solution, Market Size, Business Model, Traction, Competition, Go-to-Market, Team, Financials, Use of Funds, Timeline, Contact. Make each slide punchy with clear value props.", category: "Investment" },
  { name: "Financial Model Builder", description: "Comprehensive financial modeling", prompt: "You are a CFO creating a 5-year financial model. Build detailed P&L, cash flow, and balance sheet projections for [BUSINESS]. Include scenario analysis (best/base/worst case), key assumptions, sensitivity analysis, and funding requirements. Present with executive summary and key insights.", category: "Finance" },
  { name: "Legal Contract Analysis", description: "Contract review and risk assessment", prompt: "As a corporate lawyer, analyze this [CONTRACT TYPE] and provide: 1) Key terms summary, 2) Risk assessment with severity ratings, 3) Negotiation recommendations, 4) Potential liability exposure, 5) Missing clauses that should be added, 6) Industry benchmark comparison. Highlight critical issues in red.", category: "Legal" },
  { name: "Market Research Deep Dive", description: "Comprehensive market analysis", prompt: "You are a market research director. Conduct comprehensive analysis of [MARKET] including: 1) Market size and growth projections, 2) Customer segmentation with personas, 3) Competitive landscape with positioning map, 4) Trend analysis and future outlook, 5) Opportunity identification, 6) Go-to-market recommendations. Include data sources and methodology.", category: "Market Research" },
  { name: "Crisis Communication Plan", description: "Emergency response communication strategy", prompt: "Act as a crisis communications expert. Develop a comprehensive crisis response plan for [SCENARIO]. Include: 1) Stakeholder mapping and messaging matrix, 2) Timeline for communications, 3) Key messages for each audience, 4) Media response strategy, 5) Internal communication plan, 6) Reputation recovery tactics, 7) Success metrics and monitoring plan.", category: "Crisis Management" },
  { name: "Product Requirements Document", description: "Detailed product specification", prompt: "You are a senior product manager at a top tech company. Write a comprehensive PRD for [FEATURE]. Include: 1) Problem statement with user research, 2) Success metrics and KPIs, 3) User stories and acceptance criteria, 4) Technical requirements and constraints, 5) UI/UX guidelines, 6) Launch plan and rollout strategy, 7) Risk assessment and mitigation.", category: "Product Management" },
  { name: "Sales Strategy Blueprint", description: "Complete sales methodology and process", prompt: "As a VP of Sales, design a comprehensive sales strategy for [PRODUCT/SERVICE]. Include: 1) Target customer profile and buying process, 2) Sales methodology and process stages, 3) Lead generation and qualification framework, 4) Pricing strategy and negotiation guidelines, 5) Sales team structure and compensation, 6) CRM implementation and reporting, 7) Performance metrics and improvement plan.", category: "Sales Strategy" },
  { name: "HR Policy Manual", description: "Complete employee handbook development", prompt: "You are a Chief People Officer. Create a comprehensive employee handbook for [COMPANY SIZE/TYPE]. Include: 1) Company culture and values, 2) Employment policies and procedures, 3) Benefits and compensation structure, 4) Performance management system, 5) Code of conduct and ethics, 6) Diversity and inclusion policies, 7) Remote work guidelines, 8) Legal compliance requirements.", category: "Human Resources" },
  { name: "Digital Transformation Roadmap", description: "Enterprise technology strategy", prompt: "Act as a Chief Digital Officer. Develop a 2-year digital transformation roadmap for [INDUSTRY/COMPANY]. Include: 1) Current state assessment, 2) Technology stack recommendations, 3) Process automation opportunities, 4) Data strategy and governance, 5) Change management plan, 6) Budget and resource requirements, 7) Risk management and security considerations, 8) Success metrics and milestones.", category: "Digital Transformation" },
  { name: "M&A Due Diligence Checklist", description: "Comprehensive acquisition analysis", prompt: "You are an M&A investment banker. Create a detailed due diligence checklist for acquiring [TARGET COMPANY]. Include: 1) Financial analysis and red flags, 2) Legal and regulatory compliance review, 3) Operational assessment and synergies, 4) Technology and IP evaluation, 5) Market position and competitive analysis, 6) Management team assessment, 7) Integration planning and timeline, 8) Valuation methodology and negotiation strategy.", category: "Mergers & Acquisitions" },
  { name: "ESG Reporting Framework", description: "Sustainability and governance reporting", prompt: "As a Chief Sustainability Officer, develop comprehensive ESG reporting framework for [COMPANY]. Include: 1) Materiality assessment and stakeholder mapping, 2) Environmental impact measurement and targets, 3) Social responsibility initiatives and metrics, 4) Governance structure and transparency measures, 5) Data collection and verification processes, 6) Reporting standards alignment (GRI, SASB, TCFD), 7) Improvement roadmap and accountability measures.", category: "ESG/Sustainability" },
  { name: "Brand Strategy Overhaul", description: "Complete brand repositioning strategy", prompt: "You are a brand strategy director. Redesign brand strategy for [COMPANY] targeting [NEW MARKET]. Include: 1) Brand audit and competitive analysis, 2) Target audience research and personas, 3) Brand positioning and value proposition, 4) Brand identity and messaging framework, 5) Content strategy and channel plan, 6) Implementation timeline and budget, 7) Brand guidelines and governance, 8) Success metrics and tracking plan.", category: "Brand Strategy" },
  { name: "Cybersecurity Assessment", description: "Enterprise security evaluation and planning", prompt: "Act as a Chief Information Security Officer. Conduct comprehensive cybersecurity assessment for [ORGANIZATION]. Include: 1) Current security posture evaluation, 2) Threat landscape analysis and risk assessment, 3) Vulnerability identification and prioritization, 4) Security framework recommendations (NIST, ISO 27001), 5) Incident response and recovery planning, 6) Employee training and awareness program, 7) Budget and resource requirements, 8) Compliance and regulatory considerations.", category: "Cybersecurity" },
  { name: "Global Expansion Strategy", description: "International market entry planning", prompt: "You are a head of international business. Develop market entry strategy for [COMPANY] expanding to [TARGET COUNTRIES]. Include: 1) Market analysis and opportunity assessment, 2) Regulatory and legal requirements, 3) Go-to-market strategy and localization needs, 4) Partnership and distribution strategies, 5) Operational setup and supply chain, 6) Financial projections and investment requirements, 7) Risk assessment and mitigation strategies, 8) Success metrics and timeline.", category: "International Business" }
];

const allPrompts = [...freePrompts, ...proPrompts];

export default function Prompts() {
  const { isAuthenticated, subscription } = useAuth();

  // Use cached subscription data - no API call needed!
  const showAllContent = subscription?.subscribed && subscription.subscription_tier === 'JumpinAI Pro';

  const UpgradeSection = ({ message }: { message: string }) => (
    <div className="bg-muted/50 border border-border rounded-lg p-8 text-center mt-8">
      <Lock className="h-8 w-8 text-muted-foreground mb-3 mx-auto" />
      <p className="text-lg font-medium mb-2">{message}</p>
      <p className="text-muted-foreground mb-4">Upgrade to Pro to gain access to all premium content</p>
      <Button 
        onClick={() => {
          if (!isAuthenticated) {
            window.location.href = '/auth?next=' + encodeURIComponent(window.location.pathname);
          } else {
            window.location.href = '/pricing';
          }
        }}
        className="text-sm"
      >
        {!isAuthenticated ? 'Login to Subscribe' : 'Upgrade to Pro'} - $10/month
      </Button>
    </div>
  );

  const PromptCard = ({ prompt, isBlurred }: { prompt: PromptTemplate; isBlurred?: boolean }) => (
    <Card className={`h-full ${isBlurred ? 'filter blur-[2px] pointer-events-none' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{prompt.name}</CardTitle>
          <Badge variant="secondary">{prompt.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{prompt.description}</p>
        <div>
          <h4 className="font-semibold mb-2">Template:</h4>
          <p className="text-sm bg-muted p-3 rounded italic">
            {prompt.prompt}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-12">
      {/* My Prompts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">My Prompts</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Prompt
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search your prompts..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Favorites
          </Button>
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Saved
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Create Your First Prompt</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start building your personal prompt library
              </p>
              <Button variant="outline" size="sm">Get Started</Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="font-semibold mb-2">✨ Coming Soon</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Save and organize your favorite prompts</li>
            <li>• AI-powered prompt optimization suggestions</li>
            <li>• Collaboration and sharing features</li>
            <li>• Performance analytics and usage stats</li>
            <li>• Template variations and A/B testing</li>
          </ul>
        </div>
      </div>

      {/* JumpinAI Prompts Section */}
      <div className="space-y-6">
        <div className="border-t pt-8">
          <h2 className="text-2xl font-semibold mb-2">JumpinAI Prompts</h2>
          <p className="text-muted-foreground">Ready-to-use prompt templates for maximum AI effectiveness</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(showAllContent ? allPrompts : allPrompts.slice(0, 12)).map((prompt, index) => (
            <PromptCard 
              key={index} 
              prompt={prompt} 
              isBlurred={!showAllContent && index >= 10}
            />
          ))}
        </div>
        
        {!showAllContent && <UpgradeSection message="View more professional prompts" />}
      </div>
    </div>
  );
}
