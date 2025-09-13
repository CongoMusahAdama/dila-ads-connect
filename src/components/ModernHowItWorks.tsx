import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Handshake, TrendingUp, Users, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ModernHowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Search,
      title: "Search & Discover",
      description: "Browse through hundreds of premium billboard locations across Ghana. Use our advanced filters to find the perfect spot for your campaign.",
      color: "text-blue-600"
    },
    {
      icon: MapPin,
      title: "Choose Location",
      description: "Select your preferred billboard location based on traffic, visibility, and target audience. View detailed information and high-quality images.",
      color: "text-green-600"
    },
    {
      icon: Handshake,
      title: "Book & Connect",
      description: "Connect directly with billboard owners, negotiate terms, and secure your advertising space with our secure booking system.",
      color: "text-purple-600"
    }
  ];

  const features = [
    {
      icon: Users,
      title: "Trusted Community",
      description: "Join thousands of verified advertisers and billboard owners"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe and secure payment processing for all transactions"
    },
    {
      icon: TrendingUp,
      title: "Maximize ROI",
      description: "Track your campaign performance and optimize your reach"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* How It Works Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Easiest Method To Find a Billboard</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Our streamlined process makes it simple to find, book, and advertise on premium billboard spaces across Ghana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className={`h-8 w-8 ${step.color}`} />
                </div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-muted/20 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Why Choose DilaAds?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide the tools and support you need to make your advertising campaigns successful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="text-center">
            <Button 
              onClick={() => navigate('/signup')}
              size="lg"
              className="mr-4 bg-primary hover:bg-primary/90"
            >
              Get Started Today
            </Button>
            <Button 
              onClick={() => navigate('/billboards')}
              variant="outline"
              size="lg"
            >
              Browse Billboards
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernHowItWorks;
