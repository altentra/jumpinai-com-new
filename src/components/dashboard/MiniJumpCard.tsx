import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Card 
      className={`w-64 flex-shrink-0 cursor-pointer hover:shadow-md transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-primary border-primary bg-primary/5' 
          : 'border-border/50 hover:border-border'
      }`}
      onClick={() => onClick(jump)}
    >
      <CardHeader className="pb-2 p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm line-clamp-2 leading-tight">
              {jump.title}
            </CardTitle>
            <Badge variant="secondary" className="text-xs shrink-0">
              AI
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(jump.created_at)}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        {jump.summary && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {jump.summary}
          </p>
        )}
      </CardContent>
    </Card>
  );
}