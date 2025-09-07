import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, Target, TrendingUp, Users, AlertTriangle, Lightbulb, X } from "lucide-react";

type Blueprint = {
  name: string;
  description: string;
  category: string;
  objective: string;
  overview: string;
  phases: Array<{
    title: string;
    description: string;
    steps: string[];
    timeline: string;
    deliverables: string[];
  }>;
  keyMetrics: string[];
  resources: string[];
  commonChallenges: string[];
  successTips: string[];
};

interface BlueprintDetailModalProps {
  blueprint: Blueprint | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BlueprintDetailModal({ blueprint, isOpen, onClose }: BlueprintDetailModalProps) {
  if (!blueprint) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20">
        <DialogHeader className="border-b border-border/50 pb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {blueprint.name}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {blueprint.category}
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl">{blueprint.description}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="sr-only">
            Detailed blueprint information and strategic guidance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Objective and Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Strategic Objective
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{blueprint.objective}</p>
              </CardContent>
            </Card>

            <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{blueprint.overview}</p>
              </CardContent>
            </Card>
          </div>

          {/* Implementation Phases */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Implementation Phases
            </h3>
            <div className="space-y-4">
              {blueprint.phases.map((phase, index) => (
                <Card key={index} className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-primary">
                          Phase {index + 1}: {phase.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0 ml-4">
                        {phase.timeline}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Key Actions
                      </h5>
                      <ul className="space-y-1 ml-6">
                        {phase.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-sm text-muted-foreground list-disc">
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator className="opacity-50" />
                    <div>
                      <h5 className="font-medium mb-2 text-sm">Expected Deliverables</h5>
                      <div className="flex flex-wrap gap-2">
                        {phase.deliverables.map((deliverable, delIndex) => (
                          <Badge key={delIndex} variant="secondary" className="text-xs">
                            {deliverable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Success Framework */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Key Metrics */}
            <Card className="border-green-200/50 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-green-700 dark:text-green-400">
                  <TrendingUp className="h-5 w-5" />
                  Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {blueprint.keyMetrics.map((metric, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      {metric}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Required Resources */}
            <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-blue-700 dark:text-blue-400">
                  <Users className="h-5 w-5" />
                  Required Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {blueprint.resources.map((resource, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      {resource}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Challenges and Tips */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Common Challenges */}
            <Card className="border-orange-200/50 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-orange-700 dark:text-orange-400">
                  <AlertTriangle className="h-5 w-5" />
                  Common Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {blueprint.commonChallenges.map((challenge, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 shrink-0" />
                      {challenge}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Success Tips */}
            <Card className="border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-purple-700 dark:text-purple-400">
                  <Lightbulb className="h-5 w-5" />
                  Success Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {blueprint.successTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Lightbulb className="h-3 w-3 text-purple-500 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}