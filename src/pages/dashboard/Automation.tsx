import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAutomations, SavedAgent } from "@/hooks/useAutomations";

import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Sparkles, 
  Loader2,
  Package,
  Eye,
  Workflow as WorkflowIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AgentDetailCard } from "@/components/implementation/AgentDetailCard";
import { AgentListCard } from "@/components/implementation/AgentListCard";

// SavedAgent type is imported from useAutomations hook

export default function Automation() {
  const navigate = useNavigate();
  
  // Use cached hook for fast loading
  const { 
    automations: savedAgents, 
    isLoading: isLoadingAgents, 
    deleteAutomation,
    isDeleting 
  } = useAutomations();
  
  const [selectedAgent, setSelectedAgent] = useState<SavedAgent | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<SavedAgent | null>(null);

  // Auto-select the most recent automation when data loads
  useEffect(() => {
    if (savedAgents.length > 0 && !selectedAgent) {
      setSelectedAgent(savedAgents[0]);
    }
  }, [savedAgents]);

  const handleDownloadWorkflow = (workflow: any, filename: string) => {
    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'workflow.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Workflow downloaded!");
  };

  const handleDeleteAgent = async (agent: SavedAgent) => {
    deleteAutomation(agent.id);
    setAgentToDelete(null);
    setSelectedAgent(null);
  };

  const getImpactBadgeColor = (level: string | null) => {
    switch (level) {
      case "high": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getComplexityBadgeColor = (level: string | null) => {
    switch (level) {
      case "simple": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "moderate": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "complex": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-2xl",
            "bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5",
            "border border-primary/20 shadow-lg shadow-primary/10"
          )}>
            <WorkflowIcon className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
              My Automations
            </h1>
            <p className="text-muted-foreground text-sm">
              View and manage your built workflows & AI agents
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Agents List */}
        <div className="lg:col-span-1">
          <AgentListCard
            agents={savedAgents}
            selectedAgent={selectedAgent}
            isLoading={isLoadingAgents}
            onSelectAgent={(agent) => setSelectedAgent(agent as SavedAgent)}
            onSwitchToAnalyze={() => navigate('/dashboard/implementation')}
            getImpactBadgeColor={getImpactBadgeColor}
          />
        </div>

        {/* Right Column - Agent Details */}
        <div className="lg:col-span-2">
          {selectedAgent ? (
            <AgentDetailCard
              agent={selectedAgent}
              onDownload={handleDownloadWorkflow}
              onDelete={() => setAgentToDelete(selectedAgent)}
              getImpactBadgeColor={getImpactBadgeColor}
              getComplexityBadgeColor={getComplexityBadgeColor}
            />
          ) : (
            <Card className={cn(
              "h-[500px] flex items-center justify-center",
              "border-border/40",
              "bg-gradient-to-br from-card via-card/95 to-card/90"
            )}>
              <div className="text-center space-y-3">
                <div className={cn(
                  "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center",
                  "bg-gradient-to-br from-muted/50 to-muted/20",
                  "border border-border/30"
                )}>
                  <Eye className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Select an automation to view details
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!agentToDelete} onOpenChange={() => setAgentToDelete(null)}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{agentToDelete?.title}" and its workflow. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => agentToDelete && handleDeleteAgent(agentToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
