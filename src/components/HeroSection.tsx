import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative py-16 min-h-[70vh] flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/80d4b1df-e916-4ea8-9dec-746a81e6460c.png')`
        }}
      >
        <div className="absolute inset-0 bg-background/80"></div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Find Available Billboards
            <br />
            <span className="text-primary">in Ghana</span>
          </h1>
          
          <p className="text-xl text-foreground mb-8 max-w-2xl mx-auto">
            Easily connect with billboard owners and book ad spaces for your campaigns.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-16">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Enter location" 
                className="pl-10 h-12"
              />
            </div>
            <Button className="h-12 px-8 bg-primary hover:bg-primary/90">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;