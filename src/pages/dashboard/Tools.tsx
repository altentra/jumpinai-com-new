import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { toolsService } from "@/services/toolsService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Settings, Clock, DollarSign, Tag, Rocket, RefreshCw, ExternalLink } from "lucide-react";
import { ToolDetailModal } from "@/components/ToolDetailModal";
import { useJumpsInfo } from "@/hooks/useJumpInfo";
import type { Database } from "@/integrations/supabase/types";

type UserTool = Database['public']['Tables']['user_tools']['Row'];

export default function Tools() {
  const [tools, setTools] = useState<UserTool[]>([]);
  const [filteredTools, setFilteredTools] = useState<UserTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<UserTool | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { user } = useAuth();
  
  // Get jump information for all tools
  const jumpIds = tools.map(tool => tool.jump_id);
  const { jumpsInfo } = useJumpsInfo(jumpIds);

  useEffect(() => {
    if (user?.id) {
      loadTools();
    }
  }, [user?.id]);

  useEffect(() => {
    filterTools();
  }, [tools, searchTerm, filterCategory]);

  const loadTools = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const userTools = await toolsService.getUserTools(user.id);
      setTools(userTools);
    } catch (error) {
      console.error('Error loading tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTools = () => {
    let filtered = tools;

    if (searchTerm) {
      filtered = filtered.filter(tool =>
        tool.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(tool => tool.category === filterCategory);
    }

    setFilteredTools(filtered);
  };

  const getUniqueCategories = () => {
    const categories = tools.map(tool => tool.category).filter(Boolean);
    return [...new Set(categories)];
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleToolClick = (tool: UserTool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Tools - JumpinAI Dashboard</title>
        <meta name="description" content="Manage and view your AI tools generated from JumpinAI Studio" />
      </Helmet>

      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        {/* Header - Mobile Optimized */}
        <div className="space-y-3 sm:space-y-1">
          <div className="block sm:hidden">
            <h1 className="text-2xl font-bold tracking-tight">My Tools</h1>
            <p className="text-sm text-muted-foreground">AI tools from your jumps</p>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-3xl font-bold tracking-tight">My Tools</h1>
            <p className="text-muted-foreground">AI tools generated from your jumps to help accelerate your projects</p>
          </div>
        </div>

        {/* Controls Section - Mobile Optimized */}
        <div className="glass rounded-xl p-3 sm:p-4 shadow-modern">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold">My Tools</h2>
              <Badge variant="secondary" className="text-xs">{filteredTools.length} tools</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadTools()}
              disabled={loading}
              className="shrink-0 self-end sm:self-auto"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Search and Filter Controls */}
          <div className="mt-4 space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[180px] text-sm">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getUniqueCategories().map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tools Grid - Mobile Optimized */}
        {filteredTools.length === 0 ? (
          <Card className="glass text-center py-8 sm:py-12 rounded-xl shadow-modern">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto">
                  <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-muted-foreground">
                  {tools.length === 0 ? 'No tools yet' : 'No tools found'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {tools.length === 0 
                    ? 'Generate your personalized AI transformation plan to get custom tools'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {tools.length === 0 && (
                  <Button 
                    variant="outline" 
                    className="text-sm mt-4" 
                    onClick={() => window.location.href = '/jumpinai-studio'}
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    Visit JumpinAI Studio
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Group tools by Jump */}
            {Object.entries(
              filteredTools.reduce((groups, tool) => {
                const jumpId = tool.jump_id || 'unassigned';
                if (!groups[jumpId]) groups[jumpId] = [];
                groups[jumpId].push(tool);
                return groups;
              }, {} as Record<string, UserTool[]>)
            )
              .sort(([jumpIdA], [jumpIdB]) => {
                if (jumpIdA === 'unassigned') return 1;
                if (jumpIdB === 'unassigned') return -1;
                return jumpIdB.localeCompare(jumpIdA);
              })
              .map(([jumpId, jumpTools]) => {
                const jumpInfo = jumpsInfo[jumpId] || { title: 'Unknown Jump', number: null };
                
                return (
                  <div key={jumpId} className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 px-1 sm:px-0">
                      <Rocket className="h-4 w-4 text-primary" />
                      <h3 className="text-base sm:text-lg font-semibold text-foreground">
                        {jumpInfo.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {jumpTools.length} {jumpTools.length === 1 ? 'tool' : 'tools'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {jumpTools.map((tool, index) => (
                        <Card 
                          key={tool.id}
                          className="glass cursor-pointer hover:shadow-lg transition-all duration-300 rounded-xl group"
                          onClick={() => handleToolClick(tool)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
                                {tool.title}
                              </CardTitle>
                              {tool.category && (
                                <Badge variant="outline" className="text-xs shrink-0 ml-2">
                                  <Tag className="w-2 h-2 mr-1" />
                                  {tool.category}
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-xs sm:text-sm line-clamp-3 mb-3">
                              {tool.description || 'No description available'}
                            </CardDescription>
                            
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                {tool.setup_time && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>{tool.setup_time}</span>
                                  </div>
                                )}
                                {tool.cost_estimate && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <DollarSign className="w-3 h-3" />
                                    <span>{tool.cost_estimate}</span>
                                  </div>
                                )}
                              </div>
                              {tool.difficulty_level && (
                                <Badge 
                                  className={`text-xs ${getDifficultyColor(tool.difficulty_level)}`}
                                  variant="secondary"
                                >
                                  {tool.difficulty_level}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <ToolDetailModal
        tool={selectedTool}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}