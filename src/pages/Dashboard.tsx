
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AddBillboardModal from "@/components/AddBillboardModal";
import BookingRequestsModal from "@/components/BookingRequestsModal";
import ManageBillboardsModal from "@/components/ManageBillboardsModal";
import MyBookingsModal from "@/components/MyBookingsModal";
import BillboardSearch from "@/components/BillboardSearch";
import ProfileSettings from "@/components/ProfileSettings";
import { Settings, Home, RefreshCw } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { apiClient } from "@/lib/api";

const Dashboard = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalBillboards: 0,
    activeBillboards: 0,
    pendingRequests: 0,
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const fetchDashboardStats = async () => {
    if (!user || profile?.role !== 'OWNER') return;

    setIsRefreshing(true);
    try {
      const response = await apiClient.getOwnerDashboardStats();
      setDashboardStats(response.stats);
      setRecentBookings(response.recentBookings);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (profile?.role === 'OWNER') {
      fetchDashboardStats();
      
      // Set up real-time updates every 30 seconds
      const interval = setInterval(fetchDashboardStats, 30000);
      
      return () => clearInterval(interval);
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
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    } else if (profile.firstName) {
      return profile.firstName;
    } else if (profile.lastName) {
      return profile.lastName;
    }
    return profile.role === 'OWNER' ? 'Billboard Owner' : 'Advertiser';
  };

  const getInitials = () => {
    const firstName = profile.firstName || '';
    const lastName = profile.lastName || '';
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return profile.role === 'OWNER' ? 'BO' : 'AD';
  };

  if (profile.role === 'OWNER') {
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
                onClick={() => navigate('/')}
                className="flex items-center gap-1 px-2"
                title="Home"
              >
                <Home size={16} />
                <span className="text-xs">Home</span>
              </Button>
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
                <AvatarImage src={profile.avatarUrl || ''} />
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

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Dashboard Analytics</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDashboardStats}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl sm:text-2xl font-bold">{dashboardStats.totalBillboards}</CardTitle>
                <CardDescription className="text-sm">Total Billboards</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl sm:text-2xl font-bold">{dashboardStats.activeBillboards}</CardTitle>
                <CardDescription className="text-sm">Active Billboards</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl sm:text-2xl font-bold">{dashboardStats.pendingRequests}</CardTitle>
                <CardDescription className="text-sm">Pending Requests</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl sm:text-2xl font-bold">{dashboardStats.totalBookings}</CardTitle>
                <CardDescription className="text-sm">Total Bookings</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl sm:text-2xl font-bold">${dashboardStats.totalRevenue.toLocaleString()}</CardTitle>
                <CardDescription className="text-sm">Total Revenue</CardDescription>
              </CardHeader>
            </Card>
            <Card>
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

          {/* Recent Bookings Section */}
          {recentBookings.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6">Recent Bookings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentBookings.slice(0, 6).map((booking: any) => (
                  <Card key={booking._id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{booking.billboardId?.name || 'Unknown Billboard'}</CardTitle>
                      <CardDescription className="text-sm">
                        {booking.billboardId?.location || 'Unknown Location'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Advertiser:</span>
                          <span>{booking.advertiserId?.profile?.firstName} {booking.advertiserId?.profile?.lastName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Amount:</span>
                          <span className="font-semibold">${booking.totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Status:</span>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Billboards Section for Owners */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">All Billboards</h2>
            <BillboardSearch />
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
              onClick={() => navigate('/')}
              className="flex items-center gap-1 px-2"
              title="Home"
            >
              <Home size={16} />
              <span className="text-xs">Home</span>
            </Button>
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
              <AvatarImage src={profile.avatarUrl || ''} />
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
