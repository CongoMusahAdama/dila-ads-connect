
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import BillboardDetailsModal from "./BillboardDetailsModal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedBillboards = () => {
  const navigate = useNavigate();
  const [selectedBillboard, setSelectedBillboard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [billboards, setBillboards] = useState([]);
  const [bookedBillboards, setBookedBillboards] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  const handleBooking = () => {
    navigate('/login');
  };

  useEffect(() => {
    // Add scroll animation trigger
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleViewDetails = (billboard) => {
    const detailedBillboard = {
      id: billboard.id.toString(),
      title: billboard.name,
      location: billboard.location,
      price: parseFloat(billboard.price_per_day),
      size: billboard.size,
      description: billboard.description || "Premium billboard location with high visibility and excellent traffic flow. Perfect for brand awareness campaigns and reaching your target audience. This location offers maximum exposure with thousands of daily impressions from both vehicular and pedestrian traffic.",
      availability: bookedBillboards.has(billboard.id) ? "Sold Out" : 
                   !billboard.is_approved ? "Pending Approval" : "Available",
      views: Math.floor(Math.random() * 5000) + 1000,
      contact: {
        name: "Billboard Owner",
        phone: billboard.phone || "+233 50 123 4567",
        email: billboard.email || "owner@example.com"
      },
      images: [billboard.image_url || "/lovable-uploads/80d4b1df-e916-4ea8-9dec-746a81e6460c.png"],
      features: ["Premium Location", "High Traffic", "LED Lighting", "24/7 Visibility"]
    };
    setSelectedBillboard(detailedBillboard);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBillboard(null);
  };

  const fetchBillboards = async () => {
    try {
      // Fetch ALL billboards (both approved and unapproved)
      const { data: billboardsData, error: billboardsError } = await supabase
        .from('billboards')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (billboardsError) throw billboardsError;

      // Fetch accepted bookings to determine which billboards are booked
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('booking_requests')
        .select('billboard_id')
        .eq('status', 'accepted');

      if (bookingsError) throw bookingsError;

      // Create a set of booked billboard IDs
      const bookedIds = new Set(bookingsData?.map(booking => booking.billboard_id) || []);
      
      setBillboards(billboardsData || []);
      setBookedBillboards(bookedIds);
    } catch (error: any) {
      toast({
        title: "Error fetching billboards",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillboards();
  }, []);

  const getBadgeInfo = (billboard) => {
    const isBooked = bookedBillboards.has(billboard.id);
    
    if (isBooked) {
      return { text: 'Sold Out', className: 'bg-red-500 text-white' };
    } else if (!billboard.is_approved) {
      return { text: 'Pending Approval', className: 'bg-yellow-500 text-white' };
    } else {
      return { text: 'Available', className: 'bg-secondary text-secondary-foreground' };
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className={`text-3xl font-bold mb-12 text-foreground transform transition-all duration-1000 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          Featured Billboards
        </h2>
        
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-5 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : billboards.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {billboards.map((billboard, index) => {
              const badgeInfo = getBadgeInfo(billboard);
              const isBooked = bookedBillboards.has(billboard.id);
              
              return (
                <Card 
                  key={billboard.id} 
                  className={`overflow-hidden transform transition-all duration-700 ease-out hover:scale-105 hover:shadow-lg ${
                    isVisible 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-8 opacity-0'
                  } ${!billboard.is_approved ? 'border-yellow-200 bg-yellow-50/30' : ''}`}
                  style={{
                    transitionDelay: `${index * 150}ms`
                  }}
                >
                  <CardHeader className="p-0 relative">
                    <img 
                      src={billboard.image_url || "/lovable-uploads/80d4b1df-e916-4ea8-9dec-746a81e6460c.png"} 
                      alt={`Billboard: ${billboard.name}`}
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = "/lovable-uploads/80d4b1df-e916-4ea8-9dec-746a81e6460c.png";
                      }}
                    />
                    <Badge className={`absolute top-3 left-3 ${badgeInfo.className}`}>
                      {badgeInfo.text}
                    </Badge>
                    {!billboard.is_approved && (
                      <Badge className="absolute top-3 right-3 bg-orange-500 text-white text-xs">
                        New
                      </Badge>
                    )}
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-2">{billboard.name}</h3>
                    <p className="text-muted-foreground mb-2">{billboard.location} • {billboard.size}</p>
                    <p className="text-primary font-semibold">GH₵ {billboard.price_per_day}/day</p>
                    {!billboard.is_approved && (
                      <p className="text-xs text-orange-600 mt-2 italic">
                        * Awaiting admin approval
                      </p>
                    )}
                  </CardContent>
                  
                  <CardFooter className="p-6 pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full transition-colors duration-200"
                      onClick={() => handleViewDetails(billboard)}
                      disabled={isBooked}
                    >
                      {isBooked ? 'View Details (Sold Out)' : 'View Details'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No billboards available at the moment.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later for new listings!</p>
          </div>
        )}

        <BillboardDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          billboard={selectedBillboard}
        />
        
      </div>
    </section>
  );
};

export default FeaturedBillboards;
