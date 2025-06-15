import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Trigger animation on component mount with 2 second delay
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a search term",
        description: "Enter a billboard name to search for available billboards.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const { data, error } = await supabase
        .from('billboards')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .eq('is_available', true);

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message || "Failed to search billboards",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/30 min-h-[85vh] flex items-center">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className={`transform transition-all duration-1000 ease-out ${
              isVisible 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-8 opacity-0'
            }`}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Find Available
                <br />
                <span className="text-secondary bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent animate-pulse">
                  Billboards
                </span>
                <br />
                <span className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground font-medium">
                  in Ghana
                </span>
              </h1>
            </div>
            
            <div className={`transform transition-all duration-1000 ease-out delay-300 ${
              isVisible 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-8 opacity-0'
            }`}>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Easily connect with billboard owners and book premium ad spaces for your marketing campaigns.
              </p>
            </div>
            
            <div className={`transform transition-all duration-1000 ease-out delay-500 ${
              isVisible 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-8 opacity-0'
            }`}>
              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto lg:mx-0">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input 
                    placeholder="Search billboard by name (e.g., Premium Billboard)" 
                    className="pl-12 h-14 text-lg border-2 focus:border-primary transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="h-14 px-8 text-lg bg-secondary hover:bg-secondary/90 hover:scale-105 transition-all duration-200"
                >
                  <Search className="mr-2 h-5 w-5" />
                  {isSearching ? "Searching..." : "Search Billboards"}
                </Button>
              </div>

              {/* Search Results */}
              {showResults && (
                <div className="mt-6 max-w-xl mx-auto lg:mx-0">
                  {searchResults.length > 0 ? (
                    <div className="bg-background/80 backdrop-blur-sm rounded-lg border p-4 space-y-3">
                      <h3 className="font-semibold text-foreground">Found {searchResults.length} billboard(s):</h3>
                      {searchResults.map((billboard) => (
                        <div key={billboard.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-foreground">{billboard.name}</h4>
                            <p className="text-sm text-muted-foreground">{billboard.location} • {billboard.size}</p>
                            <p className="text-sm font-medium text-primary">GH₵ {billboard.price_per_day}/day</p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => navigate('/login')}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Book Now
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-background/80 backdrop-blur-sm rounded-lg border p-4 text-center">
                      <p className="text-muted-foreground">
                        No billboard matched your search. Please try a different name or check back later.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Image */}
          <div className={`flex justify-center lg:justify-end transform transition-all duration-1000 ease-out delay-700 ${
            isVisible 
              ? 'translate-y-0 opacity-100 scale-100' 
              : 'translate-y-8 opacity-0 scale-95'
          }`}>
            <div className="relative w-full max-w-2xl">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <img 
                  src="/lovable-uploads/9e594151-058a-48ba-aa89-197d1b697959.png"
                  alt="SafeDrive Billboard Example - Premium advertising space"
                  className="w-full h-auto object-cover"
                  style={{ aspectRatio: '16/10' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary/10 rounded-full blur-lg animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;