import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BillboardDetailsModal from "./BillboardDetailsModal";

interface Billboard {
  id: string;
  name: string;
  location: string;
  size: string;
  price_per_day: number;
  image_url: string | null;
  description: string | null;
  is_available: boolean;
  phone?: string | null;
  email?: string | null;
}

const BillboardSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [filteredBillboards, setFilteredBillboards] = useState<Billboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBillboard, setSelectedBillboard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchBillboards = async () => {
    try {
      const { data, error } = await supabase
        .from('billboards')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBillboards(data || []);
      setFilteredBillboards(data || []);
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

  useEffect(() => {
    let filtered = billboards;

    // Search by name or location (case-insensitive, partial matching)
    if (searchTerm) {
      filtered = filtered.filter(billboard =>
        billboard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        billboard.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by location
    if (locationFilter && locationFilter !== "all") {
      filtered = filtered.filter(billboard =>
        billboard.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Filter by size
    if (sizeFilter && sizeFilter !== "all") {
      filtered = filtered.filter(billboard =>
        billboard.size.toLowerCase().includes(sizeFilter.toLowerCase())
      );
    }

    // Filter by price range
    if (priceRange && priceRange !== "all") {
      filtered = filtered.filter(billboard => {
        const price = billboard.price_per_day;
        switch (priceRange) {
          case "0-100":
            return price <= 100;
          case "101-500":
            return price > 100 && price <= 500;
          case "501-1000":
            return price > 500 && price <= 1000;
          case "1000+":
            return price > 1000;
          default:
            return true;
        }
      });
    }

    setFilteredBillboards(filtered);
  }, [searchTerm, locationFilter, sizeFilter, priceRange, billboards]);

  const handleViewDetails = (billboard: Billboard) => {
    const detailedBillboard = {
      id: billboard.id.toString(),
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBillboard(null);
  };

  // Get unique locations and sizes for filter options
  const uniqueLocations = [...new Set(billboards.map(b => b.location))];
  const uniqueSizes = [...new Set(billboards.map(b => b.size))];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading billboards...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Billboards</h1>
        
        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map(location => (
                <SelectItem key={location} value={location.toLowerCase()}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sizeFilter} onValueChange={setSizeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Sizes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sizes</SelectItem>
              {uniqueSizes.map(size => (
                <SelectItem key={size} value={size.toLowerCase()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-100">GH₵0 - GH₵100</SelectItem>
              <SelectItem value="101-500">GH₵101 - GH₵500</SelectItem>
              <SelectItem value="501-1000">GH₵501 - GH₵1000</SelectItem>
              <SelectItem value="1000+">GH₵1000+</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setLocationFilter("");
              setSizeFilter("");
              setPriceRange("");
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Results */}
      {filteredBillboards.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBillboards.map((billboard) => (
            <Card key={billboard.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <div className="relative">
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
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2">{billboard.name}</h3>
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
                  <Button 
                    className="flex-1"
                    onClick={() => handleViewDetails(billboard)}
                  >
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No billboard matched your search. Try a different name or location.</p>
        </div>
      )}

      <BillboardDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        billboard={selectedBillboard}
      />
    </div>
  );
};

export default BillboardSearch;