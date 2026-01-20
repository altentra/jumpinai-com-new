import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Clock, 
  Loader2,
  Package,
  Sparkles,
  Zap,
  Target,
  Timer
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SavedAgent {
  id: string;
  title: string;
  description: string | null;
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const getImpactIcon = (level: string | null) => {
  switch (level) {
    case "high": return <Zap className="w-3 h-3" />;
    case "medium": return <Target className="w-3 h-3" />;
    default: return <Timer className="w-3 h-3" />;
  }
};

// Platform badge component
function PlatformBadge({ platform }: { platform: string }) {
  const isN8n = platform === 'n8n';
  return (
    <Badge className={cn(
      "text-[10px] px-1.5 py-0 h-5 font-semibold",
      isN8n 
        ? "bg-orange-500/15 text-orange-500 border-orange-500/30"
        : "bg-purple-500/15 text-purple-500 border-purple-500/30"
    )}>
      {isN8n ? 'n8n' : 'Make'}
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
          Your AI Agents
        </CardTitle>
        <CardDescription className="text-xs">
          {agents.length} agent{agents.length !== 1 ? 's' : ''} built
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading agents...</p>
            </div>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12 space-y-4 px-6">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
              <Bot className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                No agents built yet
              </p>
              <p className="text-xs text-muted-foreground/70">
                Analyze a jump and build your first agent!
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
                return (
                  <button
                    key={agent.id}
                    onClick={() => onSelectAgent(agent as any)}
                    className={cn(
                      "w-full p-3 rounded-xl text-left transition-all duration-200",
                      "border hover:border-primary/40",
                      "group",
                      selectedAgent?.id === agent.id
                        ? isN8n
                          ? "border-orange-500/50 bg-gradient-to-r from-orange-500/15 via-orange-500/10 to-orange-500/5 shadow-sm"
                          : "border-purple-500/50 bg-gradient-to-r from-purple-500/15 via-purple-500/10 to-purple-500/5 shadow-sm"
                        : "border-border/30 bg-background/30 hover:bg-background/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={cn(
                        "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        selectedAgent?.id === agent.id
                          ? isN8n
                            ? "bg-gradient-to-br from-orange-500/30 to-orange-500/10"
                            : "bg-gradient-to-br from-purple-500/30 to-purple-500/10"
                          : "bg-muted/50 group-hover:bg-muted"
                      )}>
                        <Bot className={cn(
                          "w-5 h-5 transition-colors",
                          selectedAgent?.id === agent.id 
                            ? isN8n ? "text-orange-500" : "text-purple-500"
                            : "text-muted-foreground"
                        )} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <h4 className={cn(
                          "font-medium text-sm truncate transition-colors",
                          selectedAgent?.id === agent.id && (isN8n ? "text-orange-500" : "text-purple-500")
                        )}>
                          {agent.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
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
                            {formatDate(agent.created_at)}
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
