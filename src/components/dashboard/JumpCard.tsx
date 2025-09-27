import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Rocket, Trash2, Sparkles } from "lucide-react";
import { UserJump } from "@/services/jumpService";
import { format } from "date-fns";

interface JumpCardProps {
  jump: UserJump;
  onView: (jump: UserJump) => void;
  onDelete: (jumpId: string) => void;
}

export default function JumpCard({ jump, onView, onDelete }: JumpCardProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Extract jump number and name from title (e.g., "Jump #1: AI Marketing Automation")
  const parseJumpTitle = (title: string) => {
    const match = title.match(/^Jump #(\d+): (.+)$/);
    if (match) {
      return {
        number: parseInt(match[1]),
        name: match[2]
      };
    }
    return {
      number: null,
      name: title
    };
  };

  const { number, name } = parseJumpTitle(jump.title);

  return (
    <Card className="group glass border-0 ring-1 ring-white/10 rounded-3xl shadow-2xl backdrop-blur-2xl bg-gradient-to-br from-background/80 via-card/60 to-primary/5 hover:ring-white/20 hover:shadow-3xl transition-all duration-500 relative overflow-hidden hover:scale-[1.02]">
      {/* Subtle background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-3">
              {number && (
                <Badge className="bg-primary/90 text-primary-foreground border-0 shadow-md text-xs font-semibold px-3 py-1 rounded-full">
                  #{number}
                </Badge>
              )}
              <Badge className="bg-secondary/90 text-secondary-foreground border-0 shadow-md text-xs font-medium px-3 py-1 rounded-full">
                AI Generated
              </Badge>
            </div>
            
            <CardTitle className="text-xl font-display font-bold line-clamp-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent leading-tight">
              {name}
            </CardTitle>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <div className="p-1 rounded-lg bg-muted/30 ring-1 ring-muted/40">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span>Created {formatDate(jump.created_at)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 relative z-10 space-y-4">
        {jump.summary && (
          <CardDescription className="line-clamp-3 text-muted-foreground font-medium leading-relaxed">
            {jump.summary}
          </CardDescription>
        )}
        
        <div className="flex items-center gap-3 pt-2">
          <Button 
            onClick={() => onView(jump)}
            className="group/btn flex-1 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary/90 hover:to-primary/80 shadow-lg hover:shadow-2xl hover:shadow-primary/25 transition-all duration-500 border-0 ring-1 ring-primary/40 hover:ring-primary/60 font-semibold text-primary-foreground hover:scale-[1.02] active:scale-[0.98]"
            size="sm"
          >
            {/* Premium glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-50"></div>
            
            {/* Content with sparkle effect */}
            <div className="relative flex items-center justify-center gap-2 z-10">
              <div className="relative">
                <Rocket className="h-4 w-4 transition-transform duration-300 group-hover/btn:scale-110" />
                <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 text-white/80 opacity-0 group-hover/btn:opacity-100 transition-all duration-300 group-hover/btn:animate-pulse" />
              </div>
              <span className="font-semibold tracking-wide">View the Jump</span>
            </div>
            
            {/* Animated shine effect */}
            <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-out skew-x-12"></div>
          </Button>
          
          <Button
            onClick={() => onDelete(jump.id)}
            variant="outline"
            size="sm"
            className="rounded-2xl border-0 ring-1 ring-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:ring-destructive/50 transition-all duration-300 p-2.5"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}