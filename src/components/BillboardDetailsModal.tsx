import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, DollarSign, Eye, X, Phone, Mail } from "lucide-react";
import BookingButton from "./BookingButton";

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
      <DialogContent className="w-[95vw] max-w-[600px] h-[85vh] max-h-[90vh] p-0 overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <DialogHeader className="px-4 py-4 border-b shrink-0">
          <div className="space-y-1">
            <DialogTitle className="text-lg font-bold leading-tight text-foreground">
              {billboard.title}
            </DialogTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {billboard.location}
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img 
                  src={billboard.images?.[0] || "/lovable-uploads/9e594151-058a-48ba-aa89-197d1b697959.png"}
                  alt={billboard.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {billboard.images && billboard.images.length > 1 && (
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
                  GH₵{billboard.price?.toLocaleString() || '0'}/month
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Eye className="h-4 w-4 mr-1" />
                  Views
                </div>
                <div className="text-lg font-semibold">
                  {billboard.views?.toLocaleString() || '0'}
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
        <div className="p-4 pt-2 border-t shrink-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => {
                if (billboard?.contact.phone) {
                  window.open(`tel:${billboard.contact.phone}`, '_self');
                } else if (billboard?.contact.email) {
                  window.open(`mailto:${billboard.contact.email}`, '_self');
                }
              }}
            >
              Contact Owner
            </Button>
            <BookingButton billboard={billboard} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillboardDetailsModal;