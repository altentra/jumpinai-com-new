import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Sparkles, Clock, DollarSign, Tag, Rocket, RefreshCw, ExternalLink } from "lucide-react";
import { ToolPromptDetailModal } from "@/components/ToolPromptDetailModal";
import type { Database } from "@/integrations/supabase/types";

type UserToolPrompt = Database['public']['Tables']['user_tool_prompts']['Row'];
type UserJump = Database['public']['Tables']['user_jumps']['Row'];

interface JumpWithPrompts {
  jump: UserJump;
  prompts: UserToolPrompt[];
}

export default function ToolsPrompts() {
  const [jumpsWithPrompts, setJumpsWithPrompts] = useState<JumpWithPrompts[]>([]);
  const [filteredJumps, setFilteredJumps] = useState<JumpWithPrompts[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedToolPrompt, setSelectedToolPrompt] = useState<UserToolPrompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    filterData();
  }, [jumpsWithPrompts, searchTerm, filterCategory]);

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('📥 Loading data for user:', user.id);

      // Fetch tool prompts with optimized query (no large content field)
      const { data: toolPrompts, error: promptsError } = await supabase
        .from('user_tool_prompts')
        .select('id, jump_id, title, description, tool_name, category, difficulty_level, setup_time, cost_estimate, tool_url, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (promptsError) throw promptsError;
      
      console.log('✅ Loaded tool prompts:', toolPrompts?.length || 0);

      if (!toolPrompts || toolPrompts.length === 0) {
        setJumpsWithPrompts([]);
        setLoading(false);
        return;
      }

      // Get unique jump IDs
      const uniqueJumpIds = [...new Set(toolPrompts.map(tp => tp.jump_id).filter(Boolean))];
      console.log('🎯 Unique jump IDs:', uniqueJumpIds.length);

      // Fetch jumps with only needed fields (no full_content or plans)
      const { data: jumps, error: jumpsError } = await supabase
        .from('user_jumps')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .in('id', uniqueJumpIds)
        .order('created_at', { ascending: false });

      if (jumpsError) throw jumpsError;

      console.log('✅ Loaded jumps:', jumps?.length || 0);

      // Group prompts by jump
      const grouped: JumpWithPrompts[] = (jumps || []).map(jump => ({
        jump: jump as any,
        prompts: toolPrompts as any
      })).filter(group => group.prompts.length > 0);

      // Filter prompts for each jump
      const finalGrouped = grouped.map(group => ({
        ...group,
        prompts: toolPrompts.filter(tp => tp.jump_id === group.jump.id) as any
      })).filter(group => group.prompts.length > 0);

      console.log('✅ Created groups:', finalGrouped.length);
      setJumpsWithPrompts(finalGrouped);
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setJumpsWithPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = jumpsWithPrompts;

    if (searchTerm) {
      filtered = filtered.map(group => ({
        ...group,
        prompts: group.prompts.filter(tp =>
          tp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tp.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tp.tool_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(group => group.prompts.length > 0);
    }

    if (filterCategory !== "all") {
      filtered = filtered.map(group => ({
        ...group,
        prompts: group.prompts.filter(tp => tp.category === filterCategory)
      })).filter(group => group.prompts.length > 0);
    }

    setFilteredJumps(filtered);
  };

  const getUniqueCategories = () => {
    const allPrompts = jumpsWithPrompts.flatMap(g => g.prompts);
    const categories = allPrompts.map(tp => tp.category).filter(Boolean);
    return [...new Set(categories)];
  };

  const getTotalPromptsCount = () => {
    return filteredJumps.reduce((sum, group) => sum + group.prompts.length, 0);
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
    setSelectedToolPrompt(toolPrompt);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your tools & prompts...</p>
      </div>
    );
  }

  const totalItems = getTotalPromptsCount();
  const hasNoData = jumpsWithPrompts.length === 0;

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
              <Badge variant="secondary" className="text-xs">{totalItems} items</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData()}
              disabled={loading}
              className="shrink-0 self-end sm:self-auto"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {!hasNoData && (
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
          )}
        </div>

        {filteredJumps.length === 0 ? (
          <Card className="glass text-center py-8 sm:py-12 rounded-xl shadow-modern">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-muted-foreground">
                  {hasNoData ? 'No tools & prompts yet' : 'No items found'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {hasNoData 
                    ? 'Generate your personalized AI transformation plan to get custom tools paired with prompts'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {hasNoData && (
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
            {filteredJumps.map(({ jump, prompts }) => (
              <div key={jump.id} className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 px-1 sm:px-0">
                  <Rocket className="h-4 w-4 text-primary" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    {jump.title}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {prompts.length} {prompts.length === 1 ? 'item' : 'items'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {prompts.map((tp) => (
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
            ))}
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
