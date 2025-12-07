
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
  const [advertiserStats, setAdvertiserStats] = useState({
    totalRequests: 0,
    approvedBookings: 0,
    pendingBookings: 0,
    rejectedBookings: 0,
    upcomingBookings: 0,
    totalSpend: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [advertiserRecentBookings, setAdvertiserRecentBookings] = useState([]);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRefreshingAdvertiser, setIsRefreshingAdvertiser] = useState(false);

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

  const fetchAdvertiserDashboardStats = async () => {
    if (!user || profile?.role !== 'ADVERTISER') return;

    setIsRefreshingAdvertiser(true);
    try {
      const response = await apiClient.getAdvertiserDashboardStats();
      setAdvertiserStats(response.stats);
      setAdvertiserRecentBookings(response.recentBookings);
      setActiveCampaigns(response.activeCampaigns || []);
    } catch (error) {
      console.error('Error fetching advertiser stats:', error);
    } finally {
      setIsRefreshingAdvertiser(false);
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

  useEffect(() => {
    if (profile?.role === 'ADVERTISER') {
      fetchAdvertiserDashboardStats();
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
    const firstName = profile.firstName?.trim();
    const lastName = profile.lastName?.trim();

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    if (lastName) {
      return lastName;
    }

    if (user?.email) {
      const localPart = user.email.split('@')[0];
      if (localPart) {
        return localPart.charAt(0).toUpperCase() + localPart.slice(1);
      }
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

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Dashboard Analytics</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Track the performance of your billboard portfolio at a glance.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardStats}
              disabled={isRefreshing}
              className="flex items-center gap-2 self-start sm:self-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 sm:mb-8">
            <div className="rounded-2xl bg-emerald-400 text-white p-6 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between text-sm font-medium opacity-90">
                <span>Total Billboards</span>
                <span className="text-white/80">Overview</span>
              </div>
              <div className="mt-6 text-4xl font-extrabold">
                {dashboardStats.totalBillboards}
              </div>
              <ManageBillboardsModal
                trigger={
                  <button
                    className="mt-6 inline-flex items-center text-sm font-semibold text-white hover:text-white/90"
                  >
                    View billboards
                  </button>
                }
              />
            </div>

            <div className="rounded-2xl bg-amber-400 text-white p-6 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between text-sm font-medium opacity-90">
                <span>Active Billboards</span>
                <span className="text-white/80">Live Campaigns</span>
              </div>
              <div className="mt-6 text-4xl font-extrabold">
                {dashboardStats.activeBillboards}
              </div>
              <ManageBillboardsModal
                trigger={
                  <button
                    className="mt-6 inline-flex items-center text-sm font-semibold text-white hover:text-white/90"
                  >
                    View active
                  </button>
                }
              />
            </div>

            <div className="rounded-2xl bg-rose-400 text-white p-6 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between text-sm font-medium opacity-90">
                <span>Pending Requests</span>
                <span className="text-white/80">Awaiting Action</span>
              </div>
              <div className="mt-6 text-4xl font-extrabold">
                {dashboardStats.pendingRequests}
              </div>
              <BookingRequestsModal
                trigger={
                  <button
                    className="mt-6 inline-flex items-center text-sm font-semibold text-white hover:text-white/90"
                  >
                    View requests
                  </button>
                }
              />
            </div>

            <div className="rounded-2xl bg-purple-500 text-white p-6 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between text-sm font-medium opacity-90">
                <span>Total Revenue</span>
                <span className="text-white/80">Lifetime Earnings</span>
              </div>
              <div className="mt-6 text-3xl sm:text-4xl font-extrabold">
                GH₵ {dashboardStats.totalRevenue.toLocaleString()}
              </div>
              <BookingRequestsModal
                trigger={
                  <button
                    className="mt-6 inline-flex items-center text-sm font-semibold text-white hover:text-white/90"
                  >
                    View revenue
                  </button>
                }
              />
            </div>
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

            <Card id="manage-billboards">
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

            <Card id="booking-requests" className="sm:col-span-2 lg:col-span-1">
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
            <div id="recent-bookings" className="mt-8">
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
                          <span className="font-semibold">GH₵ {Number(booking.totalAmount || 0).toLocaleString()}</span>
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
          <div id="all-billboards" className="mt-8">
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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Campaign Analytics</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor your booking activity and campaign investments.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdvertiserDashboardStats}
            disabled={isRefreshingAdvertiser}
            className="flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshingAdvertiser ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 sm:mb-8">
          <div className="rounded-2xl bg-emerald-400 text-white p-6 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-sm font-medium opacity-90 relative z-10">
              <span>Total Requests</span>
              <span className="text-white/80">All time</span>
            </div>
            <div className="mt-6 text-4xl font-extrabold relative z-10">
              {advertiserStats.totalRequests}
            </div>
            <MyBookingsModal
              trigger={
                <button
                  className="mt-6 inline-flex items-center text-sm font-semibold text-white hover:text-white/90 relative z-10"
                >
                  View requests
                </button>
              }
              initialFilter="ALL"
            />
          </div>

          <div className="rounded-2xl bg-amber-400 text-white p-6 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-sm font-medium opacity-90 relative z-10">
              <span>Active Campaigns</span>
              <span className="text-white/80">Live Now</span>
            </div>
            <div className="mt-6 text-4xl font-extrabold relative z-10">
              {advertiserStats.approvedBookings}
            </div>

            {activeCampaigns.length > 0 ? (
              <div className="mt-3 relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Next Expiry:</p>
                <div className="text-sm font-medium">
                  {Math.ceil((new Date(activeCampaigns[0].endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                </div>
                <div className="text-xs opacity-75 truncate max-w-full">
                  {activeCampaigns[0].billboardId.name}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-white/80 relative z-10">
                No active campaigns
              </p>
            )}

            <MyBookingsModal
              trigger={
                <button
                  className="mt-4 inline-flex items-center text-sm font-semibold text-white hover:text-white/90 relative z-10"
                >
                  View active
                </button>
              }
              initialFilter="APPROVED"
            />
          </div>

          <div className="rounded-2xl bg-rose-400 text-white p-6 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-sm font-medium opacity-90 relative z-10">
              <span>Pending Requests</span>
              <span className="text-white/80">Awaiting owner action</span>
            </div>
            <div className="mt-6 text-4xl font-extrabold relative z-10">
              {advertiserStats.pendingBookings}
            </div>
            <p className="mt-3 text-sm text-white/80 relative z-10">
              Rejected: {advertiserStats.rejectedBookings}
            </p>
            <MyBookingsModal
              trigger={
                <button
                  className="mt-4 inline-flex items-center text-sm font-semibold text-white hover:text-white/90 relative z-10"
                >
                  View pending
                </button>
              }
              initialFilter="PENDING"
            />
          </div>

          <div className="rounded-2xl bg-purple-500 text-white p-6 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-sm font-medium opacity-90 relative z-10">
              <span>Total Spend</span>
              <span className="text-white/80">Approved bookings</span>
            </div>
            <div className="mt-6 text-3xl sm:text-4xl font-extrabold relative z-10">
              GH₵ {advertiserStats.totalSpend.toLocaleString()}
            </div>
            <MyBookingsModal
              trigger={
                <button
                  className="mt-6 inline-flex items-center text-sm font-semibold text-white hover:text-white/90 relative z-10"
                >
                  View details
                </button>
              }
              initialFilter="APPROVED"
            />
          </div>
        </div>

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

          <Card id="my-bookings">
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

        {advertiserRecentBookings.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {advertiserRecentBookings.map((booking: any) => (
                <Card key={booking._id} className="border bg-card/60 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{booking.billboardId?.name || 'Billboard'}</CardTitle>
                    <CardDescription className="text-sm">
                      {booking.billboardId?.location || 'Location unavailable'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Scheduled:</span>
                      <span className="font-medium">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <Badge variant={booking.status === 'APPROVED' ? 'default' : booking.status === 'PENDING' ? 'secondary' : 'destructive'}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Investment:</span>
                      <span className="font-semibold">GH₵ {Number(booking.totalAmount || 0).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
