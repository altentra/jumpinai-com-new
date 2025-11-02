import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trash2, ArrowRight } from "lucide-react";
import { UserJump } from "@/services/jumpService";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface JumpCardProps {
  jump: UserJump;
  jumpNumber: number;
  onView: (jump: UserJump) => void;
  onDelete: (jumpId: string) => void;
}

export default function JumpCard({ jump, jumpNumber, onView, onDelete }: JumpCardProps) {
  const navigate = useNavigate();
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
  };

  // Extract name from title if it has "Jump #X: " prefix
  const getJumpName = (title: string) => {
    const match = title.match(/^Jump #\d+:\s*(.+)$/);
    return match ? match[1] : title;
  };

  const jumpName = getJumpName(jump.title);
  const displayTitle = `Jump #${jumpNumber}: ${jumpName}`;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking delete button
    if ((e.target as HTMLElement).closest('[data-delete-button]')) {
      return;
    }
    navigate(`/dashboard/jump/${jump.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(jump.id);
  };

  return (
    <Card 
      className="group glass border-0 ring-1 ring-white/10 rounded-3xl shadow-2xl backdrop-blur-2xl bg-gradient-to-br from-background/80 via-card/60 to-primary/5 hover:ring-primary/30 hover:shadow-3xl hover:shadow-primary/10 transition-all duration-500 relative overflow-hidden hover:scale-[1.02] cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-3">
          {/* Badge */}
            <Badge className="bg-gradient-to-br from-primary/90 to-primary/70 dark:from-primary/80 dark:to-primary/60 text-primary-foreground border border-primary/40 shadow-lg shadow-primary/20 text-xs font-bold px-3 py-1.5 rounded-full ring-1 ring-primary/20">
              #{jumpNumber}
            </Badge>
            
            {/* Title */}
            <CardTitle className="text-xl font-display font-bold line-clamp-2 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent leading-tight group-hover:from-primary group-hover:via-primary group-hover:to-primary/70 transition-all duration-500">
              {displayTitle}
            </CardTitle>
            
            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <div className="p-1.5 rounded-lg bg-muted/30 ring-1 ring-muted/40 group-hover:bg-primary/10 group-hover:ring-primary/30 transition-colors duration-300">
                <Calendar className="h-3.5 w-3.5 group-hover:text-primary transition-colors duration-300" />
              </div>
              <span>Created {formatDate(jump.created_at)}</span>
            </div>
          </div>
          
          {/* Delete Button - Top Right */}
          <Button
            data-delete-button
            onClick={handleDeleteClick}
            variant="ghost"
            size="sm"
            className="rounded-xl border-0 ring-1 ring-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/15 hover:ring-destructive/40 transition-all duration-300 p-2 h-9 w-9 shrink-0 opacity-60 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 relative z-10">
        {/* Premium View Button */}
        <div className="relative group/btn">
          {/* Subtle glow backdrop */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/15 rounded-full blur-lg opacity-50 group-hover/btn:opacity-70 transition-all duration-500"></div>
          
          <Button 
            className="w-full relative overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70 border border-primary/40 hover:border-primary/60 shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 hover:scale-[1.02] font-bold text-primary-foreground h-12 ring-1 ring-primary/30 hover:ring-primary/50"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/jump/${jump.id}`);
            }}
          >
            {/* Glass morphism overlay effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/8 via-transparent to-white/8 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
            
            {/* Content */}
            <div className="relative flex items-center justify-center gap-2.5 z-10">
              <span className="font-semibold tracking-wide text-base">View the Jump</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}