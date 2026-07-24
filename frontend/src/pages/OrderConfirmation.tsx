import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Order } from "@/services/orderApi";
import { Badge } from "@/components/ui/badge";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order as Order;

  if (!order) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-6 pt-24">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl">Order Confirmed!</CardTitle>
            <p className="text-gray-500 mt-2">
              Thank you for your order. We'll get it ready for delivery.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Order Number</p>
                  <p className="font-semibold">#{order.id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Order Date</p>
                  <p className="font-semibold">
                    {new Date(order.createdDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <Badge variant="outline">{order.status}</Badge>
                </div>
                <div>
                  <p className="text-gray-600">Total Amount</p>
                  <p className="font-semibold text-green-600">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-3 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• The farmer will prepare your order</li>
                <li>• You'll receive updates as your order status changes</li>
                <li>• Payment will be collected on delivery</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                className="flex-1"
                onClick={() => navigate('/order-history')}
              >
                View Order History
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/crops')}
              >
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderConfirmation;
