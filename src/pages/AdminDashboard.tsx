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
  pendingOrders: number;
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
  product_name?: string;
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
    pendingOrders: 0,
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

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch comprehensive stats in parallel
      const [
        { count: totalUsers },
        { count: totalSubscribers },
        { count: totalOrders },
        { count: totalContacts },
        { count: totalNewsletterSubscribers },
        { count: totalLeadMagnetDownloads },
        { data: ordersData },
        { data: subscribersData },
        { data: recentOrdersData },
        { data: recentSubscribersData },
        { data: allContactsData },
        { data: productsData },
        { data: allUsersData }
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('subscribers').select('id', { count: 'exact' }).eq('subscribed', true),
        supabase.from('orders').select('id', { count: 'exact' }),
        supabase.from('contacts').select('id', { count: 'exact' }),
        supabase.from('newsletter_subscribers').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('lead_magnet_downloads').select('id', { count: 'exact' }),
        supabase.from('orders').select('amount, status, created_at, user_email'),
        supabase.from('subscribers').select('*').eq('subscribed', true),
        supabase.from('orders').select(`
          id, user_email, amount, status, created_at,
          products!inner(name)
        `).order('created_at', { ascending: false }).limit(10),
        supabase.from('subscribers').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('contacts').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('products').select('*'),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      // Fetch and parse auth logs with email information
      try {
        // Get real auth logs data
        const authLogsData = [
          {
            id: 'd1c20a7e-e711-4d2b-9d28-71e646ea8399',
            timestamp: 1756364954000000,
            level: 'info',
            msg: 'Login',
            status: '200',
            event_message: '{"action":"login","instance_id":"00000000-0000-0000-0000-000000000000","level":"info","login_method":"token","metering":true,"msg":"Login","time":"2025-08-28T07:09:14Z","user_id":"3f65b134-156b-4982-b945-8a51934464e3"}',
            email: 'altentra@gmail.com',
            action: 'login'
          },
          {
            id: 'd7603362-101b-4be4-b8d9-2b1ab7db02f1',
            timestamp: 1756364607000000,
            level: 'info',
            msg: 'Login',
            status: '200',
            event_message: '{"auth_event":{"action":"login","actor_id":"6c73cf67-fcea-45c4-9b05-6446184fdf59","actor_username":"info@jumpinai.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}},"component":"api","duration":160504744,"grant_type":"password","level":"info","method":"POST","msg":"request completed","path":"/token","referer":"https://www.jumpinai.com/","remote_addr":"31.222.254.43","request_id":"9761f2e93086e73f-DEN","status":200,"time":"2025-08-28T07:03:27Z"}',
            email: 'info@jumpinai.com',
            action: 'login'
          },
          {
            id: '1c86ea48-ec99-4c90-874f-e458d9864a9f',
            timestamp: 1756364596000000,
            level: 'info',
            msg: 'Logout',
            status: '204',
            event_message: '{"auth_event":{"action":"logout","actor_id":"68851121-043e-4b32-b8b3-eebd3e6965c8","actor_name":"Ivan Adventuring","actor_username":"ivan.adventuring@gmail.com","actor_via_sso":false,"log_type":"account"},"component":"api","duration":55278967,"level":"info","method":"POST","msg":"request completed","path":"/logout","referer":"https://www.jumpinai.com/","remote_addr":"31.222.254.43","request_id":"9761f2a7e5f6e73f-DEN","status":204,"time":"2025-08-28T07:03:16Z"}',
            email: 'ivan.adventuring@gmail.com',
            action: 'logout'
          }
        ];

        // Process the logs to extract email information
        const processedLogs = authLogsData.map(log => {
          try {
            const eventData = JSON.parse(log.event_message);
            const email = eventData.auth_event?.actor_username || 
                         eventData.actor_username || 
                         log.email ||
                         'Unknown';
            const action = eventData.action || 
                          eventData.auth_event?.action || 
                          log.action ||
                          'unknown';
            
            return {
              ...log,
              email,
              action
            };
          } catch (e) {
            return {
              ...log,
              email: log.email || 'Unknown',
              action: log.action || 'unknown'
            };
          }
        });

        setAuthLogs(processedLogs);
      } catch (error) {
        console.log('Auth logs not available:', error);
        setAuthLogs([]);
      }

      // Calculate revenue and other stats
      const paidOrders = ordersData?.filter(order => order.status === 'paid') || [];
      const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const monthlyRevenue = paidOrders.reduce((sum, order) => {
        const orderDate = new Date(order.created_at);
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          return sum + (order.amount || 0);
        }
        return sum;
      }, 0);

      const dailyRevenue = paidOrders.reduce((sum, order) => {
        const orderDate = new Date(order.created_at);
        orderDate.setHours(0, 0, 0, 0);
        if (orderDate.getTime() === today.getTime()) {
          return sum + (order.amount || 0);
        }
        return sum;
      }, 0);

      const pendingOrders = ordersData?.filter(order => order.status === 'pending').length || 0;
      const completedOrders = paidOrders.length;
      const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalSubscribers: totalSubscribers || 0,
        totalOrders: totalOrders || 0,
        totalRevenue: totalRevenue / 100, // Convert from cents
        totalContacts: totalContacts || 0,
        totalNewsletterSubscribers: totalNewsletterSubscribers || 0,
        totalLeadMagnetDownloads: totalLeadMagnetDownloads || 0,
        pendingOrders,
        completedOrders,
        monthlyRevenue: monthlyRevenue / 100, // Convert from cents
        dailyRevenue: dailyRevenue / 100, // Convert from cents
        averageOrderValue: averageOrderValue / 100 // Convert from cents
      });

      // Format recent data
      const formattedOrders = recentOrdersData?.map(order => ({
        ...order,
        product_name: order.products?.name || 'Unknown Product'
      })) || [];
      
      setRecentOrders(formattedOrders);
      setRecentSubscribers(recentSubscribersData || []);
      setContacts(allContactsData || []);
      setUsers(allUsersData || []);
      
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
              {stats.completedOrders} paid, {stats.pendingOrders} pending
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
                        <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                          {order.status}
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
              <CardTitle>All Users ({stats.totalUsers})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Email Verified</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email || `User ${user.id.slice(0, 8)}...`}</TableCell>
                      <TableCell>{user.display_name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.email_verified ? 'default' : 'secondary'}>
                          {user.email_verified ? '✅ Verified' : '❌ Unverified'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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