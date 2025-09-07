import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Plus, Search, Star, Bookmark, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import BlueprintDetailModal from "@/components/BlueprintDetailModal";

// Define Blueprint type compatible with existing UI
type Blueprint = {
  name: string;
  description: string;
  template: string;
  category: string;
};

// Comprehensive professional blueprints across categories
const freeBlueprints: Blueprint[] = [
  { 
    name: "Product Launch Blueprint", 
    description: "Complete template for successful product launches", 
    template: "# Product Launch Brief\\n## Executive Summary\\n[Product overview and launch objectives]\\n## Target Market Analysis\\n[Market size, customer segments, competitive landscape]\\n## Product Positioning\\n[Unique value proposition and messaging framework]\\n## Launch Strategy\\n[Timeline, channels, budget allocation]\\n## Success Metrics\\n[KPIs and measurement framework]", 
    category: "Marketing" 
  },
  { 
    name: "SOP Template", 
    description: "Standard Operating Procedure framework for consistent operations", 
    template: "# Standard Operating Procedure\\n## Executive Summary\\n[Purpose and scope of this SOP]\\n## Process Overview\\n[High-level process flow and objectives]\\n## Roles & Responsibilities\\n[Who does what, accountability matrix]\\n## Step-by-Step Procedure\\n[Detailed instructions with decision points]\\n## Quality Controls\\n[Checkpoints, validation, and compliance measures]\\n## Continuous Improvement\\n[Review cycles and optimization procedures]", 
    category: "Operations" 
  },
  { 
    name: "Content Marketing Strategy", 
    description: "Comprehensive content marketing framework for brand growth", 
    template: "# Content Marketing Strategy\\n## Brand Voice & Messaging\\n[Tone, style, and core messaging pillars]\\n## Audience Personas\\n[Detailed customer profiles and content preferences]\\n## Content Pillars\\n[Key themes and topics aligned with business goals]\\n## Content Calendar\\n[Publishing schedule and channel optimization]\\n## Performance Measurement\\n[Analytics framework and success metrics]", 
    category: "Marketing" 
  },
  { 
    name: "Customer Onboarding Blueprint", 
    description: "Systematic approach to customer success and retention", 
    template: "# Customer Onboarding Blueprint\\n## Welcome Journey\\n[First impression and expectation setting]\\n## Value Realization\\n[Quick wins and early success milestones]\\n## Training & Support\\n[Educational resources and help systems]\\n## Engagement Tracking\\n[Usage metrics and intervention triggers]\\n## Success Measurement\\n[Retention metrics and satisfaction tracking]", 
    category: "Customer Success" 
  },
  { 
    name: "Meeting Management Framework", 
    description: "Effective meeting structure for productivity and decision-making", 
    template: "# Meeting Management Framework\\n## Pre-Meeting Preparation\\n[Agenda setting, participant selection, material distribution]\\n## Meeting Structure\\n[Opening, discussion flow, decision points]\\n## Facilitation Guidelines\\n[Keeping on track, managing participation, conflict resolution]\\n## Action Items & Follow-up\\n[Task assignment, deadlines, accountability measures]\\n## Meeting Effectiveness\\n[Evaluation and continuous improvement]", 
    category: "Operations" 
  },
  { 
    name: "Sales Process Blueprint", 
    description: "Structured sales methodology for consistent results", 
    template: "# Sales Process Blueprint\\n## Lead Qualification\\n[BANT criteria and scoring framework]\\n## Discovery Process\\n[Questions framework and needs analysis]\\n## Solution Presentation\\n[Value demonstration and objection handling]\\n## Negotiation Strategy\\n[Pricing, terms, and closing techniques]\\n## Account Management\\n[Post-sale relationship and expansion opportunities]", 
    category: "Sales" 
  }
];

const proBlueprints: Blueprint[] = [
  { 
    name: "Executive Dashboard Blueprint", 
    description: "Strategic executive reporting and decision-making framework", 
    template: "# Executive Dashboard Blueprint\\n## Strategic Overview\\n[Mission alignment and strategic objectives]\\n## Key Performance Indicators\\n[Primary metrics and performance trending]\\n## Financial Performance\\n[Revenue, profitability, and cash flow analysis]\\n## Operational Metrics\\n[Efficiency, quality, and capacity utilization]\\n## Risk Assessment\\n[Threats, opportunities, and mitigation strategies]\\n## Strategic Initiatives\\n[Project status, resource allocation, ROI tracking]", 
    category: "Business Intelligence" 
  },
  { 
    name: "Investment Pitch Deck", 
    description: "Professional investor presentation for funding rounds", 
    template: "# Investment Pitch Deck\\n## Problem Statement\\n[Market pain points and customer validation]\\n## Solution Overview\\n[Product demonstration and unique value proposition]\\n## Market Opportunity\\n[TAM/SAM/SOM analysis and growth projections]\\n## Business Model\\n[Revenue streams, pricing strategy, unit economics]\\n## Traction & Validation\\n[Customer growth, revenue metrics, partnerships]\\n## Competition Analysis\\n[Competitive landscape and differentiation strategy]\\n## Team & Expertise\\n[Founder backgrounds, key hires, advisory board]\\n## Financial Projections\\n[5-year forecast, key assumptions, sensitivity analysis]\\n## Funding Requirements\\n[Use of funds, milestones, investor return potential]", 
    category: "Investment" 
  },
  { 
    name: "Digital Transformation Roadmap", 
    description: "Strategic framework for organizational digital transformation", 
    template: "# Digital Transformation Roadmap\\n## Current State Assessment\\n[Technology audit, process analysis, capability gaps]\\n## Vision & Strategy\\n[Digital transformation goals and success criteria]\\n## Technology Architecture\\n[Platform selection, integration strategy, data management]\\n## Change Management\\n[Organizational change, training programs, culture shift]\\n## Implementation Phases\\n[Milestone planning, resource allocation, risk management]\\n## Success Measurement\\n[ROI tracking, performance metrics, continuous improvement]", 
    category: "Technology Strategy" 
  },
  { 
    name: "Crisis Communication Plan", 
    description: "Comprehensive crisis management and communication framework", 
    template: "# Crisis Communication Plan\\n## Crisis Classification\\n[Severity levels, trigger events, escalation criteria]\\n## Response Team Structure\\n[Roles, responsibilities, decision-making authority]\\n## Communication Protocols\\n[Internal notifications, external messaging, media relations]\\n## Stakeholder Management\\n[Customer communication, investor updates, employee briefings]\\n## Recovery Strategy\\n[Reputation management, business continuity, lessons learned]", 
    category: "Risk Management" 
  },
  { 
    name: "AI Implementation Blueprint", 
    description: "Strategic framework for enterprise AI adoption and deployment", 
    template: "# AI Implementation Blueprint\\n## AI Readiness Assessment\\n[Data maturity, infrastructure capability, organizational readiness]\\n## Use Case Prioritization\\n[Value identification, feasibility analysis, ROI potential]\\n## Technology Stack\\n[AI platforms, integration architecture, security framework]\\n## Data Strategy\\n[Data governance, quality management, privacy compliance]\\n## Pilot Implementation\\n[Proof of concept, testing methodology, success metrics]\\n## Scale & Optimization\\n[Deployment strategy, performance monitoring, continuous learning]", 
    category: "AI & Automation" 
  },
  { 
    name: "M&A Integration Playbook", 
    description: "Systematic approach to mergers and acquisitions integration", 
    template: "# M&A Integration Playbook\\n## Pre-Integration Planning\\n[Due diligence synthesis, integration strategy, team formation]\\n## Cultural Integration\\n[Values alignment, communication strategy, change management]\\n## Systems Integration\\n[Technology consolidation, data migration, process harmonization]\\n## Talent Retention\\n[Key employee identification, retention strategies, role definition]\\n## Synergy Realization\\n[Cost synergies, revenue synergies, performance tracking]\\n## Success Measurement\\n[Integration milestones, financial impact, stakeholder satisfaction]", 
    category: "Corporate Development" 
  },
  { 
    name: "Compliance Management Framework", 
    description: "Comprehensive regulatory compliance and risk management system", 
    template: "# Compliance Management Framework\\n## Regulatory Landscape\\n[Applicable regulations, compliance requirements, update monitoring]\\n## Policy Framework\\n[Corporate policies, procedures, approval processes]\\n## Risk Assessment\\n[Compliance risks, impact analysis, mitigation strategies]\\n## Monitoring & Reporting\\n[Compliance tracking, audit processes, regulatory reporting]\\n## Training & Awareness\\n[Employee education, certification programs, culture building]\\n## Incident Management\\n[Violation response, corrective actions, continuous improvement]", 
    category: "Risk Management" 
  },
  { 
    name: "Innovation Lab Framework", 
    description: "Structured approach to corporate innovation and R&D management", 
    template: "# Innovation Lab Framework\\n## Innovation Strategy\\n[Innovation objectives, focus areas, resource allocation]\\n## Idea Management\\n[Ideation processes, evaluation criteria, portfolio management]\\n## Project Methodology\\n[Stage-gate process, milestone tracking, success metrics]\\n## Partnership Ecosystem\\n[External collaborations, startup partnerships, academic alliances]\\n## Talent Development\\n[Innovation skills, creative processes, cultural transformation]\\n## Commercialization\\n[IP management, market validation, scaling strategies]", 
    category: "Innovation" 
  }
];

const allBlueprints = [...freeBlueprints, ...proBlueprints];

export default function Blueprints() {
  const { isAuthenticated, subscription } = useAuth();
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
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

  const BlueprintCard = ({ blueprint, isBlurred }: { blueprint: Blueprint; isBlurred: boolean }) => (
    <Card 
      className={`h-full cursor-pointer hover:shadow-lg transition-shadow ${isBlurred ? 'filter blur-[2px] pointer-events-none' : ''}`}
        onClick={() => {
          if (!isBlurred) {
            setSelectedBlueprint(blueprint);
            setIsModalOpen(true);
          }
        }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{blueprint.name}</CardTitle>
          <Badge variant="secondary">{blueprint.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{blueprint.description}</p>
        <div>
          <h4 className="font-semibold mb-2">Template Preview:</h4>
          <pre className="text-xs bg-muted p-2 rounded text-muted-foreground overflow-hidden max-h-16">
            {blueprint.template.substring(0, 120)}...
          </pre>
        </div>
        <Button size="sm" className="mt-4 w-full" variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          View Full Blueprint
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-12">
      {/* My Blueprints Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">My Blueprints</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Blueprint
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search your blueprints..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Favorites
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Create Your First Blueprint</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Build reusable templates for your projects
              </p>
              <Button variant="outline" size="sm">Get Started</Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="font-semibold mb-2">✨ Coming Soon</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Custom template builder with variables</li>
            <li>• Blueprint versioning and history</li>
            <li>• Team sharing and collaboration</li>
            <li>• Usage analytics and optimization</li>
            <li>• Import/export functionality</li>
          </ul>
        </div>
      </div>

      {/* JumpinAI Blueprints Section */}
      <div className="space-y-6">
        <div className="border-t pt-8">
          <h2 className="text-2xl font-semibold mb-2">JumpinAI Blueprints</h2>
          <p className="text-muted-foreground">Ready-to-use templates for common business scenarios</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(showAllContent ? allBlueprints : allBlueprints.slice(0, 6)).map((blueprint, index) => (
            <BlueprintCard 
              key={index} 
              blueprint={blueprint} 
              isBlurred={!showAllContent && index >= 4}
            />
          ))}
        </div>
        
        {!showAllContent && <UpgradeSection message="View more professional blueprints" />}
      </div>

      <BlueprintDetailModal 
        blueprint={selectedBlueprint ? {
          ...selectedBlueprint,
          whatItIs: selectedBlueprint.description,
          whatItsFor: `Designed for ${selectedBlueprint.category.toLowerCase()} use cases`,
          desiredOutcome: "Structured template for consistent results",
          topicCategory: "Text" as const
        } : null}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBlueprint(null);
        }}
      />
    </div>
  );
}
