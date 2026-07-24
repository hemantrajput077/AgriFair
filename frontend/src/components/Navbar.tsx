import { Button } from "@/components/ui/button";
import { LogOut, User, Home, ShoppingBag, Tractor, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = apiService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Get role and username from localStorage (set during login)
        const role = localStorage.getItem('userRole');
        const user = localStorage.getItem('username');
        if (role) {
          setUserRole(role);
        }
        if (user) {
          setUsername(user);
        }
      } else {
        setUserRole("");
        setUsername("");
      }
    };

    checkAuth();

    // Listen for auth changes
    window.addEventListener('storage', checkAuth);
    // Also check on focus (in case login happened in another tab)
    window.addEventListener('focus', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('focus', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    apiService.removeAuthToken();
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUserRole("");
    setUsername("");
    navigate('/');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const getDashboardLink = () => {
    if (userRole === "ROLE_FARMER") {
      return "/farmer-dashboard";
    } else if (userRole === "ROLE_CUSTOMER") {
      return "/customer-dashboard";
    }
    return "/";
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
              <img
                src="/favicon.png"
                alt="AgriFair Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold text-foreground">AgriFair</span>
          </Link>

          {/* Navigation Links - Show different items based on auth state */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </Link>

            {/* Show these only when logged in */}
            {isAuthenticated && (
              <>
                <Link to="/crops" className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Crops
                </Link>
                <Link to="/equipment" className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-2">
                  <Tractor className="w-4 h-4" />
                  Equipment
                </Link>
                <Link to="/my-rentals" className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  My Rentals
                </Link>
                <Link to={getDashboardLink()} className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
              </>
            )}

            {/* Always show About and Contact */}
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors font-medium">
              Contact
            </Link>
          </div>

          {/* Auth Buttons / User Profile */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${username}`} />
                        <AvatarFallback>{getUserInitials(username)}</AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline font-medium">{username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()} className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    {userRole === "ROLE_FARMER" && (
                      <DropdownMenuItem asChild>
                        <Link to="/farmer-profile" className="flex items-center gap-2 cursor-pointer">
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {userRole === "ROLE_CUSTOMER" && (
                      <DropdownMenuItem asChild>
                        <Link to="/order-history" className="flex items-center gap-2 cursor-pointer">
                          <Package className="w-4 h-4" />
                          <span>Order History</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-600">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-gradient-hero hover:opacity-90">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
