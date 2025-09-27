import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { toolsService } from "@/services/toolsService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Settings, Clock, DollarSign, Tag } from "lucide-react";
import { ToolDetailModal } from "@/components/ToolDetailModal";
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

        {/* Search and Filter Controls */}
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

        {/* Tools Grid */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No tools found</h3>
            <p className="text-muted-foreground">
              {tools.length === 0 
                ? "Generate some jumps in JumpinAI Studio to see your tools here."
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <Card 
                key={tool.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleToolClick(tool)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {tool.description}
                      </CardDescription>
                    </div>
                    {tool.ai_tool_type && (
                      <Badge variant="secondary" className="ml-2">
                        {tool.ai_tool_type}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tool.difficulty_level && (
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(tool.difficulty_level)}>
                          {tool.difficulty_level}
                        </Badge>
                      </div>
                    )}
                    
                    {tool.setup_time && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Setup: {tool.setup_time}</span>
                      </div>
                    )}
                    
                    {tool.cost_estimate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>{tool.cost_estimate}</span>
                      </div>
                    )}
                    
                    {tool.tags && tool.tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-wrap gap-1">
                          {tool.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {tool.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{tool.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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