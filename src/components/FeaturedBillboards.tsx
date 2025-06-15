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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleBooking = () => {
    navigate('/login');
  };

  const handleViewDetails = (billboard) => {
    const detailedBillboard = {
      id: billboard.id.toString(),
      title: `Premium Billboard - ${billboard.location}`,
      location: billboard.location,
      price: parseInt(billboard.price.replace(/[^\d]/g, '')),
      size: billboard.details,
      description: "Premium billboard location with high visibility and excellent traffic flow. Perfect for brand awareness campaigns and reaching your target audience. This location offers maximum exposure with thousands of daily impressions from both vehicular and pedestrian traffic.",
      availability: "Available",
      views: Math.floor(Math.random() * 5000) + 1000,
      contact: {
        name: "Billboard Owner",
        phone: "+233 50 123 4567",
        email: "owner@example.com"
      },
      images: [billboard.image],
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
      const { data, error } = await supabase
        .from('billboards')
        .select('*')
        .eq('is_available', true)
        .limit(6);

      if (error) throw error;
      setBillboards(data || []);
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

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-foreground">Featured Billboards</h2>
        
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
            {billboards.map((billboard) => (
              <Card key={billboard.id} className="overflow-hidden">
                <CardHeader className="p-0 relative">
                  <img 
                    src={billboard.image_url || "/lovable-uploads/80d4b1df-e916-4ea8-9dec-746a81e6460c.png"} 
                    alt={`Billboard: ${billboard.name}`}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/lovable-uploads/80d4b1df-e916-4ea8-9dec-746a81e6460c.png";
                    }}
                  />
                  <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">
                    Available
                  </Badge>
                </CardHeader>
                
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-2">{billboard.name}</h3>
                  <p className="text-muted-foreground mb-2">{billboard.location} • {billboard.size}</p>
                  <p className="text-primary font-semibold">GH₵ {billboard.price_per_day}/day</p>
                </CardContent>
                
                <CardFooter className="p-6 pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleViewDetails(billboard)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
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