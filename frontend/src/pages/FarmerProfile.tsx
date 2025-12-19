import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { rentalApi, Farmer } from "@/services/rentalApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Save, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";

const FarmerProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [profileData, setProfileData] = useState({
    firstName: "",
    secondName: "",
    phoneNo: "",
    county: "",
    localArea: "",
  });

  const { data: farmerProfile, isLoading, error } = useQuery({
    queryKey: ["myFarmerProfile"],
    queryFn: () => rentalApi.getMyFarmerProfile(),
    retry: 1,
  });

  useEffect(() => {
    if (farmerProfile) {
      setProfileData({
        firstName: farmerProfile.firstName || "",
        secondName: farmerProfile.secondName || "",
        phoneNo: farmerProfile.phoneNo?.startsWith("+91-000000") ? "" : (farmerProfile.phoneNo || ""),
        county: farmerProfile.county === "Not Set" ? "" : (farmerProfile.county || ""),
        localArea: farmerProfile.localArea === "Not Set" ? "" : (farmerProfile.localArea || ""),
      });
    }
  }, [farmerProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<Farmer>) => rentalApi.updateMyFarmerProfile(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["myFarmerProfile"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!profileData.firstName || !profileData.firstName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name is required",
        variant: "destructive",
      });
      return;
    }

    if (profileData.phoneNo && !/^[+]?[0-9\-]{7,15}$/.test(profileData.phoneNo)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number (e.g., +91-1234567890)",
        variant: "destructive",
      });
      return;
    }

    const updateData: Partial<Farmer> = {
      firstName: profileData.firstName.trim(),
      secondName: profileData.secondName.trim(),
      phoneNo: profileData.phoneNo.trim() || undefined,
      county: profileData.county.trim() || undefined,
      localArea: profileData.localArea.trim() || undefined,
    };

    updateProfileMutation.mutate(updateData);
  };

  const isPlaceholderPhone = farmerProfile?.phoneNo?.startsWith("+91-000000");
  const isPlaceholderLocation = farmerProfile?.county === "Not Set" || farmerProfile?.localArea === "Not Set";

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto p-6 pt-24">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto p-6 pt-24">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load profile. Please try again."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6 pt-24 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/farmer-dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>My Farmer Profile</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {(isPlaceholderPhone || isPlaceholderLocation) && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please complete your profile information to use all features. Some fields are currently using placeholder values.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    required
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondName">Last Name</Label>
                  <Input
                    id="secondName"
                    value={profileData.secondName}
                    onChange={(e) => setProfileData({ ...profileData, secondName: e.target.value })}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNo">
                  Phone Number {isPlaceholderPhone && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="phoneNo"
                  value={profileData.phoneNo}
                  onChange={(e) => setProfileData({ ...profileData, phoneNo: e.target.value })}
                  placeholder="+91-1234567890"
                  required={isPlaceholderPhone}
                />
                {isPlaceholderPhone && (
                  <p className="text-sm text-muted-foreground">
                    Please provide your phone number to complete your profile
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="county">
                    County {isPlaceholderLocation && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="county"
                    value={profileData.county}
                    onChange={(e) => setProfileData({ ...profileData, county: e.target.value })}
                    placeholder="Enter your county"
                    required={isPlaceholderLocation}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="localArea">
                    Local Area {isPlaceholderLocation && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="localArea"
                    value={profileData.localArea}
                    onChange={(e) => setProfileData({ ...profileData, localArea: e.target.value })}
                    placeholder="Enter your local area"
                    required={isPlaceholderLocation}
                  />
                </div>
              </div>

              {farmerProfile && (
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <p className="text-sm font-semibold">Account Information</p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Email:</strong> {farmerProfile.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>User ID:</strong> {farmerProfile.userId || "Not linked"}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/farmer-dashboard")}
                >
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

export default FarmerProfile;

