import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BillboardSearch from "@/components/BillboardSearch";
import BookingsList from "@/components/BookingsList";
import ProfileSettings from "@/components/ProfileSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Advertiser = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  console.log('Advertiser page - User:', user?.id, 'Profile:', profile?.role, 'Loading:', loading);

  useEffect(() => {
    console.log('Advertiser useEffect - User:', user?.id, 'Profile:', profile, 'Loading:', loading);
    if (!loading && (!user || profile?.role !== 'advertiser')) {
      console.log('Redirecting to login - no user or wrong role');
      navigate('/login');
    }
  }, [user, profile, loading, navigate]);

  // Show loading state
  if (loading) {
    console.log('Showing loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || profile?.role !== 'advertiser') {
    console.log('No user or wrong role, returning null');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  const getDisplayName = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    } else if (profile.first_name) {
      return profile.first_name;
    } else if (profile.last_name) {
      return profile.last_name;
    }
    return 'Advertiser';
  };

  const getInitials = () => {
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return 'AD';
  };

  console.log('Rendering dashboard');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
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
                Manage your billboard bookings and discover new advertising opportunities.
              </p>
              {profile.bio && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 italic break-words">
                  "{profile.bio}"
                </p>
              )}
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowProfileSettings(!showProfileSettings)}
            className="flex items-center gap-2 text-sm sm:text-base shrink-0"
            size="sm"
          >
            <Settings size={16} />
            <span className="hidden sm:inline">Profile Settings</span>
            <span className="sm:hidden">Profile</span>
          </Button>
        </div>

        {showProfileSettings && (
          <div className="mb-6 sm:mb-8">
            <ProfileSettings />
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Find Billboards Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  Find Billboards
                </CardTitle>
                <CardDescription className="text-sm">
                  Search and filter available billboards for your advertising campaigns.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <BillboardSearch />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg">Quick Overview</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                    Your booking status and activity will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-6 sm:my-8" />

        {/* Bookings Section */}
        <div className="mt-6 sm:mt-8">
          <BookingsList />
        </div>
      </div>
    </div>
  );
};

export default Advertiser;
