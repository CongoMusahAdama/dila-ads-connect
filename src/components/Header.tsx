
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { Menu, X, Home, Search, User, Settings } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await signOut();
      navigate('/');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src="/uploads/dilaLogo.png" alt="DilaAds Logo" className="w-8 h-8 rounded-md" />
          <div className="flex flex-col">
            <span className="font-bold text-lg">DilaAds</span>
            <span className="text-muted-foreground text-xs hidden sm:block">Find Your Perfect Billboard</span>
          </div>
        </div>

        {/* Desktop Navigation */}
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

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Button
              variant="ghost"
              onClick={() => {
                navigate('/');
                closeMobileMenu();
              }}
              className="w-full justify-start text-left"
            >
              <Home size={18} className="mr-3" />
              Home
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                navigate('/advertiser');
                closeMobileMenu();
              }}
              className="w-full justify-start text-left"
            >
              <Search size={18} className="mr-3" />
              Browse Billboards
            </Button>
            {user && (
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/dashboard');
                  closeMobileMenu();
                }}
                className="w-full justify-start text-left"
              >
                <User size={18} className="mr-3" />
                Dashboard
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                navigate('/admin-login');
                closeMobileMenu();
              }}
              className="w-full justify-start text-left"
            >
              <Settings size={18} className="mr-3" />
              Admin
            </Button>
            <div className="pt-3 border-t">
              {user ? (
                <Button
                  onClick={() => {
                    handleSignOut();
                    closeMobileMenu();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Logout
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      navigate('/login');
                      closeMobileMenu();
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/signup');
                      closeMobileMenu();
                    }}
                    className="w-full"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
