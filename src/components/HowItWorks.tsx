import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Search Locations",
      description: "Browse billboards by location using our interactive map."
    },
    {
      icon: MapPin,
      title: "Connect with Owners",
      description: "Contact billboard owners directly to discuss terms and availability."
    },
    {
      icon: Search,
      title: "Book Ad Space",
      description: "Request and confirm bookings for your advertising campaign."
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-16 text-foreground">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6">
                <step.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
              <p className="text-muted-foreground max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
        
        <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-3 text-lg">
          Get Started
        </Button>
      </div>
    </section>
  );
};

export default HowItWorks;