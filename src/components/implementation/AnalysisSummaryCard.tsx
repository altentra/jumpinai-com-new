import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisSummaryCardProps {
  summary: string;
  overallPotential: string;
  opportunitiesCount: number;
}

export function AnalysisSummaryCard({ 
  summary, 
  overallPotential, 
  opportunitiesCount 
}: AnalysisSummaryCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden",
      "border-primary/30",
      "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
    )}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
      
      <CardContent className="relative pt-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn(
            "shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center",
            "bg-gradient-to-br from-primary/30 to-primary/10",
            "border border-primary/20 shadow-lg shadow-primary/10"
          )}>
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Analysis Summary</h3>
              <Badge variant="secondary" className="font-medium">
                <Sparkles className="w-3 h-3 mr-1" />
                {opportunitiesCount} opportunities
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {summary}
            </p>
            
            {/* Potential indicator */}
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
              "bg-gradient-to-r from-green-500/15 to-green-500/5",
              "border border-green-500/20"
            )}>
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-500">
                {overallPotential}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
