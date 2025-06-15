import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import BillboardSearch from "@/components/BillboardSearch";
import MyBookingsModal from "@/components/MyBookingsModal";

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
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || profile?.role !== 'advertiser') {
    console.log('No user or wrong role, returning null');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Checking permissions...</div>
      </div>
    );
  }

  console.log('Rendering dashboard');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Advertiser Dashboard</h1>
          <MyBookingsModal />
        </div>
        <BillboardSearch />
      </div>
    </div>
  );
};

export default Advertiser;