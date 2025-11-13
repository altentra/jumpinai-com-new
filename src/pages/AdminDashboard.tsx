import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Users, 
  CreditCard, 
  Download, 
  TrendingUp, 
  DollarSign, 
  RefreshCcw,
  Mail,
  Crown,
  ShoppingBag,
  BarChart3,
  FileSpreadsheet,
  Shield,
  UserCheck,
  Clock,
  Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ThemeToggle from "@/components/ThemeToggle";

interface AdminStats {
  totalUsers: number;
  totalSubscribers: number;
  starterSubscribers: number;
  proSubscribers: number;
  growthSubscribers: number;
  totalOrders: number;
  totalRevenue: number;
  totalContacts: number;
  totalNewsletterSubscribers: number;
  totalJumps: number;
  successfulJumps: number;
  failedJumps: number;
  guestJumps: number;
  abandonedCarts: number;
  completedOrders: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  last7DaysRevenue: number;
  ytdRevenue: number;
  averageOrderValue: number;
}

interface JumpGeneration {
  id: string;
  user_id: string | null;
  user_email: string | null;
  title: string;
  full_content: string;
  status: string;
  created_at: string;
  ip_address?: string;
  location?: string;
  is_guest: boolean;
  form_goals?: string;
  form_challenges?: string;
}

interface CreditOverview {
  user_id: string;
  user_email: string;
  credits_balance: number;
  total_credits_purchased: number;
  recent_transactions: CreditTransaction[];
}

interface CreditTransaction {
  id: string;
  transaction_type: string;
  credits_amount: number;
  description: string;
  created_at: string;
}

interface GuestUser {
  ip_address: string;
  user_agent: string | null;
  usage_count: number;
  remaining_uses: number;
  last_used_at: string;
  created_at: string;
  location?: string;
  jump_attempts: Array<{
    id: string;
    title: string;
    full_content: string;
    status: string;
    created_at: string;
    location?: string;
    form_goals?: string;
    form_challenges?: string;
  }>;
}

interface GuestJump {
  id: string;
  title: string;
  full_content: string;
  status: string;
  created_at: string;
  ip_address?: string;
  location?: string;
}

interface RecentOrder {
  id: string;
  user_email: string;
  amount: number;
  status: string;
  created_at: string;
  product_name: string;
  is_completed: boolean;
  is_subscription: boolean;
}

interface RecentSubscriber {
  id: string;
  user_id: string | null;
  email: string;
  subscribed: boolean;
  subscription_end: string | null;
  subscription_tier: string | null;
  created_at: string;
  stripe_customer_id: string | null;
  last_login: string | null;
  total_paid: number;
  total_subscription_paid: number;
  total_downloads: number;
  completed_orders: number;
  subscription_payments: number;
  product_purchases: number;
  subscription_payment_history: Array<{
    id: string;
    amount: number;
    created_at: string;
    product_name: string;
  }>;
  audit_logs: Array<{
    id: string;
    action: string;
    old_data: any;
    new_data: any;
    created_at: string;
    changed_by: string | null;
    change_source: string;
  }>;
}

interface Contact {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  source: string;
  status: string;
  newsletter_subscribed: boolean;
  lead_magnet_downloaded: boolean;
  tags: string[];
  created_at: string;
}

interface AuthLog {
  id: string;
  timestamp: number;
  level: string;
  msg: string;
  status?: string;
  error?: string;
  event_message: string;
  email?: string;
  action?: string;
}

interface User {
  id: string;
  email?: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  email_verified: boolean;
  subscription_status?: 'active' | 'expired' | 'none';
  subscription_tier?: string;
  subscription_end?: string;
  total_orders?: number;
  total_purchase_attempts?: number;
  total_spent?: number;
  last_order_date?: string;
  total_downloads?: number;
  newsletter_subscribed?: boolean;
  lead_magnet_downloaded?: boolean;
  last_login?: string;
  latestIpAddress?: string | null;
  latestLocation?: string | null;
  completed_orders?: Array<{
    id: string;
    amount: number;
    product_name: string;
    created_at: string;
    download_count: number;
  }>;
  purchase_attempts?: Array<{
    id: string;
    amount: number;
    product_name: string;
    created_at: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSubscribers: 0,
    starterSubscribers: 0,
    proSubscribers: 0,
    growthSubscribers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalContacts: 0,
    totalNewsletterSubscribers: 0,
    totalJumps: 0,
    successfulJumps: 0,
    failedJumps: 0,
    guestJumps: 0,
    abandonedCarts: 0,
    completedOrders: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    last7DaysRevenue: 0,
    ytdRevenue: 0,
    averageOrderValue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentSubscribers, setRecentSubscribers] = useState<RecentSubscriber[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [jumpGenerations, setJumpGenerations] = useState<JumpGeneration[]>([]);
  const [creditOverviews, setCreditOverviews] = useState<CreditOverview[]>([]);
  const [guestUsers, setGuestUsers] = useState<GuestUser[]>([]);
  const [allGuestJumps, setAllGuestJumps] = useState<GuestJump[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);
  
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (isLoading) return; // Wait for auth to resolve

      if (!isAuthenticated) {
        navigate('/auth?next=/admin');
        return;
      }
      
      // Check if user has admin role using RPC
      try {
        const { data: isAdmin, error } = await supabase.rpc('has_role', {
          _user_id: user?.id,
          _role: 'admin'
        });
        
        if (error) {
          console.error('Error checking admin role:', error);
          toast.error("Access denied. Admin only.");
          navigate('/');
          return;
        }
        
        if (!isAdmin) {
          toast.error("Access denied. Admin only.");
          navigate('/');
          return;
        }
        
        setIsCheckingAdmin(false);
        fetchAdminData();
      } catch (error) {
        console.error('Error checking admin access:', error);
        toast.error("Access denied. Admin only.");
        navigate('/');
      }
    };

    checkAdminAccess();
    
    // Set up real-time subscriptions for continuous updates
    const ordersChannel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        console.log('Orders updated, refreshing data...');
        fetchAdminData();
      })
      .subscribe();

    const subscribersChannel = supabase
      .channel('admin-subscribers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscribers' }, () => {
        console.log('Subscribers updated, refreshing data...');
        fetchAdminData();
      })
      .subscribe();

    const contactsChannel = supabase
      .channel('admin-contacts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
        console.log('Contacts updated, refreshing data...');
        fetchAdminData();
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('admin-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        console.log('Profiles updated, refreshing data...');
        fetchAdminData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(subscribersChannel);
      supabase.removeChannel(contactsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [user, isAuthenticated, isLoading, navigate]);

  const fetchComprehensiveUserData = async () => {
    try {
      // Get all profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!profilesData) return [];

      // Get all orders, subscribers, contacts, lead downloads to build comprehensive user profiles
      const [
        { data: ordersData },
        { data: subscribersData },
        { data: contactsData },
        { data: leadDownloadsData }
      ] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('subscribers').select('*'),
        supabase.from('contacts').select('*'),
        supabase.from('lead_magnet_downloads').select('*')
      ]);

      // Create comprehensive user profiles
      const comprehensiveUsers: User[] = profilesData.map(profile => {
        const userSubscription = subscribersData?.find(sub => sub.user_id === profile.id);
        
        // Find email from various sources - use user_email to match orders
        const userOrders = ordersData?.filter(order => 
          // Try to match orders by finding users with matching emails in other tables
          userSubscription?.email === order.user_email
        ) || [];
        
        const userContact = contactsData?.find(contact => 
          // Try to match by finding contacts with matching emails from orders or subscriptions
          (contact.email && userOrders.some(order => order.user_email === contact.email)) ||
          (contact.email && userSubscription?.email === contact.email)
        );
        
        const userDownloads = leadDownloadsData?.filter(download => 
          userContact?.email && download.email === userContact.email
        ) || [];

        // Get email from various sources in order of preference
        const email = userOrders[0]?.user_email || 
          userSubscription?.email || 
          userContact?.email || 
          undefined;

        // Calculate user stats
        const paidOrders = userOrders.filter(order => order.status === 'paid');
        const totalSpent = paidOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
        const lastOrder = paidOrders.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        // Determine subscription status
        let subscriptionStatus: 'active' | 'expired' | 'none' = 'none';
        if (userSubscription?.subscribed) {
          if (userSubscription.subscription_end) {
            const endDate = new Date(userSubscription.subscription_end);
            subscriptionStatus = endDate > new Date() ? 'active' : 'expired';
          } else {
            subscriptionStatus = 'active';
          }
        }

        return {
          ...profile,
          email,
          subscription_status: subscriptionStatus,
          subscription_tier: userSubscription?.subscription_tier,
          subscription_end: userSubscription?.subscription_end,
          total_orders: userOrders.length,
          total_spent: totalSpent / 100, // Convert from cents
          last_order_date: lastOrder?.created_at,
          total_downloads: userDownloads.length,
          newsletter_subscribed: userContact?.newsletter_subscribed || false,
          lead_magnet_downloaded: userContact?.lead_magnet_downloaded || false,
          last_login: undefined // We could add this from auth logs if needed
        };
      });

      return comprehensiveUsers;
    } catch (error) {
      console.error('Error fetching comprehensive user data:', error);
      return [];
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Get fresh session to ensure valid JWT token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast.error('Authentication session expired. Please refresh the page.');
        navigate('/auth?next=/admin');
        return;
      }

      // Call edge function with explicit authorization header
      const { data, error } = await supabase.functions.invoke('admin-dashboard-data', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) throw error;

      // Set state from edge function payload
      setStats(data.stats);
      setRecentOrders(data.recentOrders);
      setRecentSubscribers(data.recentSubscribers);
      setContacts(data.contacts);
      setUsers(data.users);
      setAuthLogs(data.authLogs);
      setJumpGenerations(data.jumpGenerations || []);
      setCreditOverviews(data.creditOverviews || []);
      setGuestUsers(data.guestUsers || []);
      setAllGuestJumps(data.allGuestJumps || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const syncToGoogleSheets = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-to-google-sheets', {
        body: { sync_all: true }
      });
      
      if (error) throw error;
      
      toast.success(`Successfully synced ${data.count} records to Google Sheets`);
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync to Google Sheets');
    } finally {
      setSyncing(false);
    }
  };

  if (isCheckingAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Verifying admin access...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div className="text-center space-y-3">
              <p className="text-muted-foreground">Loading admin dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">JumpinAI Business Analytics & Management</p>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
          <Button onClick={fetchAdminData} variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={syncToGoogleSheets} disabled={syncing}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {syncing ? 'Syncing...' : 'Sync to Sheets'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Subscribers</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              Starter: {stats.starterSubscribers} | Pro: {stats.proSubscribers} | Growth: {stats.growthSubscribers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedOrders} paid, {stats.abandonedCarts} abandoned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.monthlyRevenue.toFixed(2)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNewsletterSubscribers}</div>
            <p className="text-xs text-muted-foreground">Active newsletter subs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jump Generations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJumps}</div>
            <p className="text-xs text-muted-foreground">
              Success: {stats.successfulJumps} | Failed: {stats.failedJumps} | Guest: {stats.guestJumps}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.dailyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Today's earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per completed order</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <Tabs defaultValue="jumps" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jumps">Jump Generations</TabsTrigger>
          <TabsTrigger value="guests">Guest Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="credits">Credits Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="auth-logs">Login Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="jumps">
          <Card>
            <CardHeader>
              <CardTitle>Jump Generation Logs ({stats.totalJumps})</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track all jump generation attempts including successes, failures, and guest usage
              </p>
            </CardHeader>
            <CardContent>
              {jumpGenerations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No jump generations yet</p>
                  <p className="text-sm">Jump generation logs will appear here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Goals Input</TableHead>
                      <TableHead>Challenges Input</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date/Time (PST)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jumpGenerations.map((jump) => (
                      <TableRow key={jump.id}>
                        <TableCell>
                          {jump.is_guest ? (
                            <div>
                              <Badge variant="outline">Guest</Badge>
                              {jump.ip_address && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  IP: {jump.ip_address}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="font-medium">{jump.user_email || 'Unknown'}</div>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {jump.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant={jump.status === 'active' ? 'default' : 'destructive'}>
                            {jump.status === 'active' ? 'Success' : 'Failed'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={jump.is_guest ? 'secondary' : 'default'}>
                            {jump.is_guest ? 'Guest' : 'User'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs text-sm">
                            <p className="whitespace-normal break-words">{jump.form_goals || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs text-sm">
                            <p className="whitespace-normal break-words">{jump.form_challenges || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {jump.location || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(jump.created_at).toLocaleString('en-US', {
                            timeZone: 'America/Los_Angeles',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guests">
          <Card>
            <CardHeader>
              <CardTitle>Guest Users Activity</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track all guest user activity, jump attempts, usage limits, and detailed logs
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Guest Usage Tracking */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Guest User Tracking ({guestUsers.length} unique IPs)</h3>
                {guestUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No guest users yet</p>
                    <p className="text-sm">Guest user activity will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {guestUsers.map((guest) => (
                      <Card key={guest.ip_address} className="p-4 border-l-4 border-l-muted">
                          <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  📍 {guest.location || 'Unknown Location'}
                                </Badge>
                                <Badge variant={guest.usage_count >= 3 ? 'destructive' : 'default'}>
                                  {guest.usage_count}/3 uses
                                </Badge>
                                {guest.remaining_uses > 0 ? (
                                  <Badge variant="secondary">{guest.remaining_uses} remaining</Badge>
                                ) : (
                                  <Badge variant="destructive">Limit reached</Badge>
                                )}
                              </div>
                              {guest.user_agent && (
                                <p className="text-xs text-muted-foreground truncate max-w-md">
                                  {guest.user_agent}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-sm">
                              <div className="text-muted-foreground">Last Activity</div>
                              <div className="font-medium">
                                {new Date(guest.last_used_at).toLocaleDateString('en-US', {
                                  timeZone: 'America/Los_Angeles',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })} PST
                              </div>
                            </div>
                          </div>
                          
                          {/* Jump Generation Attempts */}
                          {guest.jump_attempts && guest.jump_attempts.length > 0 && (
                            <div className="pt-3 border-t">
                              <h4 className="text-sm font-semibold mb-2">Jump Generation Attempts ({guest.jump_attempts.length})</h4>
                              <div className="space-y-2">
                                {guest.jump_attempts.map((attempt) => (
                                <div key={attempt.id} className="p-3 bg-muted/30 rounded-lg space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge variant={attempt.status === 'active' ? 'default' : 'destructive'}>
                                        {attempt.status === 'active' ? 'Success' : 'Failed'}
                                      </Badge>
                                      <span className="text-sm font-medium">{attempt.title}</span>
                                      {attempt.location && (
                                        <Badge variant="outline" className="text-xs">
                                          {attempt.location}
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(attempt.created_at).toLocaleTimeString('en-US', {
                                        timeZone: 'America/Los_Angeles',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })} PST
                                    </span>
                                  </div>
                                  
                                   {/* Form Inputs */}
                                   <div className="space-y-2 text-xs">
                                     <div>
                                       <div className="font-medium text-muted-foreground mb-1">Goals:</div>
                                       <div className="bg-background/50 p-2 rounded border whitespace-normal break-words">
                                         {attempt.form_goals || 'N/A'}
                                       </div>
                                     </div>
                                     <div>
                                       <div className="font-medium text-muted-foreground mb-1">Challenges:</div>
                                       <div className="bg-background/50 p-2 rounded border whitespace-normal break-words">
                                         {attempt.form_challenges || 'N/A'}
                                       </div>
                                     </div>
                                   </div>
                                </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-2 border-t text-sm">
                            <div className="text-muted-foreground">
                              First Seen: {new Date(guest.created_at).toLocaleDateString('en-US', {
                                timeZone: 'America/Los_Angeles',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })} PST
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* All Guest Jump Attempts */}
              <div>
                <h3 className="text-lg font-semibold mb-4">All Guest Jump Attempts ({allGuestJumps.length})</h3>
                {allGuestJumps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No guest jumps yet</p>
                    <p className="text-sm">Guest jump generation attempts will appear here</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Content Preview</TableHead>
                        <TableHead>Location & Time (PST)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allGuestJumps.map((jump) => (
                        <TableRow key={jump.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {jump.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant={jump.status === 'active' ? 'default' : 'destructive'}>
                              {jump.status === 'active' ? 'Success' : 'Failed'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <p className="text-xs text-muted-foreground truncate">
                              {jump.full_content.substring(0, 100)}...
                            </p>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div>{jump.location || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground font-mono">{jump.ip_address}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(jump.created_at).toLocaleString('en-US', {
                                timeZone: 'America/Los_Angeles',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })} PST
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track all successful transactions and revenue breakdowns
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Revenue Breakdown Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${(stats.dailyRevenue || 0).toFixed(2)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Last 7 Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${(stats.last7DaysRevenue || 0).toFixed(2)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${(stats.monthlyRevenue || 0).toFixed(2)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Year-to-Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${(stats.ytdRevenue || 0).toFixed(2)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">${(stats.totalRevenue || 0).toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* All Successful Transactions */}
              <div>
                <h3 className="text-lg font-semibold mb-4">All Successful Transactions ({recentOrders.filter(o => o.is_completed).length})</h3>
                {recentOrders.filter(o => o.is_completed).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No transactions yet</p>
                    <p className="text-sm">Successful transactions will appear here</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Product/Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date/Time (PST)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders
                        .filter(o => o.is_completed)
                        .map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.user_email}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.product_name}</div>
                                {order.is_subscription && (
                                  <Badge variant="secondary" className="mt-1">Subscription</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {order.is_subscription ? (
                                <Badge variant="default">Subscription</Badge>
                              ) : (
                                <Badge variant="outline">One-time</Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-bold text-green-600">
                              ${(order.amount / 100).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(order.created_at).toLocaleString('en-US', {
                                timeZone: 'America/Los_Angeles',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })} PST
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits">
          <Card>
            <CardHeader>
              <CardTitle>Credits Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitor user credit balances and transaction history
              </p>
            </CardHeader>
            <CardContent>
              {creditOverviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No credit data yet</p>
                  <p className="text-sm">User credit information will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {creditOverviews.map((overview) => (
                    <Card key={overview.user_id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-lg">{overview.user_email}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="default" className="bg-primary">
                                Balance: {overview.credits_balance} credits
                              </Badge>
                              <Badge variant="secondary">
                                Purchased: {overview.total_credits_purchased} credits
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {overview.recent_transactions.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-sm font-medium mb-2">Recent Transactions</p>
                            <div className="space-y-1">
                              {overview.recent_transactions.slice(0, 5).map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {transaction.transaction_type}
                                    </Badge>
                                    <span className="text-muted-foreground">
                                      {transaction.description}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={transaction.credits_amount > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                      {transaction.credits_amount > 0 ? '+' : ''}{transaction.credits_amount}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(transaction.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.user_email}</TableCell>
                      <TableCell>{order.product_name}</TableCell>
                      <TableCell>${(order.amount / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={order.is_completed ? 'default' : 'destructive'}>
                          {order.is_completed ? 'Completed' : 'Purchase Attempt'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Active Subscribers</CardTitle>
              <p className="text-sm text-muted-foreground">
                Comprehensive subscription details including billing history and activity logs
              </p>
            </CardHeader>
            <CardContent>
              {recentSubscribers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No paid subscribers yet</p>
                  <p className="text-sm">Users with active subscriptions will appear here</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {recentSubscribers.map((sub) => (
                    <Card key={sub.id} className="border-l-4" style={{
                      borderLeftColor: 
                        sub.subscription_tier === 'JumpinAI Growth' ? 'hsl(var(--primary))' :
                        sub.subscription_tier === 'JumpinAI Pro' ? 'hsl(var(--secondary))' : 
                        'hsl(var(--muted))'
                    }}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{sub.email}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                sub.subscription_tier === 'JumpinAI Growth' ? 'default' :
                                sub.subscription_tier === 'JumpinAI Pro' ? 'secondary' : 
                                'outline'
                              }>
                                {sub.subscription_tier || 'N/A'}
                              </Badge>
                              <Badge variant={sub.subscribed ? "default" : "secondary"}>
                                {sub.subscribed ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="text-2xl font-bold">${(sub.total_subscription_paid || 0).toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">Total Subscription Revenue</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Subscription Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div>
                            <div className="text-sm text-muted-foreground">Subscribed On</div>
                            <div className="font-medium">{new Date(sub.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Expires On</div>
                            <div className="font-medium">
                              {sub.subscription_end 
                                ? new Date(sub.subscription_end).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : "N/A"}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Last Login</div>
                            <div className="font-medium">
                              {sub.last_login 
                                ? new Date(sub.last_login).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : "Never"}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Stripe Customer</div>
                            <div className="font-medium text-xs truncate">{sub.stripe_customer_id || "N/A"}</div>
                          </div>
                        </div>

                        {/* Payment History */}
                        {sub.subscription_payment_history && sub.subscription_payment_history.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Payment History ({sub.subscription_payments || 0} payments)</h4>
                            <div className="space-y-2">
                              {sub.subscription_payment_history.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                  <div>
                                    <div className="font-medium">{payment.product_name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {new Date(payment.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                  <div className="font-bold text-green-600">${(payment.amount || 0).toFixed(2)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Audit Logs */}
                        {sub.audit_logs && sub.audit_logs.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Subscription Activity Log ({sub.audit_logs.length} events)</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {sub.audit_logs.map((log) => (
                                <div key={log.id} className="p-2 bg-muted/30 rounded text-sm">
                                  <div className="flex items-center justify-between mb-1">
                                    <Badge variant="outline">{log.action}</Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(log.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  <div className="text-xs space-y-1">
                                    {log.old_data && (
                                      <div>
                                        <span className="text-muted-foreground">From:</span> Tier: {log.old_data.subscription_tier || 'N/A'}, 
                                        Active: {log.old_data.subscribed ? 'Yes' : 'No'}
                                      </div>
                                    )}
                                    {log.new_data && (
                                      <div>
                                        <span className="text-muted-foreground">To:</span> Tier: {log.new_data.subscription_tier || 'N/A'}, 
                                        Active: {log.new_data.subscribed ? 'Yes' : 'No'}
                                      </div>
                                    )}
                                    <div className="text-muted-foreground">
                                      Source: {log.change_source} {log.changed_by && `| Changed by: ${log.changed_by}`}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Additional Stats */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-sm text-muted-foreground">
                            Total Orders: {sub.completed_orders || 0} | Product Purchases: {sub.product_purchases || 0} | Downloads: {sub.total_downloads || 0}
                          </div>
                          <div className="text-sm font-medium">
                            All-Time Revenue: ${(sub.total_paid || 0).toFixed(2)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>All Contacts ({stats.totalContacts})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{stats.totalNewsletterSubscribers}</div>
                  <p className="text-sm text-muted-foreground">Newsletter Subscribers</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{stats.totalContacts}</div>
                  <p className="text-sm text-muted-foreground">All Contacts</p>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Newsletter</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.email}</TableCell>
                      <TableCell>
                        {contact.first_name || contact.last_name 
                          ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{contact.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={contact.status === 'active' ? 'default' : 'secondary'}>
                          {contact.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {contact.newsletter_subscribed ? '✅' : '❌'}
                      </TableCell>
                      <TableCell>
                        {new Date(contact.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <Button onClick={syncToGoogleSheets} className="mt-4" disabled={syncing}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {syncing ? 'Syncing...' : 'Export to Google Sheets'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Comprehensive User Profiles ({stats.totalUsers})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Crown className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">
                    {users.filter(user => user.subscription_status === 'active').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Subscribers</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">
                    {users.filter(user => (user.total_orders || 0) > 0).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Paying Customers</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Mail className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">
                    {users.filter(user => user.newsletter_subscribed).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Newsletter Subscribers</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">
                    {stats.totalJumps}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Jumps</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {users.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* User Info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {user.display_name || 'Unknown User'}
                            </h3>
                            <p className="text-muted-foreground">
                              {user.email || `User ${user.id.slice(0, 8)}...`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <Badge variant={user.email_verified ? 'default' : 'secondary'}>
                              {user.email_verified ? '✅ Verified' : '❌ Unverified'}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Joined:</span>
                            <br />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Subscription & Purchase Info */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Subscription & Purchases
                        </h4>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <Badge 
                              variant={
                                user.subscription_status === 'active' 
                                  ? 'default' 
                                  : user.subscription_status === 'expired'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {user.subscription_status === 'active' && '👑 Active'}
                              {user.subscription_status === 'expired' && '⏰ Expired'}
                              {user.subscription_status === 'none' && '🆓 Free'}
                            </Badge>
                          </div>
                          
                          {user.subscription_tier && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Tier:</span>
                              <span className="font-medium">{user.subscription_tier}</span>
                            </div>
                          )}
                          
                          {user.subscription_end && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Expires:</span>
                              <span className="text-sm">
                                {new Date(user.subscription_end).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Completed Orders:</span>
                            <Badge variant="default" className="bg-green-600">
                              {user.total_orders || 0} orders
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Purchase Attempts:</span>
                            <Badge variant="destructive">
                              {user.total_purchase_attempts || 0} attempts
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Spent:</span>
                            <span className="font-bold text-green-600">
                              ${(user.total_spent || 0).toFixed(2)}
                            </span>
                          </div>
                          
                          {user.last_order_date && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Last Order:</span>
                              <span className="text-sm">
                                {new Date(user.last_order_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Engagement & Activity */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Engagement & Activity
                        </h4>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Newsletter:</span>
                            <Badge variant={user.newsletter_subscribed ? 'default' : 'secondary'}>
                              {user.newsletter_subscribed ? '✅ Subscribed' : '❌ Not subscribed'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Lead Magnet:</span>
                            <Badge variant={user.lead_magnet_downloaded ? 'default' : 'secondary'}>
                              {user.lead_magnet_downloaded ? '✅ Downloaded' : '❌ Not downloaded'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Downloads:</span>
                            <Badge variant="outline">
                              {user.total_downloads || 0} downloads
                            </Badge>
                          </div>
                          
                          {user.last_login && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Last Login:</span>
                              <span className="text-sm">
                                {new Date(user.last_login).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          
                          {user.latestLocation && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Location:</span>
                              <span className="text-sm">
                                {user.latestLocation}
                              </span>
                            </div>
                          )}
                          
                          {user.latestIpAddress && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">IP Address:</span>
                              <span className="text-sm font-mono text-xs">
                                {user.latestIpAddress}
                              </span>
                            </div>
                          )}
                          
                          {/* User Value Assessment */}
                          <div className="mt-3 pt-2 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Value Level:</span>
                              <Badge 
                                variant={
                                  (user.total_spent || 0) > 50 
                                    ? 'default' 
                                    : (user.total_spent || 0) > 0 || user.subscription_status === 'active'
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {(user.total_spent || 0) > 50 && '💎 High Value'}
                                {(user.total_spent || 0) > 0 && (user.total_spent || 0) <= 50 && '💰 Customer'}
                                {user.subscription_status === 'active' && (user.total_spent || 0) === 0 && '👑 Subscriber'}
                                {(user.total_spent || 0) === 0 && user.subscription_status !== 'active' && user.newsletter_subscribed && '📧 Lead'}
                                {(user.total_spent || 0) === 0 && user.subscription_status !== 'active' && !user.newsletter_subscribed && '👀 Visitor'}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Purchase History */}
                          {user.completed_orders && user.completed_orders.length > 0 && (
                            <div className="pt-3 mt-3 border-t">
                              <p className="text-sm font-medium mb-2 text-green-600">Completed Purchases:</p>
                              <div className="space-y-2">
                                {user.completed_orders.map((order) => (
                                  <div key={order.id} className="text-xs bg-green-50 dark:bg-green-950/20 p-2 rounded">
                                    <div className="font-medium">{order.product_name}</div>
                                    <div className="text-muted-foreground">
                                      ${order.amount.toFixed(2)} • {new Date(order.created_at).toLocaleDateString()} • {order.download_count} downloads
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {user.purchase_attempts && user.purchase_attempts.length > 0 && (
                            <div className="pt-3 mt-3 border-t">
                              <p className="text-sm font-medium mb-2 text-orange-600">Purchase Attempts:</p>
                              <div className="space-y-2">
                                {user.purchase_attempts.map((attempt) => (
                                  <div key={attempt.id} className="text-xs bg-orange-50 dark:bg-orange-950/20 p-2 rounded">
                                    <div className="font-medium">{attempt.product_name}</div>
                                    <div className="text-muted-foreground">
                                      ${attempt.amount.toFixed(2)} • {new Date(attempt.created_at).toLocaleDateString()} • Not completed
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth-logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <UserCheck className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">
                    {authLogs.filter(log => log.msg?.includes('Login')).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Recent Logins</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">
                    {authLogs.filter(log => log.msg?.includes('Signup')).length}
                  </div>
                  <p className="text-sm text-muted-foreground">New Signups</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold">{authLogs.length}</div>
                  <p className="text-sm text-muted-foreground">Total Auth Events</p>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authLogs.slice(0, 20).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.timestamp / 1000).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {log.action === 'login' && <UserCheck className="h-4 w-4 text-green-600" />}
                          {log.action === 'logout' && <Clock className="h-4 w-4 text-orange-600" />}
                          {log.action === 'signup' && <Users className="h-4 w-4 text-blue-600" />}
                          {log.email || 'Unknown User'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            log.action === 'login' 
                              ? 'default' 
                              : log.action === 'logout'
                              ? 'secondary'
                              : log.action === 'signup'
                              ? 'outline'
                              : 'secondary'
                          }
                        >
                          {log.action?.charAt(0).toUpperCase() + log.action?.slice(1) || log.msg}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            log.status === '200' || log.status === '204' || log.level === 'info' 
                              ? 'default' 
                              : log.error 
                              ? 'destructive' 
                              : 'secondary'
                          }
                        >
                          {log.status || log.level || 'Success'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}