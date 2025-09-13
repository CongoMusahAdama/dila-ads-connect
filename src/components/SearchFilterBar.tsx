import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchFilterBar = () => {
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    // Navigate to billboards page with filters
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (size) params.append('size', size);
    if (price) params.append('price', price);
    
    navigate(`/billboards?${params.toString()}`);
  };

  return (
    <section className="py-8 bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-background border border-border rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">City/Street</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accra">Accra</SelectItem>
                    <SelectItem value="kumasi">Kumasi</SelectItem>
                    <SelectItem value="tema">Tema</SelectItem>
                    <SelectItem value="takoradi">Takoradi</SelectItem>
                    <SelectItem value="tamale">Tamale</SelectItem>
                    <SelectItem value="cape-coast">Cape Coast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Size Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Billboard Size</label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (4x6 ft)</SelectItem>
                    <SelectItem value="medium">Medium (8x12 ft)</SelectItem>
                    <SelectItem value="large">Large (12x24 ft)</SelectItem>
                    <SelectItem value="extra-large">Extra Large (16x32 ft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Price Range</label>
                <Select value={price} onValueChange={setPrice}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-100">GH¢ 0 - 100/day</SelectItem>
                    <SelectItem value="100-300">GH¢ 100 - 300/day</SelectItem>
                    <SelectItem value="300-500">GH¢ 300 - 500/day</SelectItem>
                    <SelectItem value="500+">GH¢ 500+/day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <div className="space-y-2">
                <Button 
                  onClick={handleSearch}
                  className="w-full bg-primary hover:bg-primary/90 h-10"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchFilterBar;
