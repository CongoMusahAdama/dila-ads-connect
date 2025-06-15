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
import ThemeToggle from "@/components/ThemeToggle";

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
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                <span className="font-bold text-lg sm:text-xl">DilaAds</span>
                <span className="text-muted-foreground text-xs sm:text-sm">Owner Dashboard</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <Button variant="ghost" onClick={() => navigate('/')} className="text-sm">
                Home
              </Button>
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-sm">
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowProfileSettings(!showProfileSettings)}
                className="flex items-center gap-2 text-sm"
              >
                <Settings size={16} />
                <span className="hidden lg:inline">Profile</span>
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
                onClick={() => setShowProfileSettings(!showProfileSettings)}
                className="p-2"
              >
                <Settings size={16} />
              </Button>
              <ThemeToggle />
              <Button onClick={handleSignOut} variant="outline" size="sm" className="text-xs">
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 sm:py-8">
          {/* Welcome Section with Profile */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-sm sm:text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">
                  Welcome back, {getDisplayName()}!
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-1">
                  Manage your billboard listings and bookings
                </p>
                {profile.bio && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 italic break-words">
                    "{profile.bio}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {showProfileSettings && (
            <div className="mb-6 sm:mb-8">
              <ProfileSettings />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl sm:text-2xl font-bold">{dashboardStats.activeListings}</CardTitle>
                <CardDescription className="text-sm">Active Listings</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl sm:text-2xl font-bold">{dashboardStats.pendingRequests}</CardTitle>
                <CardDescription className="text-sm">Pending Requests</CardDescription>
              </CardHeader>
            </Card>
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl sm:text-2xl font-bold">{dashboardStats.occupancyRate}%</CardTitle>
                <CardDescription className="text-sm">Occupancy Rate</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Billboard Listings</CardTitle>
                <CardDescription className="text-sm">
                  Add new billboards to your inventory
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-3">
                <AddBillboardModal onBillboardAdded={handleBillboardAdded} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Manage Billboards</CardTitle>
                <CardDescription className="text-sm">
                  Edit and manage your existing billboards
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-3">
                <ManageBillboardsModal />
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Booking Requests</CardTitle>
                <CardDescription className="text-sm">
                  View and manage incoming booking requests
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-3">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <span className="font-bold text-lg sm:text-xl">DilaAds</span>
              <span className="text-muted-foreground text-xs sm:text-sm">Advertiser Dashboard</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-sm">
              Home
            </Button>
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-sm">
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShowProfileSettings(!showProfileSettings)}
              className="flex items-center gap-2 text-sm"
            >
              <Settings size={16} />
              <span className="hidden lg:inline">Profile</span>
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
              onClick={() => setShowProfileSettings(!showProfileSettings)}
              className="p-2"
            >
              <Settings size={16} />
            </Button>
            <ThemeToggle />
            <Button onClick={handleSignOut} variant="outline" size="sm" className="text-xs">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Welcome Section with Profile */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-sm sm:text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">
                Welcome back, {getDisplayName()}!
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                Find and book billboard spaces for your campaigns
              </p>
              {profile.bio && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 italic break-words">
                  "{profile.bio}"
                </p>
              )}
            </div>
          </div>
        </div>

        {showProfileSettings && (
          <div className="mb-6 sm:mb-8">
            <ProfileSettings />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Find Billboards</CardTitle>
              <CardDescription className="text-sm">
                Browse available billboard spaces in Ghana
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3">
              <Button className="w-full text-sm sm:text-base" onClick={() => navigate('/advertiser')}>
                Browse Billboards
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">My Bookings</CardTitle>
              <CardDescription className="text-sm">
                Track your booking requests and payments
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3">
              <MyBookingsModal />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
