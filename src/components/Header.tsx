import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
  };

  const AuthenticatedNav = () => (
    <>
      <a href="#billboards" className="text-foreground hover:text-primary transition-colors block py-2">
        Find Billboards
      </a>
      <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors block py-2">
        How It Works
      </a>
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:items-center">
        <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors block py-2">
          Dashboard
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <User size={18} />
              <span className="hidden sm:inline">
                {profile?.first_name || 'User'} ({profile?.role || 'User'})
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  const GuestNav = () => (
    <>
      <a href="#billboards" className="text-foreground hover:text-primary transition-colors block py-2">
        Find Billboards
      </a>
      <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors block py-2">
        How It Works
      </a>
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
        <Button variant="ghost" asChild className="w-full md:w-auto">
          <Link to="/signup">Sign Up</Link>
        </Button>
        <Button asChild className="w-full md:w-auto">
          <Link to="/login">Log In</Link>
        </Button>
      </div>
    </>
  );

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-secondary rounded-md flex items-center justify-center">
            <span className="font-bold text-secondary-foreground text-sm">D</span>
          </div>
          <span className="font-bold text-xl">DilaAds</span>
          <span className="text-muted-foreground hidden sm:inline">Connect</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {user ? <AuthenticatedNav /> : <GuestNav />}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col space-y-6 mt-6">
              {user ? <AuthenticatedNav /> : <GuestNav />}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;