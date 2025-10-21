import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trash2, ArrowRight } from "lucide-react";
import { UserJump } from "@/services/jumpService";
import { format } from "date-fns";

interface JumpCardProps {
  jump: UserJump;
  jumpNumber: number;
  onView: (jump: UserJump) => void;
  onDelete: (jumpId: string) => void;
}

export default function JumpCard({ jump, jumpNumber, onView, onDelete }: JumpCardProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
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
    onView(jump);
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
            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-lg text-xs font-bold px-3 py-1.5 rounded-full ring-1 ring-primary/30">
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
          <Button 
            className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary/90 hover:to-primary/85 shadow-lg hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 border-0 ring-1 ring-primary/40 hover:ring-primary/60 font-bold text-primary-foreground h-11"
            onClick={(e) => {
              e.stopPropagation();
              onView(jump);
            }}
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20"></div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
            
            {/* Content */}
            <div className="relative flex items-center justify-center gap-2.5 z-10">
              <span className="font-bold tracking-wide text-base">View Jump</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}