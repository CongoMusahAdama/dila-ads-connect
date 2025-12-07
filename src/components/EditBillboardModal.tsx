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
import { Upload } from "lucide-react";
import { apiClient } from "@/lib/api";
import { getImageUrl } from "@/utils/imageUtils";

interface Billboard {
  _id: string; // Updated to match backend
  name: string;
  location: string;
  size: string;
  pricePerDay: number; // Updated to match backend
  description?: string;
  imageUrl?: string; // Updated to match backend
  phone?: string;
  email?: string;
  isAvailable: boolean; // Updated to match backend
}

interface EditBillboardModalProps {
  billboard: any | null; // Allow flexibility but ideally type it
  isOpen: boolean;
  onClose: () => void;
  onBillboardUpdated: () => void;
}

const EditBillboardModal = ({ billboard, isOpen, onClose, onBillboardUpdated }: EditBillboardModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    size: "",
    pricePerDay: "",
    description: "",
    imageUrl: "",
    phone: "",
    email: "",
    isAvailable: true,
    selectedFile: undefined as File | undefined,
    imagePreview: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (billboard) {
      setFormData({
        name: billboard.name || "",
        location: billboard.location || "",
        size: billboard.size || "",
        pricePerDay: billboard.pricePerDay?.toString() || "",
        description: billboard.description || "",
        imageUrl: billboard.imageUrl || "",
        phone: billboard.phone || "",
        email: billboard.email || "",
        isAvailable: billboard.isAvailable !== undefined ? billboard.isAvailable : true,
        selectedFile: undefined,
        imagePreview: ""
      });
    }

    // Cleanup preview on unmount or billboard change
    return () => {
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [billboard]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      selectedFile: file,
      imagePreview: previewUrl
    }));
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

    // If using URL, validate it
    if (!formData.selectedFile && formData.imageUrl && !validateImageUrl(formData.imageUrl)) {
      toast({
        title: "Invalid image URL",
        description: "Please enter a valid image URL ending with .jpg, .jpeg, .png, .webp, or .gif",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('location', formData.location);
      submitData.append('size', formData.size);
      submitData.append('pricePerDay', formData.pricePerDay);
      submitData.append('description', formData.description);
      submitData.append('phone', formData.phone);
      submitData.append('email', formData.email);
      submitData.append('isAvailable', formData.isAvailable.toString());

      if (formData.selectedFile) {
        submitData.append('image', formData.selectedFile);
      } else if (formData.imageUrl) {
        submitData.append('imageUrl', formData.imageUrl);
      }

      const response = await apiClient.updateBillboard(billboard._id, submitData);

      toast({
        title: "Success",
        description: "Billboard updated successfully!",
      });
      onBillboardUpdated();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update billboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
              <Label htmlFor="pricePerDay">Price per Day (GHS)</Label>
              <Input
                id="pricePerDay"
                name="pricePerDay"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.pricePerDay}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isAvailable"
              checked={formData.isAvailable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: checked }))}
            />
            <Label htmlFor="isAvailable">Available for booking</Label>
          </div>

          <div className="space-y-2">
            <Label>Billboard Image</Label>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload Image</TabsTrigger>
                <TabsTrigger value="url">Image URL</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-2">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center relative">
                  {formData.imagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded border mx-auto"
                      />
                      <div className="space-y-2">
                        <Label htmlFor="file-upload-edit" className="cursor-pointer">
                          <span className="text-sm font-medium text-primary hover:text-primary/80">
                            Change image
                          </span>
                          <Input
                            id="file-upload-edit"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          File: {formData.selectedFile?.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <div className="space-y-2">
                        <Label htmlFor="file-upload-edit" className="cursor-pointer">
                          <span className="text-sm font-medium text-primary hover:text-primary/80">
                            Choose image file
                          </span>
                          <Input
                            id="file-upload-edit"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          JPEG, JPG, PNG, WebP up to 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-2">
                <Input
                  placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                />
              </TabsContent>
            </Tabs>

            {!formData.imagePreview && formData.imageUrl && (
              <div className="mt-2">
                <img
                  // If it's a relative path from our backend
                  src={getImageUrl(formData.imageUrl)}
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