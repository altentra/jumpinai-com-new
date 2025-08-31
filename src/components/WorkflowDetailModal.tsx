import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Circle, Clock, Users, Target, Lightbulb } from "lucide-react";

type Workflow = {
  name: string;
  description: string;
  steps: string[];
  category: string;
};

type DetailedWorkflow = Workflow & {
  overview: string;
  prerequisites: string[];
  timeEstimate: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tools: string[];
  detailedSteps: {
    title: string;
    description: string;
    actions: string[];
    tips: string[];
    expectedOutcome: string;
  }[];
  variations: string[];
  troubleshooting: { problem: string; solution: string; }[];
  resources: { name: string; url: string; }[];
};

const workflowDetails: Record<string, DetailedWorkflow> = {
  "Content Creation Workflow": {
    name: "Content Creation Workflow",
    description: "Systematic approach to creating high-quality content",
    steps: ["Define role, audience, constraints, and deliverable length.", "Ask for a structured outline first; iterate on sections.", "Request variations and finalize with style and brand guardrails."],
    category: "Content",
    overview: "This comprehensive workflow transforms ideas into compelling content through systematic AI collaboration. Perfect for marketers, content creators, and business professionals who need consistent, high-quality output.",
    prerequisites: ["Access to AI writing tools (ChatGPT, Claude, etc.)", "Clear understanding of target audience", "Brand guidelines and style preferences", "Content objectives and KPIs"],
    timeEstimate: "30-90 minutes per piece",
    difficulty: "Beginner",
    tools: ["ChatGPT/Claude/Gemini", "Content calendar", "Brand style guide", "Analytics tools"],
    detailedSteps: [
      {
        title: "Step 1: Content Foundation Setup",
        description: "Establish the fundamental parameters that will guide your entire content creation process.",
        actions: [
          "Define your role context: 'Act as a [specific role] with expertise in [domain]'",
          "Identify target audience: demographics, pain points, preferred communication style",
          "Set content constraints: word count, format requirements, publication channel",
          "Establish deliverable specifications: blog post, social media, email, etc."
        ],
        tips: [
          "Be specific about audience level (beginner vs expert)",
          "Include emotional tone preferences (professional, casual, inspiring)",
          "Mention any compliance or legal considerations",
          "Reference similar successful content as examples"
        ],
        expectedOutcome: "Clear content brief with defined parameters and expectations"
      },
      {
        title: "Step 2: Strategic Outline Development",
        description: "Create a structured framework before diving into full content creation.",
        actions: [
          "Request an outline with main sections and key points",
          "Review outline for logical flow and completeness",
          "Iterate on structure based on audience journey and objectives",
          "Approve final outline before proceeding to full content"
        ],
        tips: [
          "Ask for estimated reading time for each section",
          "Ensure outline includes hook, value propositions, and call-to-action",
          "Consider SEO keyword integration opportunities",
          "Validate outline against content marketing best practices"
        ],
        expectedOutcome: "Approved content outline with clear section hierarchy and flow"
      },
      {
        title: "Step 3: Content Generation and Refinement",
        description: "Transform your approved outline into polished, engaging content.",
        actions: [
          "Generate initial content draft based on approved outline",
          "Review for brand voice, tone, and messaging consistency",
          "Request variations for key sections (headlines, CTAs, conclusions)",
          "Apply final brand guidelines and style preferences"
        ],
        tips: [
          "Generate 3-5 headline options to test engagement",
          "Create multiple CTA variations for A/B testing",
          "Ensure content includes data, examples, or case studies",
          "Optimize for readability with shorter paragraphs and bullet points"
        ],
        expectedOutcome: "Final content ready for publication with multiple tested variations"
      }
    ],
    variations: [
      "Video Script Workflow: Add storyboard development and visual cue planning",
      "Social Media Workflow: Create platform-specific adaptations and scheduling",
      "Email Campaign Workflow: Include subject line testing and segmentation",
      "Technical Content Workflow: Add expert review and accuracy validation steps"
    ],
    troubleshooting: [
      {
        problem: "AI generates generic, bland content",
        solution: "Provide more specific context, examples of preferred style, and detailed audience personas"
      },
      {
        problem: "Content doesn't match brand voice",
        solution: "Create a detailed brand voice document with do's/don'ts and example phrases"
      },
      {
        problem: "Outline feels incomplete or illogical",
        solution: "Ask AI to explain the reasoning behind structure and suggest alternative approaches"
      }
    ],
    resources: [
      { name: "Content Marketing Institute", url: "https://contentmarketinginstitute.com" },
      { name: "HubSpot Content Strategy Guide", url: "https://blog.hubspot.com/marketing/content-strategy" },
      { name: "Copyblogger Writing Tips", url: "https://copyblogger.com" }
    ]
  },
  
  "n8n AI Content Generation Pipeline": {
    name: "n8n AI Content Generation Pipeline",
    description: "Enterprise-scale content automation with multiple AI models",
    steps: ["Set up content brief intake via forms or API with validation rules", "Route requests through n8n based on content type and complexity", "Orchestrate multiple AI models (GPT-5, Claude, Gemini) for content creation", "Implement quality control with AI-powered review and human approval", "Distribute content across platforms with analytics tracking", "Create feedback loops for continuous pipeline optimization"],
    category: "AI Content Automation",
    overview: "Build a sophisticated content generation pipeline that automatically creates, reviews, and distributes content across multiple channels using n8n workflow automation and multiple AI services.",
    prerequisites: ["n8n instance (cloud or self-hosted)", "API access to multiple AI services", "Content management system integration", "Basic understanding of workflow automation", "Content strategy and brand guidelines"],
    timeEstimate: "2-4 weeks implementation",
    difficulty: "Advanced",
    tools: ["n8n", "OpenAI API", "Claude API", "Google Gemini API", "Slack/Teams", "Content CMS", "Analytics platforms"],
    detailedSteps: [
      {
        title: "Step 1: Content Intake System Setup",
        description: "Create a robust system for capturing and validating content requests from various sources.",
        actions: [
          "Set up webhook endpoints in n8n for form submissions and API requests",
          "Create intake forms with required fields: content type, audience, tone, length, deadline",
          "Implement validation rules for all input fields and content requirements",
          "Set up automatic acknowledgment emails with tracking numbers",
          "Create a content request database to track all submissions and status"
        ],
        tips: [
          "Use conditional logic to show/hide fields based on content type",
          "Include file upload capability for reference materials",
          "Set up automatic priority scoring based on urgency and importance",
          "Create templates for common content types to speed up intake"
        ],
        expectedOutcome: "Fully functional content intake system with validation and tracking"
      },
      {
        title: "Step 2: Intelligent Request Routing",
        description: "Implement smart routing logic to direct content requests to appropriate AI services and workflows.",
        actions: [
          "Create routing logic based on content type, complexity, and urgency",
          "Set up AI service selection criteria (GPT-5 for creative, Claude for analysis, etc.)",
          "Implement load balancing across multiple AI services to optimize costs",
          "Create escalation paths for complex or high-priority requests",
          "Set up monitoring for routing decisions and performance metrics"
        ],
        tips: [
          "Use switch nodes in n8n for clean routing logic",
          "Monitor API usage and costs across different services",
          "Create fallback routing if primary services are unavailable",
          "Log all routing decisions for optimization analysis"
        ],
        expectedOutcome: "Smart routing system that efficiently distributes work across AI services"
      },
      {
        title: "Step 3: Multi-AI Orchestration Engine",
        description: "Coordinate multiple AI models to create comprehensive, high-quality content.",
        actions: [
          "Configure API connections for OpenAI, Claude, and Gemini services",
          "Create specialized prompts for each AI service based on their strengths",
          "Implement parallel processing for speed and sequential processing for quality",
          "Set up context sharing between AI models for consistency",
          "Create a master prompt template system for different content types"
        ],
        tips: [
          "Use environment variables for API keys and sensitive configuration",
          "Implement retry logic with exponential backoff for API calls",
          "Create prompt libraries for consistent AI interactions",
          "Monitor token usage and implement cost controls"
        ],
        expectedOutcome: "Orchestrated AI system producing consistent, high-quality content"
      },
      {
        title: "Step 4: Quality Control and Review System",
        description: "Implement automated and human review processes to ensure content quality and brand consistency.",
        actions: [
          "Set up AI-powered content analysis for tone, style, and brand compliance",
          "Create automated fact-checking and plagiarism detection workflows",
          "Implement human review assignment based on content type and complexity",
          "Set up approval workflows with multiple review stages",
          "Create feedback collection and content revision processes"
        ],
        tips: [
          "Use sentiment analysis to ensure appropriate tone",
          "Implement readability scoring and optimization suggestions",
          "Create reviewer assignment logic based on expertise and availability",
          "Set up automated notifications for review deadlines"
        ],
        expectedOutcome: "Comprehensive quality control system ensuring brand-consistent content"
      },
      {
        title: "Step 5: Multi-Platform Distribution",
        description: "Automatically distribute approved content across multiple channels with proper formatting and scheduling.",
        actions: [
          "Set up integrations with content management systems and social platforms",
          "Create platform-specific formatting and optimization rules",
          "Implement scheduling logic based on audience analytics and engagement data",
          "Set up cross-platform content adaptation (blog to social, etc.)",
          "Create distribution tracking and analytics collection"
        ],
        tips: [
          "Use webhook notifications to confirm successful publishing",
          "Implement content versioning for different platforms",
          "Set up automatic hashtag and keyword optimization",
          "Create distribution reports for stakeholder communication"
        ],
        expectedOutcome: "Automated content distribution system with platform optimization"
      },
      {
        title: "Step 6: Analytics and Optimization Loop",
        description: "Collect performance data and continuously improve the content generation pipeline.",
        actions: [
          "Set up analytics collection from all distribution channels",
          "Create performance dashboards with key content metrics",
          "Implement A/B testing for different content variations",
          "Set up automated reporting for content performance and ROI",
          "Create optimization recommendations based on performance data"
        ],
        tips: [
          "Track both engagement metrics and business outcomes",
          "Use cohort analysis to understand long-term content impact",
          "Implement automated alerts for exceptional performance (good or bad)",
          "Create monthly optimization reviews and pipeline improvements"
        ],
        expectedOutcome: "Data-driven optimization system that continuously improves content performance"
      }
    ],
    variations: [
      "Social Media Focus: Adapt pipeline for short-form content and platform-specific optimization",
      "Technical Content: Add expert review stages and accuracy validation processes",
      "Multilingual Pipeline: Include translation and localization workflows",
      "Video Content: Extend pipeline to include script-to-video generation"
    ],
    troubleshooting: [
      {
        problem: "AI services returning inconsistent quality",
        solution: "Refine prompts with specific examples and implement more detailed quality scoring"
      },
      {
        problem: "High API costs",
        solution: "Implement intelligent routing to use less expensive models for simpler tasks"
      },
      {
        problem: "Content review bottlenecks",
        solution: "Create automated pre-screening and intelligent reviewer assignment"
      }
    ],
    resources: [
      { name: "n8n Documentation", url: "https://docs.n8n.io" },
      { name: "OpenAI API Guide", url: "https://platform.openai.com/docs" },
      { name: "Content Automation Best Practices", url: "https://blog.n8n.io" }
    ]
  }
  // Add more detailed workflows here...
};

interface WorkflowDetailModalProps {
  workflow: Workflow | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkflowDetailModal({ workflow, isOpen, onClose }: WorkflowDetailModalProps) {
  if (!workflow) return null;

  const detailed = workflowDetails[workflow.name];
  if (!detailed) {
    // Fallback for workflows without detailed information
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {workflow.name}
              <Badge variant="secondary">{workflow.category}</Badge>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6">
              <p className="text-muted-foreground">{workflow.description}</p>
              
              <div>
                <h3 className="font-semibold mb-3">Steps:</h3>
                <ol className="list-decimal list-inside space-y-2">
                  {workflow.steps.map((step, index) => (
                    <li key={index} className="text-sm">{step}</li>
                  ))}
                </ol>
              </div>
              
              <div className="text-center text-muted-foreground">
                <p>Detailed implementation guide coming soon...</p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {detailed.name}
            <Badge variant="secondary">{detailed.category}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[75vh]">
          <div className="space-y-8 pr-4">
            {/* Overview Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Overview
              </h3>
              <p className="text-muted-foreground leading-relaxed">{detailed.overview}</p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">Time Estimate</span>
                </div>
                <p className="text-sm text-muted-foreground">{detailed.timeEstimate}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">Difficulty</span>
                </div>
                <Badge variant={detailed.difficulty === 'Beginner' ? 'default' : detailed.difficulty === 'Intermediate' ? 'secondary' : 'destructive'}>
                  {detailed.difficulty}
                </Badge>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="font-medium">Tools Needed</span>
                </div>
                <p className="text-sm text-muted-foreground">{detailed.tools.length} tools</p>
              </div>
            </div>

            {/* Prerequisites */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Prerequisites</h3>
              <ul className="space-y-2">
                {detailed.prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{prereq}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Required Tools</h3>
              <div className="flex flex-wrap gap-2">
                {detailed.tools.map((tool, index) => (
                  <Badge key={index} variant="outline">{tool}</Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Detailed Steps */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Detailed Implementation Guide</h3>
              <div className="space-y-8">
                {detailed.detailedSteps.map((step, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3 text-primary">{step.title}</h4>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium mb-2">Actions to Take:</h5>
                        <ul className="space-y-2">
                          {step.actions.map((action, actionIndex) => (
                            <li key={actionIndex} className="flex items-start gap-2">
                              <Circle className="h-3 w-3 text-primary mt-1.5 flex-shrink-0" />
                              <span className="text-sm">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Pro Tips:</h5>
                        <ul className="space-y-2">
                          {step.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-2">
                              <Lightbulb className="h-3 w-3 text-yellow-500 mt-1.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <h5 className="font-medium text-green-800 dark:text-green-200 mb-1">Expected Outcome:</h5>
                      <p className="text-sm text-green-700 dark:text-green-300">{step.expectedOutcome}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Variations */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Workflow Variations</h3>
              <ul className="space-y-2">
                {detailed.variations.map((variation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">V{index + 1}</Badge>
                    <span className="text-sm">{variation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Troubleshooting */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Troubleshooting Guide</h3>
              <div className="space-y-4">
                {detailed.troubleshooting.map((item, index) => (
                  <div key={index} className="border-l-4 border-yellow-500 pl-4">
                    <h5 className="font-medium text-yellow-800 dark:text-yellow-200">{item.problem}</h5>
                    <p className="text-sm text-muted-foreground mt-1">{item.solution}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Additional Resources</h3>
              <div className="space-y-2">
                {detailed.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <span className="text-sm">{resource.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}