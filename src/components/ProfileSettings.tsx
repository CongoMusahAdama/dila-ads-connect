
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
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-2">
      <CardHeader className="text-center pb-6 space-y-2">
        <CardTitle className="text-xl sm:text-2xl font-bold text-card-foreground">Profile Settings</CardTitle>
        <CardDescription className="text-sm sm:text-base px-2 max-w-lg mx-auto">
          Manage your profile picture and bio. Your name is set from registration and cannot be changed here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 px-4 sm:px-8 pb-8">
        {/* Display Name (Read-only) */}
        <div className="text-center space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-card-foreground break-words px-2">
            {getDisplayName()}
          </h3>
          <p className="text-sm text-muted-foreground font-medium">
            Your registered name
          </p>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-primary/20 transition-all duration-200 group-hover:ring-primary/40">
              <AvatarImage src={profile?.avatar_url || ''} className="object-cover" />
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
          />
          {uploading && (
            <div className="flex items-center space-x-3 bg-muted/50 px-4 py-2 rounded-full">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
            </div>
          )}
        </div>

        {/* Bio Section */}
        <div className="space-y-6">
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

          <Button 
            onClick={handleSaveBio} 
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
              "Save Bio"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
