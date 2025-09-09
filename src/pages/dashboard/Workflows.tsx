import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Plus, Search, Star, Bookmark, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { WorkflowDetailModal } from "@/components/WorkflowDetailModal";

type Workflow = {
  name: string;
  whatItIs: string;
  whatItsFor: string;
  desiredOutcome: string;
  steps: string[];
  topicCategory: 'Text' | 'Image' | 'Video' | 'Audio' | 'Web/App Dev' | 'Workflow/AI Agents';
  category: string;
  description?: string;
};

const freeWorkflows: Workflow[] = [
  { 
    name: "Content Creation Pipeline", 
    whatItIs: "Systematic approach to producing high-quality written content",
    whatItsFor: "Creating consistent, engaging content across multiple channels", 
    desiredOutcome: "Streamlined content production with consistent quality and brand voice",
    steps: ["Define target audience, goals, and key messages", "Research topic thoroughly and gather supporting data", "Create detailed outline with clear structure"], 
    topicCategory: "Text",
    category: "Content Marketing" 
  },
  { 
    name: "Document Analysis Process", 
    whatItIs: "Structured process for analyzing and extracting insights from documents",
    whatItsFor: "Converting complex documents into actionable business intelligence", 
    desiredOutcome: "Clear insights and recommendations from document analysis",
    steps: ["Upload and digitize source documents", "Identify key sections and data points", "Extract and categorize important information"], 
    topicCategory: "Text",
    category: "Business Intelligence" 
  },
];

const proWorkflows: Workflow[] = [
  { 
    name: "Strategic Content Planning", 
    whatItIs: "Advanced content strategy framework for enterprise-level planning",
    whatItsFor: "Building comprehensive content strategies that drive business growth", 
    desiredOutcome: "Data-driven content strategy with measurable business impact",
    steps: ["Conduct comprehensive audience research", "Develop content pillars and themes", "Create content calendar with optimization"], 
    topicCategory: "Text",
    category: "Strategy" 
  },
  { 
    name: "AI-Powered Workflow Automation", 
    whatItIs: "Advanced workflow using AI services and automation platforms",
    whatItsFor: "Building intelligent, scalable business process automation", 
    desiredOutcome: "Fully automated workflows that scale business operations",
    steps: ["Map current processes and identify automation opportunities", "Integrate AI services with workflow platforms", "Test and optimize automated processes"], 
    topicCategory: "Web/App Dev",
    category: "Automation" 
  },
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
    <Card className={`h-full cursor-pointer hover:shadow-lg transition-all duration-200 ${isBlurred ? 'filter blur-[2px] pointer-events-none' : ''}`}
          onClick={() => {
            if (!isBlurred) {
              setSelectedWorkflow(workflow);
              setIsModalOpen(true);
            }
          }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{workflow.name}</CardTitle>
          <Badge variant="secondary">{workflow.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{workflow.whatItIs}</p>
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
        <Button className="w-full mt-4" variant="outline" size="sm">
          View Detailed Workflow
        </Button>
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
        
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-muted-foreground">There will be your workflows</h3>
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
