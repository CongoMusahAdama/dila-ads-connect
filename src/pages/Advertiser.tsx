
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import BillboardSearch from "@/components/BillboardSearch";
import BookingsList from "@/components/BookingsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Advertiser = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

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

  console.log('Rendering dashboard');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.first_name || 'Advertiser'}!
          </h1>
          <p className="text-muted-foreground">
            Manage your billboard bookings and discover new advertising opportunities.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Find Billboards Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Find Billboards
                </CardTitle>
                <CardDescription>
                  Search and filter available billboards for your advertising campaigns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BillboardSearch />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Your booking status and activity will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bookings Section */}
        <div className="mt-8">
          <BookingsList />
        </div>
      </div>
    </div>
  );
};

export default Advertiser;
