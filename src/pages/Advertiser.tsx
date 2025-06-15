import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import BillboardSearch from "@/components/BillboardSearch";

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
      <BillboardSearch />
    </div>
  );
};

export default Advertiser;