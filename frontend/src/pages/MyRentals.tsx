import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rentalApi, Rental } from "@/services/rentalApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, DollarSign, Package, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MyRentals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>("");

  const { data: farmers = [] } = useQuery({
    queryKey: ["farmers"],
    queryFn: () => rentalApi.getFarmers(),
  });

  const { data: rentals = [], isLoading } = useQuery({
    queryKey: ["rentals", selectedFarmerId],
    queryFn: () => {
      if (selectedFarmerId) {
        return rentalApi.getRentalsByFarmer(parseInt(selectedFarmerId));
      }
      return rentalApi.getRentals();
    },
  });

  const getStatusBadge = (status: Rental["status"]) => {
    const variants: Record<string, string> = {
      PENDING: "bg-yellow-500",
      APPROVED: "bg-blue-500",
      ACTIVE: "bg-green-500",
      COMPLETED: "bg-gray-500",
      CANCELLED: "bg-red-500",
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const approveMutation = useMutation({
    mutationFn: (id: number) => rentalApi.approveRental(id),
    onSuccess: () => {
      toast({ title: "Success", description: "Rental approved!" });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const startMutation = useMutation({
    mutationFn: (id: number) => rentalApi.startRental(id),
    onSuccess: () => {
      toast({ title: "Success", description: "Rental started!" });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => rentalApi.completeRental(id),
    onSuccess: () => {
      toast({ title: "Success", description: "Rental completed!" });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => rentalApi.cancelRental(id),
    onSuccess: () => {
      toast({ title: "Success", description: "Rental cancelled!" });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAction = (rental: Rental, action: string) => {
    switch (action) {
      case "approve":
        approveMutation.mutate(rental.id);
        break;
      case "start":
        startMutation.mutate(rental.id);
        break;
      case "complete":
        completeMutation.mutate(rental.id);
        break;
      case "cancel":
        cancelMutation.mutate(rental.id);
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading rentals...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Rentals</h1>
        <div className="flex gap-4">
          <select
            value={selectedFarmerId}
            onChange={(e) => setSelectedFarmerId(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="">All Rentals</option>
            {farmers.map((farmer) => (
              <option key={farmer.id} value={farmer.id.toString()}>
                {farmer.firstName} {farmer.secondName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {rentals.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>No rentals found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rentals.map((rental) => (
            <Card key={rental.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {rental.equipment.type} - {rental.equipment.model}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Renter: {rental.renter.firstName} {rental.renter.secondName}
                      </div>
                    </CardDescription>
                  </div>
                  {getStatusBadge(rental.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        <strong>Start:</strong> {new Date(rental.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        <strong>End:</strong> {new Date(rental.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">Total Cost: ₹{rental.totalCost}</span>
                  </div>
                  {rental.notes && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm"><strong>Notes:</strong> {rental.notes}</p>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {rental.status === "PENDING" && (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="default">Approve</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Approve Rental</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to approve this rental request?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleAction(rental, "approve")}>
                                Approve
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">Cancel</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Rental</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this rental request?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleAction(rental, "cancel")}>
                                Yes, Cancel
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    {rental.status === "APPROVED" && (
                      <>
                        <Button size="sm" onClick={() => handleAction(rental, "start")}>
                          Start Rental
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">Cancel</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Rental</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this approved rental?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleAction(rental, "cancel")}>
                                Yes, Cancel
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    {rental.status === "ACTIVE" && (
                      <Button size="sm" onClick={() => handleAction(rental, "complete")}>
                        Complete Rental
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRentals;

