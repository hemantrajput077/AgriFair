import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { rentalApi, Equipment } from "@/services/rentalApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, User, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EquipmentList = () => {
  const navigate = useNavigate();
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);

  const { data: equipments = [], isLoading, error, refetch } = useQuery({
    queryKey: ["equipments", showAvailableOnly],
    queryFn: () => showAvailableOnly 
      ? rentalApi.getAvailableEquipments()
      : rentalApi.getEquipments(),
  });

  const getStatusBadge = (available: boolean) => {
    return available ? (
      <Badge className="bg-green-500">Available</Badge>
    ) : (
      <Badge variant="destructive">Unavailable</Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading equipment...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">Error loading equipment: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Equipment for Rent</h1>
        <div className="flex gap-4">
          <Button
            variant={showAvailableOnly ? "default" : "outline"}
            onClick={() => setShowAvailableOnly(true)}
          >
            Available Only
          </Button>
          <Button
            variant={!showAvailableOnly ? "default" : "outline"}
            onClick={() => setShowAvailableOnly(false)}
          >
            All Equipment
          </Button>
          <Button variant="outline" onClick={() => navigate("/create-equipment")}>
            Add Equipment
          </Button>
          <Button onClick={() => navigate("/create-rental")}>
            Create Rental Request
          </Button>
        </div>
      </div>

      {equipments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>No equipment available at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipments.map((equipment) => (
            <Card key={equipment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{equipment.type}</CardTitle>
                    <CardDescription className="mt-1">{equipment.model}</CardDescription>
                  </div>
                  {getStatusBadge(equipment.available)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {equipment.imageUrl && (
                    <img
                      src={`http://localhost:8080${equipment.imageUrl}`}
                      alt={equipment.type}
                      className="w-full h-48 object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">₹{equipment.rate}/day</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{equipment.owner.firstName} {equipment.owner.secondName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{equipment.owner.county}, {equipment.owner.localArea}</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => navigate(`/create-rental?equipmentId=${equipment.id}`)}
                    disabled={!equipment.available}
                  >
                    Request Rental
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentList;

