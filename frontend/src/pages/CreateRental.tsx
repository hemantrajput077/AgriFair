import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { rentalApi, Equipment } from "@/services/rentalApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

const CreateRental = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const equipmentIdParam = searchParams.get("equipmentId");

  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(equipmentIdParam || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const { data: equipments = [] } = useQuery({
    queryKey: ["equipments"],
    queryFn: () => rentalApi.getEquipments(),
  });

  const selectedEquipment = equipments.find(eq => eq.id.toString() === selectedEquipmentId);

  const createRentalMutation = useMutation({
    mutationFn: (rentalData: {
      renter: { id: number };
      equipment: { id: number };
      startDate: string;
      endDate: string;
      notes?: string;
    }) => rentalApi.createRental(rentalData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rental request created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      navigate("/my-rentals");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create rental request",
        variant: "destructive",
      });
    },
  });

  const calculateCost = () => {
    if (!selectedEquipment || !startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days * selectedEquipment.rate;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEquipmentId || !startDate || !endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    // Renter will be auto-assigned from logged-in user on backend
    createRentalMutation.mutate({
      equipment: { id: parseInt(selectedEquipmentId) },
      startDate,
      endDate,
      notes: notes || undefined,
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6 pt-24 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/equipment")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Equipment
        </Button>
        <Card>
        <CardHeader>
          <CardTitle>Create Rental Request</CardTitle>
          <CardDescription>Request to rent equipment from farmers</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This rental request will be created under your account automatically.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment">Equipment *</Label>
              <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipments
                    .filter(eq => eq.available)
                    .map((equipment) => (
                      <SelectItem key={equipment.id} value={equipment.id.toString()}>
                        {equipment.type} - {equipment.model} (₹{equipment.rate}/day)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEquipment && (
              <Card className="bg-gray-50 p-4">
                <div className="space-y-2">
                  <p className="font-semibold">Selected Equipment:</p>
                  <p>Type: {selectedEquipment.type}</p>
                  <p>Model: {selectedEquipment.model}</p>
                  <p>Rate: ₹{selectedEquipment.rate}/day</p>
                  <p>Owner: {selectedEquipment.owner.firstName} {selectedEquipment.owner.secondName}</p>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {startDate && endDate && selectedEquipment && (
              <Card className="bg-blue-50 p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">Estimated Cost: ₹{calculateCost()}</p>
                    <p className="text-sm text-gray-600">
                      {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days × ₹{selectedEquipment.rate}/day
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information..."
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createRentalMutation.isPending}>
                {createRentalMutation.isPending ? "Creating..." : "Create Rental Request"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/equipment")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default CreateRental;

