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
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(tool => tool.category === filterCategory);
    }

    setFilteredTools(filtered);
  };

  const handleToolClick = (tool: UserTool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
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

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tools</h1>
          <p className="text-muted-foreground">
            AI tools generated from your jumps to help accelerate your projects
          </p>
        </div>

        <div className="glass rounded-xl p-4 shadow-modern">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Tools</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadTools}
                disabled={loading}
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Badge variant="secondary" className="text-xs">{tools.length} tools</Badge>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="glass rounded-xl p-4 shadow-modern">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tools by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category || ""}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tools by Jump */}
        {filteredTools.length === 0 ? (
          <Card className="glass text-center py-12 rounded-xl shadow-modern">
            <CardContent>
              <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-base font-medium text-muted-foreground mb-2">
                {tools.length === 0 ? "No tools yet" : "No tools found"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {tools.length === 0 
                  ? "Generate your personalized AI transformation plan in JumpinAI Studio to get custom tools"
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {tools.length === 0 && (
                <Button variant="outline" className="text-sm" onClick={() => window.location.href = '/jumpinai-studio'}>
                  <ExternalLink className="w-3 h-3 mr-2" />
                  Visit JumpinAI Studio
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
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
                // Sort by jump number descending (latest first), with unassigned last
                if (jumpIdA === 'unassigned') return 1;
                if (jumpIdB === 'unassigned') return -1;
                const jumpA = jumpIdA && jumpsInfo[jumpIdA];
                const jumpB = jumpIdB && jumpsInfo[jumpIdB];
                return (jumpB?.jumpNumber || 0) - (jumpA?.jumpNumber || 0);
              })
              .map(([jumpId, jumpTools]) => (
              <div key={jumpId} className="glass border rounded-xl p-5 bg-card shadow-modern">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                  <Rocket className="w-4 h-4 text-primary" />
                  <h3 className="text-lg font-semibold">
                    {jumpId === 'unassigned' 
                      ? 'Unassigned Tools' 
                      : jumpsInfo[jumpId] 
                        ? `Jump #${jumpsInfo[jumpId].jumpNumber} - ${jumpsInfo[jumpId].title}` 
                        : 'Loading Jump Info...'}
                  </h3>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {jumpTools.length} tool{jumpTools.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {jumpTools.map((tool) => (
                    <Card 
                      key={tool.id} 
                      className="group cursor-pointer hover:shadow-modern-lg transition-shadow relative rounded-lg"
                      onClick={() => handleToolClick(tool)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-base line-clamp-2">{tool.title}</CardTitle>
                            {tool.description && (
                              <CardDescription className="mt-1 line-clamp-3 text-xs">
                                {tool.description}
                              </CardDescription>
                            )}
                          </div>
                          {tool.ai_tool_type && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {tool.ai_tool_type}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {tool.category && (
                              <Badge variant="outline" className="text-xs">
                                {tool.category}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            {tool.setup_time && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>Setup: {tool.setup_time}</span>
                              </div>
                            )}
                            
                            {tool.cost_estimate && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <DollarSign className="h-3 w-3" />
                                <span>{tool.cost_estimate}</span>
                              </div>
                            )}
                          </div>
                          
                          {tool.tags && tool.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {tool.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {tool.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{tool.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
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