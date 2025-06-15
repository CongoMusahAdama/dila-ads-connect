import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import BillboardSearch from "@/components/BillboardSearch";
import MyBookingsModal from "@/components/MyBookingsModal";

const Advertiser = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'advertiser')) {
      navigate('/login');
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user || profile?.role !== 'advertiser') {
    return null;
  }

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