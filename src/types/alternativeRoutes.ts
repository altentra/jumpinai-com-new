// Types for tracking alternative routes hierarchy

export interface AlternativeRoute {
  title: string;
  description: string;
}

export interface AlternativeRouteBatch {
  routes: AlternativeRoute[];
  chosenIndex: number | null;
  chosenAt?: string; // Timestamp when route was chosen
}

export interface JumpHierarchyNode {
  jumpId?: string;
  jumpTitle: string;
  level: number; // 0 = origin, 1 = first alternative, 2 = second level alternative, etc.
  alternativeBatch?: AlternativeRouteBatch;
  parentJumpId?: string;
  generatedAt?: string;
}

export interface RouteExplorationHistory {
  originJump: {
    jumpId?: string;
    jumpTitle: string;
    formGoals: string;
    formChallenges: string;
  };
  explorationPath: JumpHierarchyNode[]; // Full path from origin to current
  currentLevel: number;
}

// Helper to create a new exploration history starting from an origin jump
export const createExplorationHistory = (
  jumpId: string | undefined,
  jumpTitle: string,
  formGoals: string,
  formChallenges: string
): RouteExplorationHistory => ({
  originJump: {
    jumpId,
    jumpTitle,
    formGoals,
    formChallenges,
  },
  explorationPath: [{
    jumpId,
    jumpTitle,
    level: 0,
    generatedAt: new Date().toISOString(),
  }],
  currentLevel: 0,
});

// Helper to add a new level to exploration history
export const addExplorationLevel = (
  history: RouteExplorationHistory,
  alternatives: AlternativeRoute[],
  chosenIndex: number,
  newJumpId: string | undefined,
  newJumpTitle: string
): RouteExplorationHistory => {
  const updatedPath = [...history.explorationPath];
  
  // Update the previous node with the chosen alternative batch
  if (updatedPath.length > 0) {
    const lastNode = updatedPath[updatedPath.length - 1];
    lastNode.alternativeBatch = {
      routes: alternatives,
      chosenIndex,
      chosenAt: new Date().toISOString(),
    };
  }
  
  // Add the new node for the generated jump
  const newNode: JumpHierarchyNode = {
    jumpId: newJumpId,
    jumpTitle: newJumpTitle,
    level: history.currentLevel + 1,
    parentJumpId: updatedPath[updatedPath.length - 1]?.jumpId,
    generatedAt: new Date().toISOString(),
  };
  
  updatedPath.push(newNode);
  
  return {
    ...history,
    explorationPath: updatedPath,
    currentLevel: history.currentLevel + 1,
  };
};
