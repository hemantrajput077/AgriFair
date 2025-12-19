import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rentalApi, Rental } from "@/services/rentalApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar, DollarSign, Package, User, CreditCard } from "lucide-react";
import Navbar from "@/components/Navbar";
import { apiService } from "@/services/api";
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
  const [activeTab, setActiveTab] = useState<string>("my-requests");

  const isAuthenticated = apiService.isAuthenticated();

  // Rentals I requested (as renter)
  const { data: myRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["rentals", "my-requests"],
    queryFn: () => rentalApi.getMyRentalRequests(),
    enabled: isAuthenticated,
  });

  // Rentals for my equipment (as owner)
  const { data: myEquipmentRentals = [], isLoading: loadingEquipment } = useQuery({
    queryKey: ["rentals", "my-equipment"],
    queryFn: () => rentalApi.getRentalsForMyEquipment(),
    enabled: isAuthenticated,
  });

  const getStatusBadge = (status: Rental["status"]) => {
    const variants: Record<string, string> = {
      PENDING: "bg-yellow-500",
      APPROVED: "bg-blue-500",
      PAID: "bg-purple-500",
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

  const confirmPaymentMutation = useMutation({
    mutationFn: (id: number) => rentalApi.confirmPayment(id),
    onSuccess: () => {
      toast({ title: "Success", description: "Payment confirmed! Rental can now be started." });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
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
      case "confirm-payment":
        confirmPaymentMutation.mutate(rental.id);
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

  const renderRentalCard = (rental: Rental, isOwner: boolean) => {
    // Defensive guards in case backend returns partial data
    const renterFirst = rental.renter?.firstName || "Unknown";
    const renterLast = rental.renter?.secondName || "";
    const ownerFirst = rental.equipment?.owner?.firstName || "Unknown";
    const ownerLast = rental.equipment?.owner?.secondName || "";
    const equipmentType = rental.equipment?.type || "Equipment";
    const equipmentModel = rental.equipment?.model || "";

    return (
      <Card key={rental.id}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {equipmentType} {equipmentModel && `- ${equipmentModel}`}
              </CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {isOwner ? (
                    <>Renter: {renterFirst} {renterLast}</>
                  ) : (
                    <>Owner: {ownerFirst} {ownerLast}</>
                  )}
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
              {/* Actions for Equipment Owner */}
              {isOwner && rental.status === "PENDING" && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="default">Approve</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve Rental Request</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to approve this rental request? The renter will be able to confirm payment and start the rental.
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
                      <Button size="sm" variant="destructive">Reject</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Rental Request</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject this rental request?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleAction(rental, "cancel")}>
                          Reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              {/* Actions for Renter */}
              {!isOwner && rental.status === "APPROVED" && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="default" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Confirm Payment
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Confirm that you have paid ₹{rental.totalCost} to the equipment owner. After confirmation, you can start the rental.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleAction(rental, "confirm-payment")}>
                          Confirm Payment
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

              {!isOwner && rental.status === "PAID" && (
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
                          Are you sure you want to cancel this rental? Payment may be refunded.
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

              {!isOwner && rental.status === "ACTIVE" && (
                <Button size="sm" onClick={() => handleAction(rental, "complete")}>
                  Complete Rental
                </Button>
              )}

              {/* Cancel option for other statuses */}
              {(rental.status === "PENDING" && !isOwner) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">Cancel Request</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Rental Request</AlertDialogTitle>
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
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto p-6 pt-24">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="mb-2 font-semibold">Please log in to view your rentals.</p>
              <p className="text-sm text-gray-500">
                You need to be authenticated as a farmer to see rental requests and manage your rentals.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6 pt-24">
        <h1 className="text-3xl font-bold mb-6">My Rentals</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-requests">
            Rentals I Requested ({myRequests.length})
          </TabsTrigger>
          <TabsTrigger value="my-equipment">
            Rentals for My Equipment ({myEquipmentRentals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-requests">
          {loadingRequests ? (
            <div className="text-center py-8">Loading your rental requests...</div>
          ) : myRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p>You haven't requested any rentals yet.</p>
                <p className="text-sm text-gray-500 mt-2">Browse equipment and create rental requests to see them here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myRequests.map((rental) => renderRentalCard(rental, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-equipment">
          {loadingEquipment ? (
            <div className="text-center py-8">Loading rentals for your equipment...</div>
          ) : myEquipmentRentals.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p>No rental requests for your equipment yet.</p>
                <p className="text-sm text-gray-500 mt-2">When farmers request to rent your equipment, they will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myEquipmentRentals.map((rental) => renderRentalCard(rental, true))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default MyRentals;
