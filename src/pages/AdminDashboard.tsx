import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
  Clock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ThemeToggle from "@/components/ThemeToggle";

interface AdminStats {
  totalUsers: number;
  totalSubscribers: number;
  totalOrders: number;
  totalRevenue: number;
  totalContacts: number;
  totalNewsletterSubscribers: number;
  totalLeadMagnetDownloads: number;
  abandonedCarts: number;
  completedOrders: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  averageOrderValue: number;
}

interface RecentOrder {
  id: string;
  user_email: string;
  amount: number;
  status: string;
  created_at: string;
  product_name: string;
  is_completed: boolean;
}

interface RecentSubscriber {
  id: string;
  email: string;
  subscription_tier: string;
  subscribed: boolean;
  created_at: string;
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
    totalOrders: 0,
    totalRevenue: 0,
    totalContacts: 0,
    totalNewsletterSubscribers: 0,
    totalLeadMagnetDownloads: 0,
    abandonedCarts: 0,
    completedOrders: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    averageOrderValue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentSubscribers, setRecentSubscribers] = useState<RecentSubscriber[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Admin access control - only specific email can access
  const ADMIN_EMAIL = "info@jumpinai.com";
  
  useEffect(() => {
    if (isLoading) return; // Wait for auth to resolve

    // Debug admin gate state
    console.log('Admin access check', {
      isLoading,
      isAuthenticated,
      email: user?.email,
    });

    if (!isAuthenticated) {
      // Preserve intended destination so Auth sends us back here
      navigate('/auth?next=/admin');
      return;
    }
    
    if (user?.email !== ADMIN_EMAIL) {
      toast.error("Access denied. Admin only.");
      navigate('/');
      return;
    }
    
    fetchAdminData();
    
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
      const { data, error } = await supabase.functions.invoke('admin-dashboard-data');
      if (error) throw error;

      // Set state from edge function payload
      setStats(data.stats);
      setRecentOrders(data.recentOrders);
      setRecentSubscribers(data.recentSubscribers);
      setContacts(data.contacts);
      setUsers(data.users);
      setAuthLogs(data.authLogs);
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

  if (!user || user.email !== ADMIN_EMAIL) {
    return null; // Prevent flash of content
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">Loading admin dashboard...</div>
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
            <CardTitle className="text-sm font-medium">Pro Subscribers</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
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
            <CardTitle className="text-sm font-medium">Lead Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeadMagnetDownloads}</div>
            <p className="text-xs text-muted-foreground">Lead magnet downloads</p>
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
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="auth-logs">Login Logs</TabsTrigger>
        </TabsList>

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
              <CardTitle>Pro Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell>{subscriber.email}</TableCell>
                      <TableCell>{subscriber.subscription_tier || 'Pro'}</TableCell>
                      <TableCell>
                        <Badge variant={subscriber.subscribed ? 'default' : 'secondary'}>
                          {subscriber.subscribed ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(subscriber.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>All Contacts ({stats.totalContacts})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{stats.totalNewsletterSubscribers}</div>
                  <p className="text-sm text-muted-foreground">Newsletter Subscribers</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{stats.totalLeadMagnetDownloads}</div>
                  <p className="text-sm text-muted-foreground">Lead Magnet Downloads</p>
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
                    <TableHead>Lead Magnet</TableHead>
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
                        {contact.lead_magnet_downloaded ? '✅' : '❌'}
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
                  <Download className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">
                    {users.filter(user => user.lead_magnet_downloaded).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Lead Downloads</p>
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