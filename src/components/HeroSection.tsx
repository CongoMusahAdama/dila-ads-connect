
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground dark:text-white">
                Connect. 
                <span className="text-primary dark:text-orange-400"> Advertise</span>.
                <br />
                <span className="text-primary dark:text-orange-400">Grow</span>.
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
                Ghana's premier billboard marketplace connecting advertisers with premium outdoor advertising spaces across the country.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {user ? (
                <>
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/advertiser')}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 text-lg dark:bg-orange-500 dark:hover:bg-orange-600"
                  >
                    Browse Billboards
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => navigate('/dashboard')}
                    className="border-primary text-primary hover:bg-primary/10 font-semibold px-8 py-6 text-lg dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-400/10"
                  >
                    My Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/signup')}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 text-lg dark:bg-orange-500 dark:hover:bg-orange-600"
                  >
                    Get Started
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => navigate('/advertiser')}
                    className="border-primary text-primary hover:bg-primary/10 font-semibold px-8 py-6 text-lg dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-400/10"
                  >
                    Browse Spaces
                  </Button>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary dark:text-orange-400">500+</div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">Billboard Locations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary dark:text-orange-400">100+</div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">Happy Advertisers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary dark:text-orange-400">24/7</div>
                <div className="text-sm text-muted-foreground dark:text-gray-400">Support</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="/lovable-uploads/4354e036-e3a7-4521-90d7-f1fadbfb4ffd.png"
                alt="Billboard advertising in Ghana"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/10 dark:bg-orange-400/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-orange-200/20 dark:bg-blue-400/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
