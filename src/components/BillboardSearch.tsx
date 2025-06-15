import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BillboardDetailsModal from "./BillboardDetailsModal";
import BookingModal from "./BookingModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Billboard {
  id: string;
  name: string;
  location: string;
  size: string;
  price_per_day: number;
  description: string;
  image_url: string;
  is_available: boolean;
  phone: string;
  email: string;
}

const BillboardSearch = () => {
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [filteredBillboards, setFilteredBillboards] = useState<Billboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("available");
  const [selectedBillboard, setSelectedBillboard] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchBillboards();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [billboards, searchTerm, locationFilter, sizeFilter, priceFilter, availabilityFilter]);

  const fetchBillboards = async () => {
    try {
      const { data, error } = await supabase
        .from('billboards')
        .select('*')
        .order('created_at', { ascending: false });

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

  const applyFilters = () => {
    let filtered = billboards;

    // Search by name or location (case-insensitive)
    if (searchTerm) {
      filtered = filtered.filter(billboard =>
        billboard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        billboard.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by location
    if (locationFilter !== "all") {
      filtered = filtered.filter(billboard =>
        billboard.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Filter by size
    if (sizeFilter !== "all") {
      filtered = filtered.filter(billboard =>
        billboard.size.toLowerCase().includes(sizeFilter.toLowerCase())
      );
    }

    // Filter by price range
    if (priceFilter !== "all") {
      filtered = filtered.filter(billboard => {
        const price = billboard.price_per_day;
        switch (priceFilter) {
          case "low": return price <= 100;
          case "medium": return price > 100 && price <= 500;
          case "high": return price > 500;
          default: return true;
        }
      });
    }

    // Filter by availability
    if (availabilityFilter === "available") {
      filtered = filtered.filter(billboard => billboard.is_available);
    } else if (availabilityFilter === "unavailable") {
      filtered = filtered.filter(billboard => !billboard.is_available);
    }

    setFilteredBillboards(filtered);
  };

  const handleViewDetails = (billboard: Billboard) => {
    const detailedBillboard = {
      id: billboard.id,
      title: billboard.name,
      location: billboard.location,
      price: billboard.price_per_day,
      size: billboard.size,
      description: billboard.description || "Premium billboard location with high visibility and excellent traffic flow.",
      availability: billboard.is_available ? "Available" : "Not Available",
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
    setIsDetailsModalOpen(true);
  };

  const handleBookNow = (billboard: Billboard) => {
    if (!user || profile?.role !== 'advertiser') {
      toast({
        title: "Access Denied",
        description: "Please login as an advertiser to book billboards.",
        variant: "destructive",
      });
      return;
    }
    setSelectedBillboard(billboard);
    setIsBookingModalOpen(true);
  };

  const getUniqueLocations = () => {
    const locations = billboards.map(b => b.location);
    return [...new Set(locations)];
  };

  const getUniqueSizes = () => {
    const sizes = billboards.map(b => b.size);
    return [...new Set(sizes)];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading billboards...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find Billboards</h1>
      
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {getUniqueLocations().map((location) => (
                <SelectItem key={location} value={location.toLowerCase()}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sizeFilter} onValueChange={setSizeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sizes</SelectItem>
              {getUniqueSizes().map((size) => (
                <SelectItem key={size} value={size.toLowerCase()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="low">Under GH₵100</SelectItem>
              <SelectItem value="medium">GH₵100 - GH₵500</SelectItem>
              <SelectItem value="high">Above GH₵500</SelectItem>
            </SelectContent>
          </Select>

          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {filteredBillboards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No billboard matched your search. Try a different name or location.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBillboards.map((billboard) => (
            <Card key={billboard.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={billboard.image_url || "/lovable-uploads/80d4b1df-e916-4ea8-9dec-746a81e6460c.png"}
                  alt={billboard.name}
                  className="w-full h-48 object-cover"
                />
                <Badge className={`absolute top-3 left-3 ${billboard.is_available ? 'bg-green-500' : 'bg-red-500'}`}>
                  {billboard.is_available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-2">{billboard.name}</h3>
                <p className="text-muted-foreground mb-2">{billboard.location} • {billboard.size}</p>
                <p className="text-primary font-semibold mb-4">GH₵ {billboard.price_per_day}/day</p>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewDetails(billboard)}
                  >
                    View Details
                  </Button>
                  {billboard.is_available && (
                    <Button
                      className="flex-1"
                      onClick={() => handleBookNow(billboard)}
                    >
                      Book Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <BillboardDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        billboard={selectedBillboard}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        billboard={selectedBillboard}
      />
    </div>
  );
};

export default BillboardSearch;