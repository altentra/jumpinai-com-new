import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Trash2, ArrowRight } from "lucide-react";
import { UserJump } from "@/services/jumpService";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import logoTransparent from "@/assets/logo-transparent.png";

interface JumpListCardProps {
  jump: UserJump;
  jumpNumber: number;
  onView: (jump: UserJump) => void;
  onDelete: (jumpId: string) => void;
}

export default function JumpListCard({ jump, jumpNumber, onView, onDelete }: JumpListCardProps) {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
  };

  const formatDateShort = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };


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

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/dashboard/jump/${jump.id}`);
  };

  return (
    <Card 
      className="group glass border-0 ring-1 ring-white/10 rounded-2xl shadow-lg backdrop-blur-xl bg-gradient-to-r from-background/80 via-card/60 to-primary/5 hover:ring-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      
      <div className="relative z-10 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Left section - Jump info */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Jump title with logo */}
            <div className="flex items-center gap-2">
              <img 
                src={logoTransparent} 
                alt="JumpinAI" 
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />
              <h3 className="flex-1 text-base sm:text-lg font-bold line-clamp-2 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent leading-snug group-hover:from-primary group-hover:via-primary group-hover:to-primary/70 transition-all duration-300">
                {jump.title}
              </h3>
            </div>
            
            {/* Date */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">{formatDate(jump.created_at)}</span>
              <span className="sm:hidden">{formatDateShort(jump.created_at)}</span>
            </div>
          </div>
          
          {/* Right section - Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* View Button */}
            <Button
              onClick={handleViewClick}
              variant="glass"
              size="sm"
              className="flex-1 sm:flex-initial"
            >
              View Jump
              <ArrowRight className="h-4 w-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
            
            {/* Delete Button */}
            <Button
              data-delete-button
              onClick={handleDeleteClick}
              variant="ghost"
              size="sm"
              className="rounded-xl border-0 ring-1 ring-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/15 hover:ring-destructive/40 transition-all duration-300 h-9 sm:h-10 w-9 sm:w-10 p-0 shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
