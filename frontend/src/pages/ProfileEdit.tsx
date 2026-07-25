import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Save, Trash2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { profileApi, ProfileUpdateData } from "@/services/profileApi";
import Navbar from "@/components/Navbar";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch current profile
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['myProfile'],
    queryFn: () => profileApi.getMyProfile(),
  });

  const [formData, setFormData] = useState<ProfileUpdateData>({
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    bio: "",
    farmName: "",
    farmSize: undefined,
    farmingType: "",
    yearsOfExperience: undefined,
    preferredDeliveryTime: "",
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        phoneNumber: profile.phoneNumber || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
        bio: profile.bio || "",
        farmName: profile.farmName || "",
        farmSize: profile.farmSize || undefined,
        farmingType: profile.farmingType || "",
        yearsOfExperience: profile.yearsOfExperience || undefined,
        preferredDeliveryTime: profile.preferredDeliveryTime || "",
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileUpdateData) => profileApi.updateProfile(data),
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update image mutation
  const updateImageMutation = useMutation({
    mutationFn: (file: File) => profileApi.updateProfileImage(file),
    onSuccess: () => {
      toast({
        title: "Profile image updated",
        description: "Your profile image has been updated",
      });
      setImageFile(null);
      setImagePreview(null);
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Image upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: () => profileApi.deleteProfileImage(),
    onSuccess: () => {
      toast({
        title: "Profile image removed",
        description: "Your profile image has been removed",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Update image if selected
    if (imageFile) {
      await updateImageMutation.mutateAsync(imageFile);
    }

    // Update profile data
    updateProfileMutation.mutate(formData);
  };

  const handleDeleteImage = () => {
    if (confirm("Are you sure you want to remove your profile image?")) {
      deleteImageMutation.mutate();
    }
  };

  const isFarmer = profile?.role?.includes("FARMER");
  const isCustomer = profile?.role?.includes("CUSTOMER");

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto p-6 pt-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-6 pt-24 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-gray-600">Update your profile information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
              <CardDescription>Upload or change your profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={imagePreview || (profile?.profileImage ? `http://localhost:8080${profile.profileImage}` : undefined)}
                  />
                  <AvatarFallback>
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex gap-2">
                  <div>
                    <Input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Label htmlFor="profile-image">
                      <Button type="button" variant="outline" asChild>
                        <span className="cursor-pointer">
                          <Camera className="w-4 h-4 mr-2" />
                          {imageFile || profile?.profileImage ? "Change Image" : "Upload Image"}
                        </span>
                      </Button>
                    </Label>
                  </div>

                  {(profile?.profileImage || imagePreview) && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteImage}
                      disabled={deleteImageMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              {imageFile && (
                <p className="text-sm text-gray-500">
                  Selected: {imageFile.name}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={profile?.username || ""} disabled />
                  <p className="text-xs text-gray-500">Username cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={profile?.email || ""} disabled />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="Pincode"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Farmer-Specific Fields */}
          {isFarmer && (
            <Card>
              <CardHeader>
                <CardTitle>Farm Information</CardTitle>
                <CardDescription>Information about your farm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmName">Farm Name</Label>
                    <Input
                      id="farmName"
                      value={formData.farmName}
                      onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                      placeholder="Your farm name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size (acres)</Label>
                    <Input
                      id="farmSize"
                      type="number"
                      step="0.1"
                      value={formData.farmSize || ""}
                      onChange={(e) => setFormData({ ...formData, farmSize: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="Farm size in acres"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farmingType">Farming Type</Label>
                    <Select
                      value={formData.farmingType}
                      onValueChange={(value) => setFormData({ ...formData, farmingType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select farming type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Organic">Organic</SelectItem>
                        <SelectItem value="Conventional">Conventional</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      value={formData.yearsOfExperience || ""}
                      onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value ? parseInt(e.target.value) : undefined })}
                      placeholder="Years of farming experience"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer-Specific Fields */}
          {isCustomer && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="preferredDeliveryTime">Preferred Delivery Time</Label>
                  <Input
                    id="preferredDeliveryTime"
                    value={formData.preferredDeliveryTime}
                    onChange={(e) => setFormData({ ...formData, preferredDeliveryTime: e.target.value })}
                    placeholder="e.g., Morning (9 AM - 12 PM)"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending || updateImageMutation.isPending}
              className="flex-1"
            >
              {(updateProfileMutation.isPending || updateImageMutation.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;
