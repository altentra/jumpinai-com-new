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
  FileSpreadsheet
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
        { data: productsData }
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
        supabase.from('products').select('*')
      ]);

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
      </Tabs>
    </div>
  );
}