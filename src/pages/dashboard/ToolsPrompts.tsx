import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { toolPromptsService } from "@/services/toolPromptsService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Sparkles, Clock, DollarSign, Tag, Rocket, RefreshCw, ExternalLink } from "lucide-react";
import { ToolPromptDetailModal } from "@/components/ToolPromptDetailModal";
import { useJumpsInfo } from "@/hooks/useJumpInfo";
import type { Database } from "@/integrations/supabase/types";

type UserToolPrompt = Database['public']['Tables']['user_tool_prompts']['Row'];

export default function ToolsPrompts() {
  const [toolPrompts, setToolPrompts] = useState<UserToolPrompt[]>([]);
  const [filteredToolPrompts, setFilteredToolPrompts] = useState<UserToolPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedToolPrompt, setSelectedToolPrompt] = useState<UserToolPrompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { user } = useAuth();
  
  const jumpIds = toolPrompts.map(tp => tp.jump_id).filter((id): id is string => !!id);
  const { jumpsInfo, isLoading: jumpsLoading } = useJumpsInfo(jumpIds);
  
  console.log('🎯 ToolsPrompts state:', {
    userLoggedIn: !!user,
    userId: user?.id,
    toolPromptsCount: toolPrompts.length,
    jumpIdsCount: jumpIds.length,
    jumpsInfoCount: Object.keys(jumpsInfo).length,
    jumpsLoading
  });

  useEffect(() => {
    console.log('🔄 ToolsPrompts useEffect - user:', user);
    console.log('🔄 User ID:', user?.id);
    console.log('🔄 User email:', user?.email);
    if (user?.id) {
      loadToolPrompts();
    } else {
      console.warn('⚠️ No authenticated user found');
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    filterToolPrompts();
  }, [toolPrompts, searchTerm, filterCategory]);

  const loadToolPrompts = async (forceRefresh: boolean = false) => {
    if (!user?.id) {
      console.log('❌ No user ID available for loading tool prompts');
      return;
    }
    
    console.log('📥 Loading tool prompts for user:', user.id);
    console.log('🔄 Force refresh requested:', forceRefresh);
    
    try {
      setLoading(true);
      const userToolPrompts = await toolPromptsService.getUserToolPrompts(user.id, forceRefresh);
      console.log('✅ Loaded tool prompts:', userToolPrompts);
      console.log('📊 Total tool prompts:', userToolPrompts.length);
      
      // Log unique jump IDs
      const uniqueJumpIds = [...new Set(userToolPrompts.map(tp => tp.jump_id))];
      console.log('🎯 Unique jump IDs:', uniqueJumpIds);
      console.log('📂 Total unique jumps:', uniqueJumpIds.length);
      
      // Log how many prompts per jump
      const promptsPerJump: Record<string, number> = {};
      userToolPrompts.forEach(tp => {
        if (tp.jump_id) {
          promptsPerJump[tp.jump_id] = (promptsPerJump[tp.jump_id] || 0) + 1;
        }
      });
      console.log('📊 Prompts per jump:', promptsPerJump);
      
      setToolPrompts(userToolPrompts);
    } catch (error) {
      console.error('❌ Error loading tool-prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterToolPrompts = () => {
    let filtered = toolPrompts;

    console.log('🔍 Filtering - Starting with:', toolPrompts.length, 'prompts');

    if (searchTerm) {
      filtered = filtered.filter(tp =>
        tp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tp.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tp.tool_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('🔍 After search filter:', filtered.length, 'prompts');
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(tp => tp.category === filterCategory);
      console.log('🔍 After category filter:', filtered.length, 'prompts');
    }

    console.log('✅ Final filtered count:', filtered.length);
    setFilteredToolPrompts(filtered);
  };

  const getUniqueCategories = () => {
    const categories = toolPrompts.map(tp => tp.category).filter(Boolean);
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

  const handleToolPromptClick = (toolPrompt: UserToolPrompt) => {
    console.log('🔍 Clicked tool prompt:', toolPrompt);
    console.log('🔍 Tool prompt content:', toolPrompt.content);
    setSelectedToolPrompt(toolPrompt);
    setIsModalOpen(true);
  };

  if (loading || jumpsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading tool prompts...' : 'Loading jump information...'}
        </p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Tools & Prompts - JumpinAI Dashboard</title>
        <meta name="description" content="Manage and view your AI tools with custom prompts generated from JumpinAI Studio" />
      </Helmet>

      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        <div className="space-y-3 sm:space-y-1">
          <div className="block sm:hidden">
            <h1 className="text-2xl font-bold tracking-tight">Tools & Prompts</h1>
            <p className="text-sm text-muted-foreground">AI tools paired with custom prompts</p>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-3xl font-bold tracking-tight">Tools & Prompts</h1>
            <p className="text-muted-foreground">AI tools paired with custom prompts from your jumps to accelerate implementation</p>
          </div>
        </div>

        <div className="glass rounded-xl p-3 sm:p-4 shadow-modern">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold">My Tools & Prompts</h2>
              <Badge variant="secondary" className="text-xs">{filteredToolPrompts.length} items</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadToolPrompts(true)}
              disabled={loading}
              className="shrink-0 self-end sm:self-auto"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="mt-4 space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tools and prompts..."
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

        {filteredToolPrompts.length === 0 ? (
          <Card className="glass text-center py-8 sm:py-12 rounded-xl shadow-modern">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-muted-foreground">
                  {toolPrompts.length === 0 ? 'No tools & prompts yet' : 'No items found'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {toolPrompts.length === 0 
                    ? 'Generate your personalized AI transformation plan to get custom tools paired with prompts'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {toolPrompts.length === 0 && (
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
            {(() => {
              const grouped = filteredToolPrompts.reduce((groups, tp) => {
                const jumpId = tp.jump_id || 'unassigned';
                if (!groups[jumpId]) groups[jumpId] = [];
                groups[jumpId].push(tp);
                return groups;
              }, {} as Record<string, UserToolPrompt[]>);
              
              console.log('📦 Grouped tool prompts:', Object.keys(grouped).length, 'groups');
              console.log('📦 Group details:', Object.entries(grouped).map(([id, items]) => ({ id, count: items.length })));
              
              const sortedEntries = Object.entries(grouped).sort(([jumpIdA], [jumpIdB]) => {
                if (jumpIdA === 'unassigned') return 1;
                if (jumpIdB === 'unassigned') return -1;
                return jumpIdB.localeCompare(jumpIdA);
              });
              
              console.log('📦 Sorted entries count:', sortedEntries.length);
              
              return sortedEntries.map(([jumpId, jumpToolPrompts]) => {
                const jumpInfo = jumpsInfo[jumpId];
                
                console.log('🔍 Rendering jump section:', jumpId, 'Info:', jumpInfo?.title || 'Loading...');
                
                // Show the section even if jump info is still loading
                const displayTitle = jumpInfo?.title || `Jump (Loading...)`;
                
                return (
                  <div key={jumpId} className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 px-1 sm:px-0">
                      <Rocket className="h-4 w-4 text-primary" />
                      <h3 className="text-base sm:text-lg font-semibold text-foreground">
                        {displayTitle}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {jumpToolPrompts.length} {jumpToolPrompts.length === 1 ? 'item' : 'items'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {jumpToolPrompts.map((tp) => (
                        <Card 
                          key={tp.id}
                          className="glass cursor-pointer hover:shadow-lg transition-all duration-300 rounded-xl group"
                          onClick={() => handleToolPromptClick(tp)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between mb-2">
                              <CardTitle className="text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
                                {tp.title}
                              </CardTitle>
                            </div>
                            {tp.tool_name && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Sparkles className="w-3 h-3" />
                                <span>{tp.tool_name}</span>
                              </div>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-xs sm:text-sm line-clamp-2 mb-3">
                              {tp.description || 'No description available'}
                            </CardDescription>
                            
                            <div className="flex items-center justify-between text-xs gap-2">
                              <div className="flex items-center gap-2">
                                {tp.category && (
                                  <Badge variant="outline" className="text-xs">
                                    <Tag className="w-2 h-2 mr-1" />
                                    {tp.category}
                                  </Badge>
                                )}
                              </div>
                              {tp.difficulty_level && (
                                <Badge 
                                  className={`text-xs ${getDifficultyColor(tp.difficulty_level)}`}
                                  variant="secondary"
                                >
                                  {tp.difficulty_level}
                                </Badge>
                              )}
                            </div>

                            {(tp.setup_time || tp.cost_estimate) && (
                              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                                {tp.setup_time && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{tp.setup_time}</span>
                                  </div>
                                )}
                                {tp.cost_estimate && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    <span>{tp.cost_estimate}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>

      <ToolPromptDetailModal
        toolPrompt={selectedToolPrompt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
