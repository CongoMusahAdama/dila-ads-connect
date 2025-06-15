import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Save } from "lucide-react";

const ProfileSettings = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    bio: profile?.bio || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });

      // Refresh the page to show the new avatar
      window.location.reload();

    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBio = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: formData.bio
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bio updated successfully!",
      });

      // Refresh the page to show updated info
      setTimeout(() => window.location.reload(), 1000);

    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    } else if (profile?.first_name) {
      return profile.first_name;
    } else if (profile?.last_name) {
      return profile.last_name;
    }
    return profile?.role === 'owner' ? 'Billboard Owner' : 'Advertiser';
  };

  const getInitials = () => {
    const firstName = profile?.first_name || '';
    const lastName = profile?.last_name || '';
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return profile?.role === 'owner' ? 'BO' : 'AD';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg sm:text-xl">Profile Settings</CardTitle>
        <CardDescription className="text-sm px-2">
          Manage your profile picture and bio. Your name is set from registration and cannot be changed here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-4 sm:px-6">
        {/* Display Name (Read-only) */}
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 break-words">
            {getDisplayName()}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Your registered name
          </p>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="text-base sm:text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 rounded-full h-7 w-7 sm:h-8 sm:w-8 p-0 shadow-lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Camera size={14} className="sm:hidden" />
              <Camera size={16} className="hidden sm:block" />
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          {uploading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <p className="text-xs sm:text-sm text-muted-foreground">Uploading...</p>
            </div>
          )}
        </div>

        {/* Bio Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              rows={3}
              className="resize-none text-sm min-h-[80px] sm:min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Share a brief description about yourself or your business
            </p>
          </div>

          <Button 
            onClick={handleSaveBio} 
            disabled={loading} 
            className="w-full h-10 sm:h-11 text-sm font-medium"
          >
            <Save size={16} className="mr-2" />
            {loading ? "Saving..." : "Save Bio"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
