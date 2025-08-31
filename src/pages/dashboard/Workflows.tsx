import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Plus, Search, Star, Bookmark, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import WorkflowDetailModal from "@/components/WorkflowDetailModal";

type Workflow = {
  name: string;
  description: string;
  steps: string[];
  category: string;
};

const freeWorkflows: Workflow[] = [
  { name: "Content Creation Workflow", description: "Systematic approach to creating high-quality content", steps: ["Define role, audience, constraints, and deliverable length.", "Ask for a structured outline first; iterate on sections.", "Request variations and finalize with style and brand guardrails."], category: "Content" },
  { name: "Document Analysis Workflow", description: "Process for analyzing and summarizing documents", steps: ["Upload/reference source docs; ask for structured SOP.", "Iterate to add owners/SLAs; request ambiguity list.", "Export final SOP with version and change log."], category: "Analysis" },
  { name: "Executive Reporting Workflow", description: "Create executive-ready reports from data", steps: ["Provide table/context; request bullet executive summary.", "Probe on anomalies; ask for 3 hypotheses with tests.", "Finalize with risks, opportunities, and next steps."], category: "Business Intelligence" },
  { name: "Research Workflow", description: "Comprehensive research with citations", steps: ["Ask for current, cited sources; set timeframe.", "Request a pros/cons table and action checklist.", "Deliver an executive brief plus 3 tweet‑length summaries."], category: "Research" },
];

const proWorkflows: Workflow[] = [
  { name: "n8n AI Content Generation Pipeline", description: "Enterprise-scale content automation with multiple AI models", steps: ["Set up content brief intake via forms or API with validation rules", "Route requests through n8n based on content type and complexity", "Orchestrate multiple AI models (GPT-5, Claude, Gemini) for content creation", "Implement quality control with AI-powered review and human approval", "Distribute content across platforms with analytics tracking", "Create feedback loops for continuous pipeline optimization"], category: "AI Content Automation" },
  { name: "n8n Intelligent Customer Support Workflow", description: "AI-powered customer service automation and escalation", steps: ["Capture customer inquiries from multiple channels (email, chat, tickets)", "Use AI to categorize and prioritize support requests automatically", "Route to appropriate AI models for response generation and sentiment analysis", "Implement escalation logic based on complexity and customer tier", "Track resolution times and customer satisfaction scores", "Generate insights and recommendations for support improvement"], category: "Customer Service Automation" },
  { name: "n8n Data Intelligence & Reporting System", description: "Automated business intelligence with AI-powered insights", steps: ["Connect to multiple data sources (CRM, analytics, databases) with scheduling", "Implement data cleaning and transformation using n8n functions", "Apply AI analysis for trend detection and predictive insights", "Generate automated reports with natural language summaries", "Distribute reports to stakeholders via email, Slack, or dashboards", "Monitor data quality and alert on anomalies or significant changes"], category: "Business Intelligence" },
  { name: "n8n Sales Process Automation", description: "Complete sales pipeline automation with AI lead scoring", steps: ["Capture leads from multiple sources with deduplication and enrichment", "Score leads using AI analysis of behavior, demographics, and interactions", "Trigger personalized nurture campaigns based on lead scoring and segment", "Automate follow-up sequences with AI-generated personalized content", "Route qualified leads to appropriate sales representatives automatically", "Track conversion metrics and optimize the pipeline based on performance"], category: "Sales Automation" },
  { name: "n8n HR & Recruitment Automation", description: "Streamlined recruitment process with AI candidate assessment", steps: ["Parse incoming resumes and applications with AI extraction", "Score candidates against job requirements using NLP analysis", "Schedule interviews automatically with calendar integration", "Generate interview questions tailored to candidate background", "Collect and analyze interview feedback with sentiment analysis", "Automate reference checks and onboarding workflow initiation"], category: "HR Automation" },
  { name: "Strategic Planning Workflow", description: "Enterprise-level strategic planning process", steps: ["Conduct comprehensive SWOT and Porter's 5 Forces analysis", "Define 3-year vision with SMART objectives and KPIs", "Develop resource allocation matrix and budget requirements", "Create quarterly milestones with accountability frameworks", "Establish risk mitigation strategies and contingency plans", "Present to board with executive summary and action items"], category: "Strategic Planning" },
  { name: "Product Launch Workflow", description: "End-to-end product launch orchestration", steps: ["Market research and competitive analysis with TAM/SAM calculations", "Product-market fit validation through customer interviews", "Go-to-market strategy with channel partner mapping", "Marketing campaign development across all channels", "Sales enablement and training program rollout", "Launch metrics tracking and optimization protocols"], category: "Product Management" },
  { name: "M&A Due Diligence Workflow", description: "Comprehensive acquisition evaluation process", steps: ["Financial analysis including DCF and comparable company analysis", "Legal and regulatory compliance audit with risk assessment", "Operational synergies identification and quantification", "Technology integration planning and timeline development", "Cultural fit assessment and change management strategy", "Final recommendation with valuation range and negotiation strategy"], category: "Mergers & Acquisitions" },
  { name: "Crisis Management Workflow", description: "Rapid response crisis communication and resolution", steps: ["Immediate threat assessment and stakeholder impact analysis", "Crisis communication team activation with role assignments", "Message development for different stakeholder groups", "Media response strategy and spokesperson preparation", "Internal communication cascade and employee briefings", "Recovery planning and reputation rehabilitation measures"], category: "Crisis Management" },
  { name: "Digital Transformation Workflow", description: "Enterprise-wide technology modernization", steps: ["Current state technology audit and gap analysis", "Future state architecture design with scalability planning", "Change management strategy and stakeholder buy-in", "Phased implementation roadmap with risk mitigation", "Training programs and adoption measurement systems", "Success metrics tracking and continuous improvement"], category: "Digital Transformation" },
  { name: "Investment Evaluation Workflow", description: "Comprehensive investment analysis and decision making", steps: ["Market opportunity assessment with growth projections", "Management team evaluation and track record analysis", "Financial model development with scenario planning", "Risk assessment including market, operational, and regulatory risks", "Due diligence coordination with external advisors", "Investment committee presentation and decision framework"], category: "Investment Analysis" },
  { name: "Regulatory Compliance Workflow", description: "Systematic approach to regulatory adherence", steps: ["Regulatory landscape mapping and requirement identification", "Current compliance gap analysis and risk assessment", "Policy development and procedure documentation", "Implementation planning with training requirements", "Monitoring and reporting system establishment", "Regular audit and continuous improvement processes"], category: "Compliance" },
  { name: "Performance Optimization Workflow", description: "Business performance enhancement methodology", steps: ["KPI identification and baseline measurement establishment", "Root cause analysis using fishbone and 5-why techniques", "Solution development with cost-benefit analysis", "Implementation planning with change management protocols", "Progress monitoring with dashboard and reporting systems", "Continuous improvement and optimization cycles"], category: "Performance Management" },
  { name: "Stakeholder Engagement Workflow", description: "Strategic stakeholder relationship management", steps: ["Stakeholder mapping and influence-interest matrix development", "Communication strategy tailored for each stakeholder group", "Engagement calendar with regular touchpoints and updates", "Feedback collection and sentiment analysis systems", "Issue escalation protocols and resolution tracking", "Relationship health monitoring and improvement initiatives"], category: "Stakeholder Management" },
  { name: "Innovation Pipeline Workflow", description: "Systematic innovation development and commercialization", steps: ["Idea generation through structured brainstorming and market scanning", "Innovation filtering using stage-gate process and scoring criteria", "Proof-of-concept development with MVP testing", "Business case development with market validation", "Scale-up planning with resource allocation and partnerships", "Market launch with adoption tracking and iteration"], category: "Innovation Management" },
  { name: "Supply Chain Optimization Workflow", description: "End-to-end supply chain efficiency improvement", steps: ["Supply chain mapping and bottleneck identification", "Supplier evaluation and rationalization with risk assessment", "Demand forecasting improvement using advanced analytics", "Inventory optimization with safety stock calculations", "Logistics network optimization and cost reduction", "Performance monitoring with supplier scorecards and KPIs"], category: "Supply Chain" },
  { name: "ESG Integration Workflow", description: "Environmental, Social, Governance framework implementation", steps: ["ESG materiality assessment and stakeholder consultation", "Baseline measurement and target setting with science-based goals", "Policy development and governance structure establishment", "Implementation across all business units with training", "Reporting system development aligned with global standards", "External verification and continuous improvement processes"], category: "ESG/Sustainability" }
];

const allWorkflows = [...freeWorkflows, ...proWorkflows];

export default function Workflows() {
  const { isAuthenticated, subscription } = useAuth();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const WorkflowCard = ({ workflow, isBlurred }: { workflow: Workflow; isBlurred: boolean }) => (
    <Card className={`h-full ${isBlurred ? 'filter blur-[2px] pointer-events-none' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{workflow.name}</CardTitle>
          <Badge variant="secondary">{workflow.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{workflow.description}</p>
        <div>
          <h4 className="font-semibold mb-2">Steps:</h4>
          <ol className="text-sm space-y-1">
            {workflow.steps.map((step, index) => (
              <li key={index} className="flex">
                <span className="font-medium mr-2">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-12">
      {/* My Workflows Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">My Workflows</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search your workflows..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Favorites
          </Button>
          <Button variant="outline" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Active
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Create Your First Workflow</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Design and automate your AI processes
              </p>
              <Button variant="outline" size="sm">Get Started</Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="font-semibold mb-2">✨ Coming Soon</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Visual workflow builder with drag-and-drop</li>
            <li>• Automation triggers and conditions</li>
            <li>• Performance tracking and optimization</li>
            <li>• Team collaboration and sharing</li>
            <li>• Integration with popular AI tools</li>
          </ul>
        </div>
      </div>

      {/* JumpinAI Workflows Section */}
      <div className="space-y-6">
        <div className="border-t pt-8">
          <h2 className="text-2xl font-semibold mb-2">JumpinAI Workflows</h2>
          <p className="text-muted-foreground">Systematic approaches to AI-powered productivity</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(showAllContent ? allWorkflows : allWorkflows.slice(0, 6)).map((workflow, index) => (
            <WorkflowCard 
              key={index} 
              workflow={workflow} 
              isBlurred={!showAllContent && index >= 4}
            />
          ))}
        </div>
        
        {!showAllContent && <UpgradeSection message="View more professional workflows" />}
      </div>

      <WorkflowDetailModal 
        workflow={selectedWorkflow}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWorkflow(null);
        }}
      />
    </div>
  );
}
