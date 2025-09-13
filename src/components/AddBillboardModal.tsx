import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMyBillboards } from "@/hooks/useBillboards";
import { Upload } from "lucide-react";

interface AddBillboardModalProps {
  onBillboardAdded: () => void;
}

const AddBillboardModal = ({ onBillboardAdded }: AddBillboardModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    size: "",
    pricePerDay: "",
    description: "",
    imageUrl: "",
    phone: "",
    email: "",
    selectedFile: undefined as File | undefined,
    imagePreview: ""
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { createBillboard } = useMyBillboards();

  // Cleanup object URL on component unmount
  useEffect(() => {
    return () => {
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [formData.imagePreview]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG, JPG, PNG, or WebP image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create a preview URL for the selected file
    const previewUrl = URL.createObjectURL(file);

    // Store the file and preview URL for later upload with the form
    setFormData(prev => ({
      ...prev,
      selectedFile: file,
      imagePreview: previewUrl
    }));

    toast({
      title: "File selected",
      description: "Image file selected successfully!",
    });
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
    if (!user) return;

    // Validate image URL if provided
    if (formData.imageUrl && !validateImageUrl(formData.imageUrl)) {
      toast({
        title: "Invalid image URL",
        description: "Please enter a valid image URL ending with .jpg, .jpeg, .png, .webp, or .gif",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('location', formData.location);
    submitData.append('size', formData.size);
    submitData.append('pricePerDay', formData.pricePerDay);
    submitData.append('description', formData.description);
    submitData.append('phone', formData.phone);
    submitData.append('email', formData.email);
    
    // Add image file if selected, otherwise add imageUrl
    if (formData.selectedFile) {
      submitData.append('image', formData.selectedFile);
    } else if (formData.imageUrl) {
      submitData.append('imageUrl', formData.imageUrl);
    }

    const result = await createBillboard(submitData);

    if (result.success) {
      toast({
        title: "Success",
        description: "Billboard added successfully! It will appear on the home screen once approved by admin.",
      });
      // Clean up the object URL if it exists
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview);
      }
      
      setFormData({
        name: "",
        location: "",
        size: "",
        pricePerDay: "",
        description: "",
        imageUrl: "",
        phone: "",
        email: "",
        selectedFile: undefined,
        imagePreview: ""
      });
      onBillboardAdded();
      setOpen(false);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add billboard",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Add New Billboard</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Billboard</DialogTitle>
          <DialogDescription>
            Fill in the details for your new billboard listing.
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
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-sm font-medium text-primary hover:text-primary/80">
                            Change image
                          </span>
                          <Input
                            id="file-upload"
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
                        />
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        JPEG, JPG, PNG, WebP up to 5MB
                      </p>
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
                <p className="text-xs text-muted-foreground">
                  Must be a valid URL ending with .jpg, .jpeg, .png, .webp, or .gif
                </p>
              </TabsContent>
            </Tabs>
            
            {formData.imageUrl && (
              <div className="mt-2">
                <img 
                  src={formData.imageUrl} 
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Billboard"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBillboardModal;