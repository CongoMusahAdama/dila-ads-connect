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
      <DialogContent className="w-[95vw] max-w-[700px] h-[85vh] max-h-[90vh] p-0 overflow-hidden md:w-[700px] md:h-auto md:max-h-[80vh]">
        {/* Header - Fixed */}
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-background/95 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1 pr-4">
              <DialogTitle className="text-xl md:text-2xl font-bold leading-tight text-foreground">
                {billboard.title}
              </DialogTitle>
              <div className="flex items-center text-sm md:text-base text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                {billboard.location}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted">
          <div className="px-6 py-4 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-xl overflow-hidden shadow-sm">
                <img 
                  src={billboard.images[0] || "/lovable-uploads/9e594151-058a-48ba-aa89-197d1b697959.png"}
                  alt={billboard.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {billboard.images.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {billboard.images.slice(1, 4).map((image, index) => (
                    <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden shadow-sm">
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
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Monthly Price
                </div>
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  GH₵{billboard.price.toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Eye className="h-4 w-4 mr-2" />
                  Monthly Views
                </div>
                <div className="text-2xl md:text-3xl font-bold">
                  {billboard.views.toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Billboard Size</div>
                <div className="text-lg font-semibold">{billboard.size}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Status
                </div>
                <Badge 
                  variant={billboard.availability === 'Available' ? 'default' : 'secondary'}
                  className="text-sm px-3 py-1"
                >
                  {billboard.availability}
                </Badge>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Description</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {billboard.description}
              </p>
            </div>

            {/* Features */}
            {billboard.features.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Key Features</h3>
                <div className="flex flex-wrap gap-2">
                  {billboard.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-6" />

            {/* Contact Information */}
            <div className="space-y-4 mb-4">
              <h3 className="text-lg font-bold">Contact Information</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold text-base">{billboard.contact.name}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{billboard.contact.phone}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="break-all">{billboard.contact.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 border-t shrink-0 bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={onClose}>
              Contact Owner
            </Button>
            <Button className="flex-1 h-12 bg-primary hover:bg-primary/90">
              Book Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillboardDetailsModal;