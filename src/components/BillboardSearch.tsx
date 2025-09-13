import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import BillboardDetailsModal from "./BillboardDetailsModal";
import BookingModal from "./BookingModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getBillboardImageUrl } from "@/utils/imageUtils";
import { apiClient } from "@/lib/api";

interface Billboard {
  _id: string;
  name: string;
  location: string;
  size: string;
  pricePerDay: number;
  description?: string;
  imageUrl?: string;
  phone?: string;
  email?: string;
  isAvailable: boolean;
  isApproved: boolean;
  ownerId: {
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
  updatedAt: string;
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
      console.log('Fetching billboards...');
      const response = await apiClient.getBillboards({ limit: 100 });
      console.log('Billboards response:', response);
      setBillboards(response.billboards || []);
    } catch (error: any) {
      console.error('Error fetching billboards:', error);
      toast({
        title: "Error fetching billboards",
        description: error.message || "Failed to fetch billboards",
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
        const price = billboard.pricePerDay;
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
      filtered = filtered.filter(billboard => billboard.isAvailable);
    } else if (availabilityFilter === "unavailable") {
      filtered = filtered.filter(billboard => !billboard.isAvailable);
    }

    setFilteredBillboards(filtered);
  };

  const handleViewDetails = (billboard: Billboard) => {
    const detailedBillboard = {
      id: billboard._id,
      title: billboard.name,
      location: billboard.location,
      price: billboard.pricePerDay,
      size: billboard.size,
      description: billboard.description || "Premium billboard location with high visibility and excellent traffic flow.",
      availability: billboard.isAvailable ? "Available" : "Not Available",
      views: Math.floor(Math.random() * 5000) + 1000,
      contact: {
        name: `${billboard.ownerId?.profile?.firstName || 'Billboard'} ${billboard.ownerId?.profile?.lastName || 'Owner'}`,
        phone: billboard.phone || "+233 50 123 4567",
        email: billboard.email || billboard.ownerId?.email || "owner@example.com"
      },
      images: [billboard.imageUrl],
      features: ["Premium Location", "High Traffic", "LED Lighting", "24/7 Visibility"]
    };
    setSelectedBillboard(detailedBillboard);
    setIsDetailsModalOpen(true);
  };

  const handleBookNow = (billboard: Billboard) => {
    if (!user || profile?.role !== 'ADVERTISER') {
      toast({
        title: "Access Denied",
        description: "Please login as an advertiser to book billboards.",
        variant: "destructive",
      });
      return;
    }
    
    // Format billboard data to match what BookingModal expects
    const formattedBillboard = {
      id: billboard._id,
      name: billboard.name,
      location: billboard.location,
      price_per_day: billboard.pricePerDay,
      price: billboard.pricePerDay, // Fallback for compatibility
      description: billboard.description,
      is_available: billboard.isAvailable,
      phone: billboard.phone,
      email: billboard.email,
      image_url: billboard.imageUrl,
      size: billboard.size
    };
    
    setSelectedBillboard(formattedBillboard);
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
              <SelectItem value="accra">Accra</SelectItem>
              <SelectItem value="takoradi">Takoradi</SelectItem>
              <SelectItem value="kumasi">Kumasi</SelectItem>
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
          <p className="text-muted-foreground text-lg mb-2">Sorry, no billboards matched your search.</p>
          <p className="text-sm text-muted-foreground">Please try a different location or keyword.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBillboards.map((billboard) => (
            <Card key={billboard._id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={getBillboardImageUrl(billboard)}
                  alt={billboard.name}
                  className="w-full h-48 object-cover"
                />
                <Badge className={`absolute top-3 left-3 ${billboard.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>
                  {billboard.isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-2">{billboard.name}</h3>
                <p className="text-muted-foreground mb-2">{billboard.location} • {billboard.size}</p>
                <p className="text-primary font-semibold mb-4">GH₵ {billboard.pricePerDay}/day</p>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleViewDetails(billboard)}
                  >
                    View Details
                  </Button>
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