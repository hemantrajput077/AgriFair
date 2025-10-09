import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Package, Heart, LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

const CustomerDashboard = () => {
  const [crops, setCrops] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Load available crops (mock data for now)
    setCrops([
      {
        id: 1,
        name: "Organic Tomatoes",
        description: "Fresh organic tomatoes from local farm",
        price: 150,
        quantity: 50,
        category: "Vegetables",
        farmer: "John's Farm",
        image: "/placeholder.svg"
      },
      {
        id: 2,
        name: "Premium Rice",
        description: "High-quality basmati rice",
        price: 200,
        quantity: 100,
        category: "Grains",
        farmer: "Green Valley Farm",
        image: "/placeholder.svg"
      },
      {
        id: 3,
        name: "Fresh Carrots",
        description: "Sweet and crunchy carrots",
        price: 80,
        quantity: 75,
        category: "Vegetables",
        farmer: "Sunrise Farm",
        image: "/placeholder.svg"
      },
      {
        id: 4,
        name: "Organic Wheat",
        description: "Premium organic wheat flour",
        price: 120,
        quantity: 200,
        category: "Grains",
        farmer: "Golden Fields",
        image: "/placeholder.svg"
      }
    ]);
  }, [navigate]);

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || crop.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (crop) => {
    const existingItem = cart.find(item => item.id === crop.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === crop.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...crop, quantity: 1 }]);
    }
    
    toast({
      title: "Added to cart",
      description: `${crop.name} has been added to your cart`,
    });
  };

  const removeFromCart = (cropId) => {
    setCart(cart.filter(item => item.id !== cropId));
    toast({
      title: "Removed from cart",
      description: "Item removed from your cart",
    });
  };

  const updateQuantity = (cropId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cropId);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === cropId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    toast({
      title: "Order Placed!",
      description: `Your order of ₹${getTotalPrice()} has been placed successfully`,
    });
    setCart([]);
  };

  const handleLogout = () => {
    apiService.removeAuthToken();
    navigate('/');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const categories = ["all", "vegetables", "fruits", "grains", "spices", "herbs"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
                <p className="text-sm text-gray-600">Discover fresh produce from local farmers</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search crops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cart Items</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cart.length}</div>
              <p className="text-xs text-muted-foreground">Items in cart</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{getTotalPrice()}</div>
              <p className="text-xs text-muted-foreground">Cart total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Saved items</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Browse Crops</TabsTrigger>
            <TabsTrigger value="cart">Shopping Cart ({cart.length})</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Crops Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCrops.map((crop) => (
                <Card key={crop.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{crop.name}</CardTitle>
                      <Badge variant="outline">{crop.category}</Badge>
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
                        <span className="font-medium">{crop.farmer}</span>
                      </div>
                      <Button 
                        onClick={() => addToCart(crop)} 
                        className="w-full"
                        disabled={cart.find(item => item.id === crop.id)?.quantity >= crop.quantity}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cart" className="space-y-6">
            {cart.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.farmer}</p>
                          <p className="text-sm text-muted-foreground">₹{item.price}/kg</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.quantity}
                          >
                            +
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">Total: ₹{getTotalPrice()}</h3>
                        <p className="text-sm text-muted-foreground">{cart.length} items</p>
                      </div>
                      <Button onClick={handleCheckout} size="lg" className="bg-green-600 hover:bg-green-700">
                        Checkout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Track your past and current orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No orders yet. Start shopping to see your order history here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboard;
