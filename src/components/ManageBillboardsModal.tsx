import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Edit, MapPin, Calendar, Eye } from "lucide-react";
import EditBillboardModal from "./EditBillboardModal";

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
  created_at: string;
}

const ManageBillboardsModal = () => {
  const [open, setOpen] = useState(false);
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBillboard, setSelectedBillboard] = useState<Billboard | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchBillboards = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('billboards')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBillboards(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch billboards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      fetchBillboards();
    }
  }, [open, user]);

  const handleEditBillboard = (billboard: Billboard) => {
    setSelectedBillboard(billboard);
    setIsEditModalOpen(true);
  };

  const handleBillboardUpdated = () => {
    fetchBillboards();
    setIsEditModalOpen(false);
    setSelectedBillboard(null);
  };

  const handleToggleAvailability = async (billboard: Billboard) => {
    try {
      const { error } = await supabase
        .from('billboards')
        .update({ is_available: !billboard.is_available })
        .eq('id', billboard.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Billboard ${!billboard.is_available ? 'enabled' : 'disabled'} successfully!`,
      });

      fetchBillboards();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update billboard status",
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
          <Button variant="outline" className="w-full">Manage Billboards</Button>
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
              {billboards.map((billboard) => (
                <Card key={billboard.id} className="w-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{billboard.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={billboard.is_available ? "default" : "destructive"}>
                          {billboard.is_available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {billboard.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        {billboard.image_url && (
                          <img
                            src={billboard.image_url}
                            alt={billboard.name}
                            className="w-full h-32 object-cover rounded border"
                          />
                        )}
                        
                        <div className="space-y-1">
                          <p><span className="font-medium">Size:</span> {billboard.size}</p>
                          <p><span className="font-medium">Price:</span> GHS {billboard.price_per_day}/day</p>
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
                            Created: {formatDate(billboard.created_at)}
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
                        variant={billboard.is_available ? "destructive" : "default"}
                      >
                        {billboard.is_available ? "Mark Unavailable" : "Mark Available"}
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
    </>
  );
};

export default ManageBillboardsModal;