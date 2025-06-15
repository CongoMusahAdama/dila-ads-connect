import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, DollarSign, Eye, X, Phone, Mail } from "lucide-react";

interface BillboardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  billboard?: {
    id: string;
    title: string;
    location: string;
    price: number;
    size: string;
    description: string;
    availability: string;
    views: number;
    contact: {
      name: string;
      phone: string;
      email: string;
    };
    images: string[];
    features: string[];
  };
}

const BillboardDetailsModal = ({ isOpen, onClose, billboard }: BillboardDetailsModalProps) => {
  if (!billboard) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[600px] h-[80vh] max-h-[90vh] p-0 overflow-hidden md:w-[600px] md:h-auto md:max-h-[85vh]">
        {/* Header - Fixed */}
        <DialogHeader className="p-4 pb-2 border-b shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1 pr-4">
              <DialogTitle className="text-lg md:text-xl font-semibold leading-tight">
                {billboard.title}
              </DialogTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {billboard.location}
              </div>
            </div>
            <DialogClose asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="shrink-0 h-8 w-8 p-0 hover:bg-muted"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img 
                  src={billboard.images[0] || "/lovable-uploads/9e594151-058a-48ba-aa89-197d1b697959.png"}
                  alt={billboard.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {billboard.images.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {billboard.images.slice(1, 4).map((image, index) => (
                    <div key={index} className="aspect-square bg-muted rounded-md overflow-hidden">
                      <img 
                        src={image}
                        alt={`${billboard.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Price
                </div>
                <div className="text-lg font-semibold text-primary">
                  GH₵{billboard.price.toLocaleString()}/month
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Eye className="h-4 w-4 mr-1" />
                  Views
                </div>
                <div className="text-lg font-semibold">
                  {billboard.views.toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Size</div>
                <div className="font-medium">{billboard.size}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Availability
                </div>
                <Badge variant={billboard.availability === 'Available' ? 'default' : 'secondary'}>
                  {billboard.availability}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-semibold">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {billboard.description}
              </p>
            </div>

            {/* Features */}
            {billboard.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {billboard.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="font-semibold">Contact Owner</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="font-medium min-w-0 flex-1">{billboard.contact.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{billboard.contact.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    <span className="truncate">{billboard.contact.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-4 pt-2 border-t shrink-0 bg-background">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Contact Owner
            </Button>
            <Button className="flex-1">
              Book Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillboardDetailsModal;