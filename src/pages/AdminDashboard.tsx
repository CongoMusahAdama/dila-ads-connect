
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";
import { Home, Users, Building, Calendar, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface Analytics {
  totalUsers: number;
  totalBillboards: number;
  totalBookings: number;
  averageDuration: number;
}

interface Billboard {
  id: string;
  name: string;
  location: string;
  owner_id: string;
  is_approved: boolean;
  profiles: { first_name: string; last_name: string; };
}

interface Complaint {
  id: string;
  subject: string;
  description: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  profiles: { first_name: string; last_name: string; };
}

interface Dispute {
  id: string;
  dispute_reason: string;
  dispute_status: string | null;
  billboards: { name: string; };
  profiles: { first_name: string; last_name: string; };
}

const AdminDashboard = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 0,
    totalBillboards: 0,
    totalBookings: 0,
    averageDuration: 0
  });
  const [pendingBillboards, setPendingBillboards] = useState<Billboard[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    
    if (user) {
      checkAdminStatus();
    }
  }, [user, loading, navigate]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setIsAdmin(true);
      fetchAnalytics();
      fetchPendingBillboards();
      fetchComplaints();
      fetchDisputes();
    } else {
      navigate('/dashboard');
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Total billboards
      const { count: billboardsCount } = await supabase
        .from('billboards')
        .select('*', { count: 'exact', head: true });

      // Total bookings
      const { count: bookingsCount } = await supabase
        .from('booking_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Average duration
      const { data: bookings } = await supabase
        .from('booking_requests')
        .select('start_date, end_date')
        .eq('status', 'approved');

      let avgDuration = 0;
      if (bookings && bookings.length > 0) {
        const totalDays = bookings.reduce((sum, booking) => {
          const start = new Date(booking.start_date);
          const end = new Date(booking.end_date);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0);
        avgDuration = totalDays / bookings.length;
      }

      setAnalytics({
        totalUsers: usersCount || 0,
        totalBillboards: billboardsCount || 0,
        totalBookings: bookingsCount || 0,
        averageDuration: Math.round(avgDuration)
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchPendingBillboards = async () => {
    try {
      const { data } = await supabase
        .from('billboards')
        .select(`
          *,
          profiles!inner(first_name, last_name)
        `)
        .eq('is_approved', false);

      setPendingBillboards(data || []);
    } catch (error) {
      console.error('Error fetching pending billboards:', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      const { data } = await supabase
        .from('complaints')
        .select(`
          *,
          profiles!inner(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      setComplaints(data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const fetchDisputes = async () => {
    try {
      const { data } = await supabase
        .from('booking_requests')
        .select(`
          *,
          billboards!inner(name),
          profiles!inner(first_name, last_name)
        `)
        .eq('has_dispute', true);

      setDisputes(data || []);
    } catch (error) {
      console.error('Error fetching disputes:', error);
    }
  };

  const approveBillboard = async (billboardId: string) => {
    try {
      const { error } = await supabase
        .from('billboards')
        .update({ is_approved: true })
        .eq('id', billboardId);

      if (error) throw error;

      toast({
        title: "Billboard Approved",
        description: "The billboard has been approved successfully.",
      });

      fetchPendingBillboards();
      fetchAnalytics();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve billboard.",
        variant: "destructive",
      });
    }
  };

  const rejectBillboard = async (billboardId: string) => {
    try {
      const { error } = await supabase
        .from('billboards')
        .delete()
        .eq('id', billboardId);

      if (error) throw error;

      toast({
        title: "Billboard Rejected",
        description: "The billboard has been rejected and removed.",
      });

      fetchPendingBillboards();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject billboard.",
        variant: "destructive",
      });
    }
  };

  const respondToComplaint = async (complaintId: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ 
          admin_response: responseText,
          status: 'resolved'
        })
        .eq('id', complaintId);

      if (error) throw error;

      toast({
        title: "Response Sent",
        description: "Your response has been sent to the advertiser.",
      });

      setResponseText("");
      fetchComplaints();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send response.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await signOut();
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-secondary rounded-md flex items-center justify-center">
              <span className="font-bold text-secondary-foreground text-sm">D</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <span className="font-bold text-lg sm:text-xl">DilaAds</span>
              <span className="text-muted-foreground text-xs sm:text-sm">Admin Dashboard</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-sm">
              Home
            </Button>
            <Button variant="ghost" onClick={() => navigate('/admin')} className="text-sm">
              Admin Dashboard
            </Button>
            <ThemeToggle />
            <Button onClick={handleSignOut} variant="outline" className="text-sm">
              Logout
            </Button>
          </nav>
          <div className="md:hidden flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-1 px-2"
            >
              <Home size={16} />
              <span className="text-xs">Home</span>
            </Button>
            <ThemeToggle />
            <Button onClick={handleSignOut} variant="outline" size="sm" className="text-xs">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage platform operations and user interactions</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Billboards</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalBillboards}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful Bookings</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration (Days)</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageDuration}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Billboards */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Billboard Approvals</CardTitle>
            <CardDescription>Review and approve billboard listings</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingBillboards.length === 0 ? (
              <p className="text-muted-foreground">No pending approvals</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Billboard Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingBillboards.map((billboard) => (
                    <TableRow key={billboard.id}>
                      <TableCell className="font-medium">{billboard.name}</TableCell>
                      <TableCell>{billboard.location}</TableCell>
                      <TableCell>
                        {billboard.profiles.first_name} {billboard.profiles.last_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => approveBillboard(billboard.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => rejectBillboard(billboard.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Complaints */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Complaints</CardTitle>
            <CardDescription>Review and respond to user complaints</CardDescription>
          </CardHeader>
          <CardContent>
            {complaints.length === 0 ? (
              <p className="text-muted-foreground">No complaints submitted</p>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{complaint.subject}</h4>
                        <p className="text-sm text-muted-foreground">
                          From: {complaint.profiles.first_name} {complaint.profiles.last_name}
                        </p>
                      </div>
                      <Badge variant={complaint.status === 'resolved' ? 'default' : 'secondary'}>
                        {complaint.status}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{complaint.description}</p>
                    {complaint.admin_response && (
                      <div className="bg-muted p-3 rounded">
                        <p className="text-sm font-medium mb-1">Admin Response:</p>
                        <p className="text-sm">{complaint.admin_response}</p>
                      </div>
                    )}
                    {complaint.status === 'pending' && (
                      <div className="mt-3">
                        <Textarea
                          placeholder="Type your response..."
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          className="mb-2"
                        />
                        <Button 
                          onClick={() => respondToComplaint(complaint.id)}
                          disabled={!responseText.trim()}
                        >
                          Send Response
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disputes */}
        <Card>
          <CardHeader>
            <CardTitle>Active Disputes</CardTitle>
            <CardDescription>Settle disputes between users</CardDescription>
          </CardHeader>
          <CardContent>
            {disputes.length === 0 ? (
              <p className="text-muted-foreground">No active disputes</p>
            ) : (
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <div key={dispute.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{dispute.billboards.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Reported by: {dispute.profiles.first_name} {dispute.profiles.last_name}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Dispute
                      </Badge>
                    </div>
                    <p className="text-gray-700">{dispute.dispute_reason}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
