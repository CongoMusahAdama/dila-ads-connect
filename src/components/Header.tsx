import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-secondary rounded-md flex items-center justify-center">
            <span className="font-bold text-secondary-foreground text-sm">D</span>
          </div>
          <span className="font-bold text-xl">DilaAds</span>
          <span className="text-muted-foreground">Connect</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#billboards" className="text-foreground hover:text-primary transition-colors">
            Find Billboards
          </a>
          <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">
            How It Works
          </a>
          <Button variant="ghost" asChild>
            <a href="/signup">Sign Up</a>
          </Button>
          <Button asChild>
            <a href="/login">Log In</a>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;