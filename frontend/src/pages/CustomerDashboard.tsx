import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Package, Heart, LogOut, Search, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { cropApi, Crop } from "@/services/cropApi";
import { orderApi, Order } from "@/services/orderApi";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";

const CustomerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { items: cart, addToCart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();

  // Fetch crops
  const { data: crops = [], isLoading: cropsLoading } = useQuery({
    queryKey: ["crops"],
    queryFn: () => cropApi.getCrops(),
  });

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ["myOrders"],
    queryFn: () => orderApi.getMyOrders(),
    enabled: apiService.isAuthenticated(),
  });

  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const filteredCrops = crops.filter((crop: Crop) => {
    const matchesSearch = crop.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAddToCart = (crop: Crop) => {
    addToCart(crop, 1);
    toast({
      title: "Added to cart",
      description: `${crop.productName} has been added to your cart`,
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to cart before checkout",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderData = {
        items: cart.map(item => ({
          cropId: item.crop.id,
          quantity: item.quantity,
        })),
      };

      const order = await orderApi.createOrder(orderData);

      toast({
        title: "Order placed successfully!",
        description: `Order #${order.id} has been created`,
      });

      clearCart();
      refetchOrders(); // Refresh orders list

      // Navigate to order confirmation
      navigate('/order-confirmation', { state: { order } });
    } catch (error) {
      console.error("Order creation failed:", error);
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "Failed to create order",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    apiService.removeAuthToken();
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      PACKED: "bg-purple-100 text-purple-800",
      SHIPPED: "bg-indigo-100 text-indigo-800",
      DELIVERED: "bg-green-100 text-green-800",
      COMPLETED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
              <div className="text-2xl font-bold">{getTotalItems()}</div>
              <p className="text-xs text-muted-foreground">Items in cart</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cart Total</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{getTotalPrice().toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total amount</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Crops</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{crops.length}</div>
              <p className="text-xs text-muted-foreground">Products available</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Browse Crops</TabsTrigger>
            <TabsTrigger value="cart">Shopping Cart ({getTotalItems()})</TabsTrigger>
            <TabsTrigger value="orders">My Orders ({orders.length})</TabsTrigger>
          </TabsList>

          {/* Browse Crops Tab */}
          <TabsContent value="browse" className="space-y-6">
            {cropsLoading ? (
              <div className="text-center py-8">Loading crops...</div>
            ) : filteredCrops.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p>No crops found. Try adjusting your search.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCrops.map((crop: Crop) => (
                  <Card key={crop.id} className="hover:shadow-lg transition-shadow">
                    {crop.photoUrl && (
                      <div className="w-full h-48 bg-gray-200 overflow-hidden rounded-t-lg">
                        <img
                          src={`http://localhost:8080${crop.photoUrl}`}
                          alt={crop.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/400x300?text=No+Image';
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
                          disabled={crop.quantity === 0}
                        >
                          {crop.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Shopping Cart Tab */}
          <TabsContent value="cart" className="space-y-6">
            {cart.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">Your cart is empty</p>
                  <Button onClick={() => navigate('/crops')}>Browse Crops</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item) => (
                    <Card key={item.crop.id}>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="w-24 h-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            {item.crop.photoUrl ? (
                              <img
                                src={`http://localhost:8080${item.crop.photoUrl}`}
                                alt={item.crop.productName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/100?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">{item.crop.productName}</h3>
                                <p className="text-sm text-gray-500">by {item.crop.farmerUsername}</p>
                                {item.crop.organic && (
                                  <Badge variant="outline" className="mt-1">Organic</Badge>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromCart(item.crop.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => updateQuantity(item.crop.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-12 text-center font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => updateQuantity(item.crop.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.crop.quantity}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <span className="text-sm text-gray-500 ml-2">
                                  (Max: {item.crop.quantity})
                                </span>
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  ₹{item.crop.price} × {item.quantity}
                                </p>
                                <p className="text-lg font-bold">
                                  ₹{(item.crop.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-24">
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal ({getTotalItems()} items)</span>
                          <span className="font-medium">₹{getTotalPrice().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span className="text-sm text-gray-500">TBD</span>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-bold">Total</span>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{getTotalPrice().toFixed(2)}
                          </span>
                        </div>
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handleCheckout}
                        >
                          Proceed to Checkout
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* My Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {ordersLoading ? (
              <div className="text-center py-8">Loading orders...</div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">No orders yet</p>
                  <Button onClick={() => navigate('/crops')}>Start Shopping</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order: Order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(order.createdDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Order Items */}
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                              <div>
                                <span className="font-medium">{item.productName}</span>
                                <span className="text-gray-500 ml-2">× {item.quantity}</span>
                              </div>
                              <span className="font-semibold">₹{item.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Total */}
                        <div className="border-t pt-3 flex justify-between items-center">
                          <span className="font-semibold">Total Amount</span>
                          <span className="text-xl font-bold text-green-600">
                            ₹{order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboard;
