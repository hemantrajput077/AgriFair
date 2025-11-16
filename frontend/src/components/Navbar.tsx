import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = apiService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        // In a real app, you'd decode the JWT token to get user info
        // For now, we'll check localStorage or make an API call
        const token = apiService.getAuthToken();
        if (token) {
          // Mock role detection - in real app, decode JWT
          setUserRole("ROLE_FARMER"); // or "ROLE_CUSTOMER"
        }
      }
    };

    checkAuth();
    
    // Listen for auth changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    apiService.removeAuthToken();
    setIsAuthenticated(false);
    setUserRole("");
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

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link to="/equipment" className="text-foreground hover:text-primary transition-colors font-medium">
              Equipment
            </Link>
            <Link to="/my-rentals" className="text-foreground hover:text-primary transition-colors font-medium">
              My Rentals
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors font-medium">
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
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
