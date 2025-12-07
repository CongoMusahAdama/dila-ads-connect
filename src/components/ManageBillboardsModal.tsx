import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, MapPin, Calendar, Trash2 } from "lucide-react";
import EditBillboardModal from "./EditBillboardModal";
import { useMyBillboards } from "@/hooks/useBillboards";
import { getBillboardImageUrl } from "@/utils/imageUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Billboard {
  _id: string;
  name: string;
  location: string;
  size: string;
  pricePerDay: number;
  description?: string;
  imageUrl?: string;
  phone?: string;
  email?: string;
  isAvailable: boolean;
  isApproved: boolean;
  createdAt: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

interface ManageBillboardsModalProps {
  trigger?: React.ReactNode;
}

const ManageBillboardsModal = ({ trigger }: ManageBillboardsModalProps) => {
  const [open, setOpen] = useState(false);
  const [selectedBillboard, setSelectedBillboard] = useState<Billboard | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [billboardToDelete, setBillboardToDelete] = useState<Billboard | null>(null);
  const { toast } = useToast();

  const {
    billboards,
    loading,
    updateBillboard,
    deleteBillboard,
    refetch
  } = useMyBillboards();

  const handleEditBillboard = (billboard: any) => {
    // Map the backend structure to what the edit modal might expect if needed,
    // but better to update the edit modal to use the backend structure.
    setSelectedBillboard(billboard);
    setIsEditModalOpen(true);
  };

  const handleBillboardUpdated = async () => {
    await refetch();
    setIsEditModalOpen(false);
    setSelectedBillboard(null);
  };

  const handleToggleAvailability = async (billboard: Billboard) => {
    try {
      const formData = new FormData();
      formData.append('isAvailable', (!billboard.isAvailable).toString());

      // We also need to send required fields if the backend validation is strict,
      // but usually PATCH/PUT allows partial updates or we send everything.
      // Based on controller, it looks like it accepts partials but we should be careful.
      // The controller assigns req.body fields to updateData.
      // Let's send basic required fields just in case or hopefully the backend handles partials.
      // Looking at controller: if (pricePerDay !== undefined) ... 
      // It iterates fields. It seems safe to send just isAvailable.

      const result = await updateBillboard(billboard._id, formData);

      if (result.success) {
        toast({
          title: "Success",
          description: `Billboard ${!billboard.isAvailable ? 'enabled' : 'disabled'} successfully!`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update billboard status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBillboard = async () => {
    if (!billboardToDelete) return;

    try {
      const result = await deleteBillboard(billboardToDelete._id);

      if (result.success) {
        toast({
          title: "Success",
          description: "Billboard deleted successfully",
        });
        setBillboardToDelete(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete billboard",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button variant="outline" className="w-full">Manage Billboards</Button>}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Your Billboards</DialogTitle>
            <DialogDescription>
              View, edit, and manage all your billboard listings.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading billboards...</p>
            </div>
          ) : billboards.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No billboards found. Add your first billboard!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {billboards.map((billboard: any) => (
                <Card key={billboard._id} className={`w-full ${billboard.status === 'REJECTED' ? 'border-destructive/50' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{billboard.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={billboard.isAvailable ? "default" : "secondary"}>
                          {billboard.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                        {billboard.status === 'REJECTED' ? (
                          <Badge variant="destructive">Rejected</Badge>
                        ) : (
                          <Badge variant={billboard.isApproved ? "default" : "outline"}>
                            {billboard.isApproved ? "Approved" : "Pending Approval"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {billboard.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {billboard.status === 'REJECTED' && (
                      <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm font-medium">
                        Rejection Reason: {billboard.rejectionReason || 'No reason provided. Please contact admin.'}
                        <div className="mt-1 text-xs opacity-90">Edit and save to resubmit for approval.</div>
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        {billboard.imageUrl && (
                          <img
                            // Handle both relative and absolute URLs if needed, but backend serves relative usually
                            src={getBillboardImageUrl(billboard)}
                            alt={billboard.name}
                            className="w-full h-32 object-cover rounded border"
                            onError={(e) => {
                              // Fallback or hide
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}

                        <div className="space-y-1">
                          <p><span className="font-medium">Size:</span> {billboard.size}</p>
                          <p><span className="font-medium">Price:</span> GHS {billboard.pricePerDay}/day</p>
                          <p><span className="font-medium">Phone:</span> {billboard.phone}</p>
                          <p><span className="font-medium">Email:</span> {billboard.email}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {billboard.description && (
                          <div>
                            <span className="font-medium">Description:</span>
                            <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                              {billboard.description}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Created: {formatDate(billboard.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => handleEditBillboard(billboard)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleToggleAvailability(billboard)}
                        variant={billboard.isAvailable ? "secondary" : "default"}
                      >
                        {billboard.isAvailable ? "Mark Unavailable" : "Mark Available"}
                      </Button>
                      <Button
                        onClick={() => setBillboardToDelete(billboard)}
                        variant="destructive"
                        size="icon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EditBillboardModal
        billboard={selectedBillboard}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBillboard(null);
        }}
        onBillboardUpdated={handleBillboardUpdated}
      />

      <AlertDialog open={!!billboardToDelete} onOpenChange={(open) => !open && setBillboardToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your billboard listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBillboard} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ManageBillboardsModal;