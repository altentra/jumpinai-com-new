import { Calendar } from "lucide-react";
import { UserJump } from "@/services/jumpService";
import { format } from "date-fns";

interface MiniJumpCardProps {
  jump: UserJump;
  onClick: (jump: UserJump) => void;
  isSelected?: boolean;
}

export default function MiniJumpCard({ jump, onClick, isSelected }: MiniJumpCardProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd');
  };

  return (
    <div 
      className={`flex-shrink-0 cursor-pointer rounded-md p-2 transition-all duration-200 border text-xs min-w-[120px] ${
        isSelected 
          ? 'ring-1 ring-primary border-primary bg-primary/10' 
          : 'border-border/40 hover:border-border bg-card/50 hover:bg-card/80'
      }`}
      onClick={() => onClick(jump)}
    >
      <div className="space-y-1">
        <div className="font-medium line-clamp-1 text-xs">
          {jump.title}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Calendar className="h-2.5 w-2.5" />
          <span>{formatDate(jump.created_at)}</span>
        </div>
      </div>
    </div>
  );
}