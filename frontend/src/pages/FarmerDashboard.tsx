import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sprout, Package, TrendingUp, Users, LogOut, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { cropApi, Crop } from "@/services/cropApi";
import Navbar from "@/components/Navbar";

const FarmerDashboard = () => {
  const [newCrop, setNewCrop] = useState({
    productName: "",
    description: "",
    price: "",
    quantity: "",
    organic: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: crops = [], isLoading: cropsLoading } = useQuery({
    queryKey: ["myCrops"],
    queryFn: () => cropApi.getMyCrops(),
    enabled: apiService.isAuthenticated(),
  });

  const createCropMutation = useMutation({
    mutationFn: (data: { crop: any; image?: File }) => 
      cropApi.createCrop(data.crop, data.image),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Crop added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["myCrops"] });
      setNewCrop({ productName: "", description: "", price: "", quantity: "", organic: false });
      setImageFile(null);
      setImagePreview(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add crop",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cropData = {
      productName: newCrop.productName,
      description: newCrop.description,
      price: parseFloat(newCrop.price),
      quantity: parseInt(newCrop.quantity),
      organic: newCrop.organic,
    };

    createCropMutation.mutate({
      crop: cropData,
      image: imageFile || undefined,
    });
  };

  const handleLogout = () => {
    apiService.removeAuthToken();
    navigate('/');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      {/* Header */}
      <div className="bg-white shadow-sm border-b pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
                <p className="text-sm text-gray-600">Manage your crops and orders</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Crops</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{crops.length}</div>
              <p className="text-xs text-muted-foreground">Active listings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹12,500</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">Active customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="crops" className="space-y-6">
          <TabsList>
            <TabsTrigger value="crops">My Crops</TabsTrigger>
            <TabsTrigger value="add-crop">Add New Crop</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="crops" className="space-y-6">
            {cropsLoading ? (
              <div className="text-center py-8">Loading crops...</div>
            ) : crops.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p>No crops listed yet. Add your first crop!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crops.map((crop: Crop) => (
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
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Price:</span>
                          <span className="font-medium">₹{crop.price}/kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Quantity:</span>
                          <span className="font-medium">{crop.quantity} kg</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add-crop" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Crop</CardTitle>
                <CardDescription>List a new crop for sale</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCrop} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Crop Name *</Label>
                    <Input
                      id="productName"
                      placeholder="e.g., Organic Tomatoes"
                      value={newCrop.productName}
                      onChange={(e) => setNewCrop({ ...newCrop, productName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your crop..."
                      value={newCrop.description}
                      onChange={(e) => setNewCrop({ ...newCrop, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price per kg (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="150"
                        value={newCrop.price}
                        onChange={(e) => setNewCrop({ ...newCrop, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Available Quantity (kg) *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="50"
                        value={newCrop.quantity}
                        onChange={(e) => setNewCrop({ ...newCrop, quantity: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Crop Image (Optional)</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                      {imagePreview && (
                        <div className="w-20 h-20 rounded-md overflow-hidden border">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="organic"
                      checked={newCrop.organic}
                      onCheckedChange={(checked) =>
                        setNewCrop({ ...newCrop, organic: checked as boolean })
                      }
                    />
                    <Label htmlFor="organic" className="cursor-pointer">
                      Organic Crop
                    </Label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createCropMutation.isPending}
                  >
                    {createCropMutation.isPending ? "Adding Crop..." : "Add Crop"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Manage your incoming orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No orders yet. Your orders will appear here once customers start buying your crops.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FarmerDashboard;
