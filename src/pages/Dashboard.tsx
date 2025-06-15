import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AddBillboardModal from "@/components/AddBillboardModal";
import BookingRequestsModal from "@/components/BookingRequestsModal";
import ManageBillboardsModal from "@/components/ManageBillboardsModal";
import MyBookingsModal from "@/components/MyBookingsModal";

const Dashboard = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [billboards, setBillboards] = useState([]);
  const [stats, setStats] = useState({
    activeBillboards: 0,
    pendingRequests: 0,
    occupancyRate: 0
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    activeListings: 0,
    pendingRequests: 0,
    occupancyRate: 0
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const fetchOwnerStats = async () => {
    if (!user) return;

    // Fetch billboards
    const { data: billboardsData } = await supabase
      .from('billboards')
      .select('*')
      .eq('owner_id', user.id);

    // Fetch pending requests
    const { data: requestsData } = await supabase
      .from('booking_requests')
      .select(`
        *,
        billboards!inner (owner_id)
      `)
      .eq('billboards.owner_id', user.id)
      .eq('status', 'pending');

    setBillboards(billboardsData || []);
    setStats({
      activeBillboards: billboardsData?.length || 0,
      pendingRequests: requestsData?.length || 0,
      occupancyRate: 0 // Calculate based on bookings
    });
  };

  useEffect(() => {
    if (user && profile?.role === 'owner') {
      fetchOwnerStats();
    }
  }, [user, profile]);

  const fetchDashboardStats = async () => {
    if (!user || profile?.role !== 'owner') return;

    try {
      // Fetch active listings count
      const { count: listingsCount } = await supabase
        .from('billboards')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('is_available', true);

      // Fetch pending requests count
      const { count: requestsCount } = await supabase
        .from('booking_requests')
        .select('*, billboards!inner(*)', { count: 'exact', head: true })
        .eq('billboards.owner_id', user.id)
        .eq('status', 'pending');

      setDashboardStats({
        activeListings: listingsCount || 0,
        pendingRequests: requestsCount || 0,
        occupancyRate: 0 // Placeholder for now
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    if (profile?.role === 'owner') {
      fetchDashboardStats();
    }
  }, [user, profile]);

  const handleBillboardAdded = () => {
    fetchDashboardStats();
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await signOut();
      navigate('/');
    }
  };

  if (profile.role === 'owner') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-secondary rounded-md flex items-center justify-center">
                <span className="font-bold text-secondary-foreground text-sm">D</span>
              </div>
              <span className="font-bold text-xl">DilaAds</span>
              <span className="text-muted-foreground">Owner Dashboard</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" onClick={() => navigate('/')}>
                Home
              </Button>
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button onClick={handleSignOut} variant="outline">
                Logout
              </Button>
            </nav>
            <Button onClick={handleSignOut} variant="outline" className="md:hidden">
              Logout
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {profile.first_name}!
            </h1>
            <p className="text-muted-foreground">
              Manage your billboard listings and bookings
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{dashboardStats.activeListings}</CardTitle>
                <CardDescription>Active Listings</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{dashboardStats.pendingRequests}</CardTitle>
                <CardDescription>Pending Requests</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{dashboardStats.occupancyRate}%</CardTitle>
                <CardDescription>Occupancy Rate</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Billboard Listings</CardTitle>
                <CardDescription>
                  Add new billboards to your inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddBillboardModal onBillboardAdded={handleBillboardAdded} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Billboards</CardTitle>
                <CardDescription>
                  Edit and manage your existing billboards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ManageBillboardsModal />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Requests</CardTitle>
                <CardDescription>
                  View and manage incoming booking requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingRequestsModal />
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    );
  }

  // Advertiser dashboard
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-secondary rounded-md flex items-center justify-center">
              <span className="font-bold text-secondary-foreground text-sm">D</span>
            </div>
            <span className="font-bold text-xl">DilaAds</span>
            <span className="text-muted-foreground">Advertiser Dashboard</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" onClick={() => navigate('/')}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              Logout
            </Button>
          </nav>
          <Button onClick={handleSignOut} variant="outline" className="md:hidden">
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile.first_name}!
          </h1>
          <p className="text-muted-foreground">
            Find and book billboard spaces for your campaigns
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Billboards</CardTitle>
              <CardDescription>
                Browse available billboard spaces in Ghana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/advertiser')}>
                Browse Billboards
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>
                Track your booking requests and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MyBookingsModal />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;