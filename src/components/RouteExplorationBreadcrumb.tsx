import React from 'react';
import { ChevronRight, Zap, Route, CheckCircle, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RouteExplorationHistory, JumpHierarchyNode } from '@/types/alternativeRoutes';

interface RouteExplorationBreadcrumbProps {
  history: RouteExplorationHistory;
  className?: string;
}

export const RouteExplorationBreadcrumb: React.FC<RouteExplorationBreadcrumbProps> = ({
  history,
  className = ''
}) => {
  if (!history || history.explorationPath.length <= 1) {
    return null; // Don't show for origin jump (level 0 only)
  }

  return (
    <div className={`mb-4 ${className}`}>
      {/* Exploration Trail Header */}
      <div className="flex items-center gap-2 mb-3">
        <Route className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
          Exploration Trail
        </span>
        <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
          Level {history.currentLevel}
        </Badge>
      </div>

      {/* Breadcrumb Trail */}
      <div className="relative p-4 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 rounded-xl pointer-events-none" />
        
        <div className="relative flex flex-wrap items-center gap-2">
          {history.explorationPath.map((node, index) => {
            const isOrigin = index === 0;
            const isCurrent = index === history.explorationPath.length - 1;
            const chosenRoute = node.alternativeBatch?.routes[node.alternativeBatch.chosenIndex ?? -1];
            
            return (
              <React.Fragment key={`${node.jumpId || index}-${index}`}>
                {/* Node */}
                <div 
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200
                    ${isCurrent 
                      ? 'bg-primary/15 border border-primary/40 text-primary shadow-sm shadow-primary/10' 
                      : 'bg-muted/30 border border-border/30 text-muted-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  {isOrigin ? (
                    <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                  <span className="text-xs font-medium truncate max-w-[120px] sm:max-w-[180px]">
                    {isOrigin ? 'Origin' : `Alt ${index}`}
                  </span>
                  {isCurrent && (
                    <CheckCircle className="w-3 h-3 flex-shrink-0 text-primary" />
                  )}
                </div>

                {/* Connector with chosen route label */}
                {!isCurrent && node.alternativeBatch && (
                  <div className="flex items-center gap-1">
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                    {chosenRoute && (
                      <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20">
                        <span className="text-[10px] text-muted-foreground">
                          Route {(node.alternativeBatch.chosenIndex ?? 0) + 1}:
                        </span>
                        <span className="text-[10px] font-medium text-foreground/80 truncate max-w-[100px]">
                          {chosenRoute.title}
                        </span>
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 sm:hidden" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current Jump Title */}
        {history.explorationPath.length > 1 && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">Current Jump:</span>
              <span className="text-foreground/80 truncate">
                {history.explorationPath[history.explorationPath.length - 1]?.jumpTitle || 'Generating...'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteExplorationBreadcrumb;
