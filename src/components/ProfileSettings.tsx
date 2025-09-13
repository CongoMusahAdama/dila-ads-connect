
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { Camera, Save, User, Phone, Mail } from "lucide-react";

const ProfileSettings = () => {
  const { profile, user, updateProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    phone: '',
    email: ''
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        email: user?.email || ''
      });
    }
  }, [profile, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);

      // Upload to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Update profile with new avatar URL
      const { error } = await updateProfile({ avatarUrl: data.imageUrl });
      
      if (error) throw new Error(error);

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });

    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        phone: formData.phone
      });

      if (error) throw new Error(error);

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    } else if (profile?.firstName) {
      return profile.firstName;
    } else if (profile?.lastName) {
      return profile.lastName;
    }
    return profile?.role === 'OWNER' ? 'Billboard Owner' : 'Advertiser';
  };

  const getInitials = () => {
    const firstName = profile?.firstName || '';
    const lastName = profile?.lastName || '';
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return profile?.role === 'OWNER' ? 'BO' : 'AD';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-2">
      <CardHeader className="text-center pb-6 space-y-2">
        <CardTitle className="text-xl sm:text-2xl font-bold text-card-foreground">Profile Settings</CardTitle>
        <CardDescription className="text-sm sm:text-base px-2 max-w-lg mx-auto">
          Manage your profile information, picture, and bio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 px-4 sm:px-8 pb-8">

        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-primary/20 transition-all duration-200 group-hover:ring-primary/40">
              <AvatarImage src={profile?.avatarUrl || ''} className="object-cover" />
              <AvatarFallback className="text-lg sm:text-xl font-bold bg-primary/10 text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              className="absolute -bottom-2 -right-2 rounded-full h-10 w-10 p-0 shadow-lg ring-2 ring-background hover:scale-110 transition-all duration-200"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Camera size={18} />
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
            aria-label="Upload profile picture"
          />
          {uploading && (
            <div className="flex items-center space-x-3 bg-muted/50 px-4 py-2 rounded-full">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
            </div>
          )}
        </div>

        {/* Profile Information Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium flex items-center gap-2">
                <User size={16} />
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                className="border-2 focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium flex items-center gap-2">
                <User size={16} />
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                className="border-2 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail size={16} />
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              disabled
              className="border-2 bg-muted/50 text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
              <Phone size={16} />
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              className="border-2 focus:border-primary transition-colors"
            />
          </div>

          {/* Bio Section */}
          <div className="space-y-3">
            <Label htmlFor="bio" className="text-base font-semibold text-card-foreground flex items-center gap-2">
              Bio
            </Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself or your business..."
              rows={4}
              className="resize-none text-sm sm:text-base min-h-[120px] border-2 focus:border-primary transition-colors bg-background/50"
            />
            <p className="text-xs sm:text-sm text-muted-foreground px-1">
              Share a brief description about yourself or your business (optional)
            </p>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSaveProfile} 
          disabled={loading} 
          className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
        >
          <Save size={18} className="mr-2" />
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
              Saving...
            </span>
          ) : (
            "Save Profile"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
