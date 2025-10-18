import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Clock, Target, Trash2, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { strategiesService, UserStrategy } from "@/services/strategiesService";
import { useToast } from "@/hooks/use-toast";
import { useJumpsInfo } from "@/hooks/useJumpInfo";
import { Separator } from "@/components/ui/separator";

export default function Strategies() {
  const [strategies, setStrategies] = useState<UserStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<UserStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const jumpIds = strategies.map(strategy => strategy.jump_id);
  const { jumpsInfo } = useJumpsInfo(jumpIds);

  useEffect(() => { loadStrategies(); }, []);

  const loadStrategies = async () => {
    try {
      const data = await strategiesService.getUserStrategies();
      setStrategies(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load strategies", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (strategyId: string) => {
    setDeletingId(strategyId);
    try {
      await strategiesService.deleteStrategy(strategyId);
      setStrategies(strategies.filter(s => s.id !== strategyId));
      toast({ title: "Success", description: "Strategy deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (strategies.length === 0) return <div className="flex flex-col items-center justify-center h-96 space-y-6 text-center"><div className="rounded-full bg-primary/10 p-6"><Target className="h-12 w-12 text-primary" /></div><h3 className="text-2xl font-bold">No Strategies Yet</h3><Button size="lg" onClick={() => window.location.href = "/jumpinai-studio"}>Create Strategy</Button></div>;

  const groupedStrategies = strategies.reduce((acc, strategy) => {
    const jumpId = strategy.jump_id || 'No Jump';
    if (!acc[jumpId]) acc[jumpId] = [];
    acc[jumpId].push(strategy);
    return acc;
  }, {} as Record<string, UserStrategy[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedStrategies).map(([jumpId, jumpStrategies]) => {
        const jumpInfo = jumpsInfo[jumpId];
        return (
          <div key={jumpId} className="space-y-4">
            {jumpInfo && <div className="flex items-center gap-3"><div className="h-10 w-1 bg-gradient-to-b from-primary to-primary/30 rounded-full" /><h2 className="text-xl font-bold">{jumpInfo.title}</h2></div>}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jumpStrategies.map((strategy) => (
                <Card key={strategy.id} className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50" onClick={() => setSelectedStrategy(strategy)}>
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{strategy.title}</CardTitle>
                      <AlertDialog>
                        <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" disabled={deletingId === strategy.id}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader><AlertDialogTitle>Delete Strategy?</AlertDialogTitle></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(strategy.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    {strategy.category && <Badge variant="secondary">{strategy.category}</Badge>}
                    {strategy.description && <CardDescription className="line-clamp-2">{strategy.description}</CardDescription>}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {strategy.timeline && <div className="flex items-center gap-1 text-sm"><Clock className="h-4 w-4" />{strategy.timeline}</div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
      <Dialog open={!!selectedStrategy} onOpenChange={() => setSelectedStrategy(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedStrategy && (
            <div className="space-y-6">
              <DialogHeader><DialogTitle className="text-2xl">{selectedStrategy.title}</DialogTitle></DialogHeader>
              {selectedStrategy.description && <p className="text-muted-foreground">{selectedStrategy.description}</p>}
              <Separator />
              {selectedStrategy.key_actions && selectedStrategy.key_actions.length > 0 && (
                <div><h4 className="font-semibold mb-3">Key Actions</h4><ul className="space-y-2">{selectedStrategy.key_actions.map((action, i) => <li key={i} className="flex gap-2 text-sm"><span className="text-primary">•</span>{action}</li>)}</ul></div>
              )}
              {selectedStrategy.ai_tools && selectedStrategy.ai_tools.length > 0 && (
                <div><h4 className="font-semibold mb-3">AI Tools</h4><div className="flex flex-wrap gap-2">{selectedStrategy.ai_tools.map((tool, i) => <Badge key={i} variant="secondary"><Sparkles className="h-3 w-3 mr-1" />{tool}</Badge>)}</div></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
