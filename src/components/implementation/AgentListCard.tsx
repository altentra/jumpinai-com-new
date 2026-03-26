import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Brain,
  Clock, 
  Loader2,
  Package,
  Sparkles,
  Workflow,
  Zap,
  Target,
  Timer
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SavedAgent {
  id: string;
  title: string;
  description: string | null;
  automation_type: string | null;
  impact_level: string | null;
  complexity_level: string | null;
  platform: string;
  created_at: string;
  download_count: number;
}

interface AgentListCardProps {
  agents: SavedAgent[];
  selectedAgent: SavedAgent | null;
  isLoading: boolean;
  onSelectAgent: (agent: SavedAgent) => void;
  onSwitchToAnalyze: () => void;
  getImpactBadgeColor: (level: string | null) => string;
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getImpactIcon = (level: string | null) => {
  switch (level) {
    case "high": return <Zap className="w-3 h-3" />;
    case "medium": return <Target className="w-3 h-3" />;
    default: return <Timer className="w-3 h-3" />;
  }
};

// Platform badge component - subtle with indicator dot
function PlatformBadge({ platform }: { platform: string }) {
  const isN8n = platform === 'n8n';
  return (
    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-medium bg-background/50 gap-1">
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        isN8n ? "bg-amber-500" : "bg-violet-500"
      )} />
      {isN8n ? 'n8n' : 'Make'}
    </Badge>
  );
}

// Automation type badge - standardized terminology
// Unknown/not chosen = "Automation" (Green)
// Workflow = "Workflow" (Blue)
// AI Agent = "AI Agent" (Yellow)
// Both = "Automations" (Green)
function AutomationTypeBadge({ type }: { type: string | null }) {
  const isAIAgent = type === 'ai-agent';
  const isWorkflow = type === 'workflow';
  const isUnknown = !isAIAgent && !isWorkflow;
  
  // Get proper styling based on type
  const getBadgeClasses = () => {
    if (isAIAgent) return "bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400";
    if (isWorkflow) return "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400";
    return "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"; // Automation
  };
  
  const getLabel = () => {
    if (isAIAgent) return 'AI Agent';
    if (isWorkflow) return 'Workflow';
    return 'Automation';
  };
  
  const IconComponent = isAIAgent ? Brain : isWorkflow ? Workflow : Bot;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-[10px] px-1.5 py-0 h-5 font-medium gap-1",
        getBadgeClasses()
      )}
    >
      <IconComponent className="w-3 h-3" />
      {getLabel()}
    </Badge>
  );
}

export function AgentListCard({
  agents,
  selectedAgent,
  isLoading,
  onSelectAgent,
  onSwitchToAnalyze,
  getImpactBadgeColor,
}: AgentListCardProps) {
  return (
    <Card className={cn(
      "h-[280px] lg:h-[500px] flex flex-col",
      "border-border/40",
      "bg-gradient-to-br from-card via-card/95 to-card/90"
    )}>
      <CardHeader className="pb-3 flex-shrink-0 space-y-1">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Package className="w-4 h-4 text-primary" />
          </div>
          Your Automations
        </CardTitle>
        <CardDescription className="text-xs">
          {agents.length} automation{agents.length !== 1 ? 's' : ''} built
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading automations...</p>
            </div>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12 space-y-4 px-6">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
              <Bot className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                No automations built yet
              </p>
              <p className="text-xs text-muted-foreground/70">
                Analyze a jump and build your first workflow or AI agent!
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSwitchToAnalyze}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Start Analyzing
            </Button>
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-3 pb-4 scrollbar-thin">
            <div className="space-y-2">
              {agents.map((agent) => {
                const isN8n = agent.platform === 'n8n';
                const isAIAgent = agent.automation_type === 'ai-agent';
                const IconComponent = isAIAgent ? Brain : Workflow;
                return (
                  <button
                    key={agent.id}
                    onClick={() => onSelectAgent(agent as any)}
                    className={cn(
                      "w-full p-3 rounded-xl text-left transition-all duration-200",
                      "border hover:border-primary/40",
                      "group",
                      selectedAgent?.id === agent.id
                        ? cn(
                            "border-primary/50 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-sm",
                            isN8n ? "shadow-amber-500/5" : "shadow-violet-500/5"
                          )
                        : "border-border/30 bg-background/30 hover:bg-background/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon - different based on automation type */}
                      <div className={cn(
                        "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        selectedAgent?.id === agent.id
                          ? isAIAgent ? "bg-yellow-500/15" : "bg-blue-500/15"
                          : "bg-muted/50 group-hover:bg-muted"
                      )}>
                        <IconComponent className={cn(
                          "w-5 h-5 transition-colors",
                          selectedAgent?.id === agent.id 
                            ? isAIAgent ? "text-yellow-500" : "text-blue-500"
                            : "text-muted-foreground"
                        )} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <h4 className={cn(
                          "font-medium text-sm line-clamp-2 leading-snug transition-colors",
                          selectedAgent?.id === agent.id && "text-foreground"
                        )}>
                          {agent.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <AutomationTypeBadge type={agent.automation_type} />
                          <PlatformBadge platform={agent.platform} />
                          <Badge className={cn(
                            "text-[10px] px-1.5 py-0 h-5 flex items-center gap-1",
                            getImpactBadgeColor(agent.impact_level)
                          )}>
                            {getImpactIcon(agent.impact_level)}
                            {agent.impact_level}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(agent.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
