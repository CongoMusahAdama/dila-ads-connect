import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Mail, Phone, User, MapPin } from "lucide-react";

interface BookingRequest {
  id: string;
  billboard_id: string;
  advertiser_id: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: string;
  message: string | null;
  response_message: string | null;
  created_at: string;
  billboards: {
    name: string;
    location: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
  };
}

const BookingRequestsModal = () => {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchBookingRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('booking_requests')
        .select(`
          *,
          billboards!inner (name, location, owner_id),
          profiles!booking_requests_advertiser_id_fkey (first_name, last_name)
        `)
        .eq('billboards.owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch booking requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      fetchBookingRequests();
    }
  }, [open, user]);

  const handleRequestAction = async (requestId: string, action: 'accepted' | 'rejected', responseMessage?: string) => {
    try {
      const { error } = await supabase
        .from('booking_requests')
        .update({
          status: action,
          response_message: responseMessage || null
        })
        .eq('id', requestId);

      if (error) throw error;

      // Get the request details for notification
      const request = requests.find(r => r.id === requestId);
      
      if (request) {
        // If accepted, mark billboard as unavailable
        if (action === 'accepted') {
          await supabase
            .from('billboards')
            .update({ is_available: false })
            .eq('id', request.billboard_id);
        }

        // Get advertiser email for notification
        try {
          const { data: advertiserData } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('id', request.advertiser_id)
            .single();

          if (advertiserData) {
            const { data: userData } = await supabase.auth.admin.getUserById(advertiserData.user_id);
            const advertiserEmail = userData.user?.email;

            if (advertiserEmail) {
              // Send notification to advertiser
              await supabase.functions.invoke('send-notification', {
                body: {
                  type: action === 'accepted' ? 'booking_accepted' : 'booking_rejected',
                  recipientEmail: advertiserEmail,
                  billboardName: request.billboards.name,
                  ownerName: 'Billboard Owner'
                }
              });
            }
          }
        } catch (notificationError) {
          console.error('Failed to send notification:', notificationError);
          // Don't block the action if notification fails
        }
      }

      toast({
        title: "Success",
        description: `Booking request ${action} successfully!`,
      });

      fetchBookingRequests(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} booking request`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">View All Requests</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Booking Requests</DialogTitle>
          <DialogDescription>
            Manage incoming booking requests for your billboards.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading booking requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No booking requests found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="w-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{request.billboards.name}</CardTitle>
                    {getStatusBadge(request.status)}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {request.billboards.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Advertiser:</span>
                        <span>{request.profiles.first_name} {request.profiles.last_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Duration:</span>
                        <span>
                          {formatDate(request.start_date)} - {formatDate(request.end_date)}
                          ({calculateDuration(request.start_date, request.end_date)} days)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Total Amount:</span>
                        <span className="text-lg font-bold text-green-600">
                          GHS {request.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Request Date:</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {formatDate(request.created_at)}
                        </span>
                      </div>
                      
                      {request.message && (
                        <div>
                          <span className="font-medium">Message:</span>
                          <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                            {request.message}
                          </p>
                        </div>
                      )}
                      
                      {request.response_message && (
                        <div>
                          <span className="font-medium">Your Response:</span>
                          <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                            {request.response_message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => handleRequestAction(request.id, 'accepted', 'Your booking request has been accepted!')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleRequestAction(request.id, 'rejected', 'Sorry, we cannot accommodate your booking request at this time.')}
                        variant="destructive"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingRequestsModal;