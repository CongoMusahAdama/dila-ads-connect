
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedBillboards from "@/components/FeaturedBillboards";
import HowItWorks from "@/components/HowItWorks";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturedBillboards />
      <HowItWorks />
      
      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="font-bold text-white text-sm">D</span>
                </div>
                <span className="font-bold text-xl">DilaAds</span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                Ghana's premier billboard marketplace connecting advertisers with premium outdoor advertising spaces across the country.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Contact Us</h4>
                <p className="text-muted-foreground">
                  Phone: 0204743240 or 0531878243
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Home</a></li>
                <li><a href="/advertiser" className="hover:text-foreground transition-colors">Browse Billboards</a></li>
                <li><a href="/login" className="hover:text-foreground transition-colors">Login</a></li>
                <li><a href="/signup" className="hover:text-foreground transition-colors">Sign Up</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Services</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Billboard Advertising</li>
                <li>Location Management</li>
                <li>Campaign Analytics</li>
                <li>24/7 Support</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 DilaAds Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
