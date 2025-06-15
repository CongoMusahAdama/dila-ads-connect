
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AddBillboardModal from "@/components/AddBillboardModal";
import BookingRequestsModal from "@/components/BookingRequestsModal";
import ManageBillboardsModal from "@/components/ManageBillboardsModal";
import MyBookingsModal from "@/components/MyBookingsModal";
import ProfileSettings from "@/components/ProfileSettings";
import { Settings } from "lucide-react";

const Dashboard = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [showProfileSettings, setShowProfileSettings] = useState(false);
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

  const getDisplayName = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    } else if (profile.first_name) {
      return profile.first_name;
    } else if (profile.last_name) {
      return profile.last_name;
    }
    return profile.role === 'owner' ? 'Billboard Owner' : 'Advertiser';
  };

  const getInitials = () => {
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return profile.role === 'owner' ? 'BO' : 'AD';
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
              <Button 
                variant="ghost" 
                onClick={() => setShowProfileSettings(!showProfileSettings)}
                className="flex items-center gap-2"
              >
                <Settings size={16} />
                Profile
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
          {/* Welcome Section with Profile */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, {getDisplayName()}!
                </h1>
                <p className="text-muted-foreground">
                  Manage your billboard listings and bookings
                </p>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mt-1 italic">
                    "{profile.bio}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {showProfileSettings && (
            <div className="mb-8">
              <ProfileSettings />
            </div>
          )}

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
            <Button 
              variant="ghost" 
              onClick={() => setShowProfileSettings(!showProfileSettings)}
              className="flex items-center gap-2"
            >
              <Settings size={16} />
              Profile
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
        {/* Welcome Section with Profile */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {getDisplayName()}!
              </h1>
              <p className="text-muted-foreground">
                Find and book billboard spaces for your campaigns
              </p>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-1 italic">
                  "{profile.bio}"
                </p>
              )}
            </div>
          </div>
        </div>

        {showProfileSettings && (
          <div className="mb-8">
            <ProfileSettings />
          </div>
        )}

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
