import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  Check, 
  CheckCircle2,
  Loader2,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JumpWithAnalysis {
  id: string;
  title: string;
  summary?: string;
  created_at: string;
  hasAnalysis?: boolean;
  comprehensive_plan?: any;
  structured_plan?: any;
  full_content?: string;
}

interface JumpSelectionCardProps {
  jumps: JumpWithAnalysis[];
  selectedJump: JumpWithAnalysis | null;
  isLoading: boolean;
  onSelectJump: (jump: JumpWithAnalysis) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export function JumpSelectionCard({
  jumps,
  selectedJump,
  isLoading,
  onSelectJump,
}: JumpSelectionCardProps) {
  return (
    <Card className={cn(
      "h-[500px] flex flex-col",
      "border-border/40",
      "bg-gradient-to-br from-card via-card/95 to-card/90"
    )}>
      <CardHeader className="pb-3 flex-shrink-0 space-y-1">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          Select a Jump
        </CardTitle>
        <CardDescription className="text-xs">
          Choose from your {jumps.length} generated jumps
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading jumps...</p>
            </div>
          </div>
        ) : jumps.length === 0 ? (
          <div className="text-center py-12 space-y-4 px-6">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                No jumps found
              </p>
              <p className="text-xs text-muted-foreground/70">
                Create a jump first in the Studio
              </p>
            </div>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <a href="/dashboard/studio">
                <Rocket className="w-4 h-4" />
                Go to Studio
              </a>
            </Button>
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-3 pb-4 scrollbar-thin">
            <div className="space-y-2">
              {jumps.map((jump, index) => (
                <button
                  key={jump.id}
                  onClick={() => onSelectJump(jump)}
                  className={cn(
                    "w-full p-3 rounded-xl text-left transition-all duration-200",
                    "border hover:border-primary/40",
                    "group",
                    selectedJump?.id === jump.id
                      ? "border-primary/50 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 shadow-sm"
                      : "border-border/30 bg-background/30 hover:bg-background/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Index number */}
                    <div className={cn(
                      "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors",
                      selectedJump?.id === jump.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                    )}>
                      {jumps.length - index}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className={cn(
                          "font-medium text-sm truncate flex-1 transition-colors",
                          selectedJump?.id === jump.id && "text-primary"
                        )}>
                          {jump.title}
                        </h4>
                        {jump.hasAnalysis && (
                          <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0 h-5 bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle2 className="w-3 h-3 mr-0.5" />
                            Analyzed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground/60" />
                        <span className="text-xs text-muted-foreground/60">
                          {formatDate(jump.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {selectedJump?.id === jump.id && (
                      <div className="shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
