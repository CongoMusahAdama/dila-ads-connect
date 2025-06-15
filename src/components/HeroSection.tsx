import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
          Find Available Billboards
          <br />
          <span className="text-muted-foreground">in Ghana</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
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
    </section>
  );
};

export default HeroSection;