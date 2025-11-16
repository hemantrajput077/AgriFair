import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { rentalApi, Farmer } from "@/services/rentalApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";

const CreateEquipment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [equipmentData, setEquipmentData] = useState({
    type: "",
    model: "",
    rate: "",
    available: true,
    ownerId: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: farmers = [] } = useQuery({
    queryKey: ["farmers"],
    queryFn: () => rentalApi.getFarmers(),
  });

  const createEquipmentMutation = useMutation({
    mutationFn: (data: {
      equipment: any;
      image?: File;
    }) => rentalApi.createEquipment(data.equipment, data.image),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Equipment created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
      navigate("/equipment");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create equipment",
        variant: "destructive",
      });
    },
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!equipmentData.ownerId || !equipmentData.type || !equipmentData.model || !equipmentData.rate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const equipment = {
      type: equipmentData.type,
      model: equipmentData.model,
      rate: parseInt(equipmentData.rate),
      available: equipmentData.available,
      owner: { id: parseInt(equipmentData.ownerId) },
    };

    createEquipmentMutation.mutate({
      equipment,
      image: imageFile || undefined,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
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
          <CardTitle>Add Equipment for Rent</CardTitle>
          <CardDescription>List your equipment so others can rent it</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="owner">Owner (Farmer) *</Label>
              <Select
                value={equipmentData.ownerId}
                onValueChange={(value) => setEquipmentData({ ...equipmentData, ownerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {farmers.map((farmer) => (
                    <SelectItem key={farmer.id} value={farmer.id.toString()}>
                      {farmer.firstName} {farmer.secondName} - {farmer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Equipment Type *</Label>
                <Input
                  id="type"
                  placeholder="e.g., Tractor, Harvester"
                  value={equipmentData.type}
                  onChange={(e) => setEquipmentData({ ...equipmentData, type: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  placeholder="e.g., Mahindra 575 DI"
                  value={equipmentData.model}
                  onChange={(e) => setEquipmentData({ ...equipmentData, model: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Daily Rate (₹) *</Label>
              <Input
                id="rate"
                type="number"
                placeholder="3500"
                value={equipmentData.rate}
                onChange={(e) => setEquipmentData({ ...equipmentData, rate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Equipment Image (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {imagePreview && (
                  <div className="w-32 h-32 rounded-md overflow-hidden border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createEquipmentMutation.isPending}
                className="flex-1"
              >
                {createEquipmentMutation.isPending ? "Creating..." : "Create Equipment"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/equipment")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEquipment;

