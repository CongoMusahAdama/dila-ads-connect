import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Find Available Billboards
              <br />
              <span className="text-primary">in Ghana</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Easily connect with billboard owners and book ad spaces for your campaigns.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto lg:mx-0 mb-8">
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
          
          {/* Right Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative max-w-lg w-full">
              <img 
                src="/lovable-uploads/9e594151-058a-48ba-aa89-197d1b697959.png"
                alt="SafeDrive Billboard Example"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;