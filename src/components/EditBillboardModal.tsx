import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";

interface Billboard {
  id: string;
  name: string;
  location: string;
  size: string;
  price_per_day: number;
  description: string;
  image_url: string;
  phone: string;
  email: string;
  is_available: boolean;
}

interface EditBillboardModalProps {
  billboard: Billboard | null;
  isOpen: boolean;
  onClose: () => void;
  onBillboardUpdated: () => void;
}

const EditBillboardModal = ({ billboard, isOpen, onClose, onBillboardUpdated }: EditBillboardModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    size: "",
    price_per_day: "",
    description: "",
    image_url: "",
    phone: "",
    email: "",
    is_available: true
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (billboard) {
      setFormData({
        name: billboard.name || "",
        location: billboard.location || "",
        size: billboard.size || "",
        price_per_day: billboard.price_per_day?.toString() || "",
        description: billboard.description || "",
        image_url: billboard.image_url || "",
        phone: billboard.phone || "",
        email: billboard.email || "",
        is_available: billboard.is_available
      });
    }
  }, [billboard]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG, JPG, PNG, or WebP image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('billboard-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from('billboard-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({
        ...prev,
        image_url: publicData.publicUrl
      }));

      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const validateImageUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billboard) return;

    if (formData.image_url && !validateImageUrl(formData.image_url)) {
      toast({
        title: "Invalid image URL",
        description: "Please enter a valid image URL ending with .jpg, .jpeg, .png, .webp, or .gif",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const { error } = await supabase
      .from('billboards')
      .update({
        ...formData,
        price_per_day: parseFloat(formData.price_per_day)
      })
      .eq('id', billboard.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Billboard updated successfully!",
      });
      onBillboardUpdated();
      onClose();
    }
    
    setLoading(false);
  };

  if (!billboard) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Billboard</DialogTitle>
          <DialogDescription>
            Update your billboard listing details.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Billboard Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter billboard name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select 
                value={formData.location} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Accra">Accra</SelectItem>
                  <SelectItem value="Takoradi">Takoradi</SelectItem>
                  <SelectItem value="Kumasi">Kumasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                name="size"
                placeholder="e.g., 48 x 14 ft"
                value={formData.size}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price_per_day">Price per Day (GHS)</Label>
              <Input
                id="price_per_day"
                name="price_per_day"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price_per_day}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_available"
              checked={formData.is_available}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
            />
            <Label htmlFor="is_available">Available for booking</Label>
          </div>

          <div className="space-y-2">
            <Label>Billboard Image</Label>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload Image</TabsTrigger>
                <TabsTrigger value="url">Image URL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-2">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-sm font-medium text-primary hover:text-primary/80">
                        Choose image file
                      </span>
                      <Input
                        id="file-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      JPEG, JPG, PNG, WebP up to 5MB
                    </p>
                    {uploading && (
                      <p className="text-sm text-primary">Uploading...</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="url" className="space-y-2">
                <Input
                  placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                />
              </TabsContent>
            </Tabs>
            
            {formData.image_url && (
              <div className="mt-2">
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter billboard description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Billboard"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBillboardModal;