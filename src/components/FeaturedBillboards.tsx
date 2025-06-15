import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import BillboardDetailsModal from "./BillboardDetailsModal";
import { useState } from "react";

const FeaturedBillboards = () => {
  const navigate = useNavigate();
  const [selectedBillboard, setSelectedBillboard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const billboards = [
    {
      id: 1,
      location: "East Legon, Accra",
      details: "48x14 feet • Premium Location",
      price: "GH₵ 5,000/month",
      image: "/lovable-uploads/a0b3855e-9008-4988-a6ad-69dc8e126c97.png",
      available: true
    },
    {
      id: 2,
      location: "Tema Motorway",
      details: "40x12 feet • Highway Billboard",
      price: "GH₵ 3,500/month",
      image: "/lovable-uploads/c99a20af-03ce-4a67-8733-72a426ad4edd.png",
      available: true
    },
    {
      id: 3,
      location: "Osu, Accra",
      details: "32x10 feet • City Center",
      price: "GH₵ 2,800/month",
      image: "/lovable-uploads/f3499531-b3db-48fa-affd-cd6e2a3b321a.png",
      available: true
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-foreground">Featured Billboards</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {billboards.map((billboard) => (
            <Card key={billboard.id} className="overflow-hidden">
              <CardHeader className="p-0 relative">
                <img 
                  src={billboard.image} 
                  alt={`Billboard in ${billboard.location}`}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">
                  Available
                </Badge>
              </CardHeader>
              
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-2">{billboard.location}</h3>
                <p className="text-muted-foreground mb-2">{billboard.details}</p>
                <p className="text-primary font-semibold">{billboard.price}</p>
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