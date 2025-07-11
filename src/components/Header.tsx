
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { Home } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await signOut();
      navigate('/');
    }
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="/uploads/dilaLogo.png" alt="DilaAds Logo" className="w-8 h-8 rounded-md" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
            <span className="font-bold text-lg sm:text-xl">DilaAds</span>
            <span className="text-muted-foreground text-xs sm:text-sm">Find Your Perfect Billboard</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-sm">
            Home
          </Button>
          <Button variant="ghost" onClick={() => navigate('/advertiser')} className="text-sm">
            Browse
          </Button>
          {user && (
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-sm">
              Dashboard
            </Button>
          )}
          <Button variant="ghost" onClick={() => navigate('/admin-login')} className="text-sm">
            Admin
          </Button>
          <ThemeToggle />
          {user ? (
            <Button onClick={handleSignOut} variant="outline" className="text-sm">
              Logout
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={() => navigate('/login')} variant="outline" className="text-sm">
                Login
              </Button>
              <Button onClick={() => navigate('/signup')} className="text-sm">
                Sign Up
              </Button>
            </div>
          )}
        </nav>
        <div className="md:hidden flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-1 px-2"
            title="Home"
          >
            <Home size={16} />
            <span className="text-xs">Home</span>
          </Button>
          <ThemeToggle />
          {user ? (
            <Button onClick={handleSignOut} variant="outline" size="sm" className="text-xs">
              Logout
            </Button>
          ) : (
            <Button onClick={() => navigate('/login')} variant="outline" size="sm" className="text-xs">
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
