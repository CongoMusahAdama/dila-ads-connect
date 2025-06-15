import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger animation on component mount with 2 second delay
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

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
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input 
                    placeholder="Enter location (e.g., Accra, Kumasi)" 
                    className="pl-12 h-14 text-lg border-2 focus:border-primary transition-colors"
                  />
                </div>
                <Button className="h-14 px-8 text-lg bg-secondary hover:bg-secondary/90 hover:scale-105 transition-all duration-200">
                  <Search className="mr-2 h-5 w-5" />
                  Search Billboards
                </Button>
              </div>
              
              <div className="mt-6">
                <Button 
                  onClick={() => navigate('/login')}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold hover:scale-105 transition-all duration-200"
                >
                  Get Started
                </Button>
              </div>
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