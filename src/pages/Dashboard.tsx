import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Dashboard = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

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
    await signOut();
    navigate('/');
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
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
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
                <CardTitle className="text-2xl font-bold">0</CardTitle>
                <CardDescription>Active Listings</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">0</CardTitle>
                <CardDescription>Pending Requests</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">0%</CardTitle>
                <CardDescription>Occupancy Rate</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Billboard Listings</CardTitle>
                <CardDescription>
                  Add new billboards or edit existing ones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Add New Billboard
                </Button>
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
                <Button variant="outline" className="w-full">
                  View All Requests
                </Button>
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
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
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

        <Card>
          <CardHeader>
            <CardTitle>Find Billboards</CardTitle>
            <CardDescription>
              Browse available billboard spaces in Ghana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/')}>
              Browse Billboards
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;