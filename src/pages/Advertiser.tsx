
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BillboardSearch from "@/components/BillboardSearch";
import ComplaintForm from "@/components/ComplaintForm";
import ProfileSettings from "@/components/ProfileSettings";
import EnhancedBookingsList from "@/components/EnhancedBookingsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Settings, Calendar, FileText } from "lucide-react";

const Advertiser = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'bookings' | 'complaints'>('search');

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'advertiser')) {
      navigate('/login');
    }
  }, [user, profile, loading, navigate]);

  // Show loading state
  if (loading) {
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

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 sm:gap-4 p-1 bg-muted rounded-lg">
            <Button
              variant={activeTab === 'search' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('search')}
              className="h-10 px-4 flex items-center gap-2"
            >
              <span>Find Billboards</span>
            </Button>
            <Button
              variant={activeTab === 'bookings' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('bookings')}
              className="h-10 px-4 flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md"
            >
              <Calendar size={16} />
              <span>My Bookings</span>
            </Button>
            <Button
              variant={activeTab === 'complaints' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('complaints')}
              className="h-10 px-4 flex items-center gap-2"
            >
              <FileText size={16} />
              <span>Submit Complaint</span>
            </Button>
          </div>
        </div>

        {/* Content Based on Active Tab */}
        <div className="space-y-6">
          {activeTab === 'search' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  Find Billboards
                </CardTitle>
                <CardDescription className="text-sm">
                  Search and filter available billboards for your advertising campaigns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BillboardSearch />
              </CardContent>
            </Card>
          )}

          {activeTab === 'bookings' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">My Bookings</CardTitle>
                <CardDescription>
                  View and manage all your billboard booking requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedBookingsList />
              </CardContent>
            </Card>
          )}

          {activeTab === 'complaints' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Submit a Complaint</CardTitle>
                <CardDescription>
                  Report any issues or concerns to our admin team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComplaintForm />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Advertiser;
