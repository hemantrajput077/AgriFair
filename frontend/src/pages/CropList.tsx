import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cropApi, Crop } from "@/services/cropApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

const CropList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const isAuthenticated = apiService.isAuthenticated();

  const { data: crops = [], isLoading, error } = useQuery({
    queryKey: ["crops"],
    queryFn: () => cropApi.getCrops(),
  });

  const filteredCrops = crops.filter((crop: Crop) => {
    const matchesSearch = crop.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAddToCart = (crop: Crop) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    // Redirect to customer dashboard where cart functionality exists
    navigate('/customer-dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto p-6 pt-24">
          <div className="text-center">Loading crops...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto p-6 pt-24">
          <div className="text-center text-red-500">Error loading crops: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6 pt-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Fresh Crops Marketplace</h1>
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search crops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            {isAuthenticated && (
              <Button onClick={() => navigate('/customer-dashboard')} variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Go to Cart
              </Button>
            )}
          </div>
        </div>

        {filteredCrops.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p>No crops available at the moment.</p>
              {searchTerm && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search term: "{searchTerm}"
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map((crop: Crop) => (
              <Card key={crop.id} className="hover:shadow-lg transition-shadow">
                {crop.photoUrl && (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={`http://localhost:8080${crop.photoUrl}`}
                      alt={crop.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{crop.productName}</CardTitle>
                    {crop.organic && (
                      <Badge className="bg-green-500">Organic</Badge>
                    )}
                  </div>
                  <CardDescription>{crop.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="font-medium">₹{crop.price}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Available:</span>
                      <span className="font-medium">{crop.quantity} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Farmer:</span>
                      <span className="font-medium">{crop.farmerUsername}</span>
                    </div>
                    <Button 
                      onClick={() => handleAddToCart(crop)} 
                      className="w-full"
                    >
                      {isAuthenticated ? "Add to Cart" : "Login to Buy"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CropList;

