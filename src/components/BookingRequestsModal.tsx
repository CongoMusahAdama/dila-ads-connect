import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";

interface BookingRequest {
  id: string;
  billboard_id: string;
  advertiser_id: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  response_message: string;
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
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBookingRequests = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('booking_requests')
      .select(`
        *,
        billboards!inner(name, location),
        profiles!booking_requests_advertiser_id_fkey(first_name, last_name)
      `)
      .eq('billboards.owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch booking requests.",
        variant: "destructive",
      });
    } else {
      setBookingRequests(data as BookingRequest[] || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchBookingRequests();
    }
  }, [open, user]);

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('booking_requests')
      .update({
        status: action,
        response_message: responseMessage
      })
      .eq('id', requestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update booking request.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Booking request ${action} successfully!`,
      });
      setResponseMessage("");
      setSelectedRequest(null);
      fetchBookingRequests();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Calendar className="w-4 h-4 mr-2" />
          View All Requests
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Booking Requests</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : bookingRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No booking requests found.
          </div>
        ) : (
          <div className="space-y-4">
            {bookingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.billboards.name}</CardTitle>
                      <CardDescription>{request.billboards.location}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Advertiser:</strong> {request.profiles.first_name} {request.profiles.last_name}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <strong>GHS {request.total_amount}</strong>
                    </div>
                    <div>
                      <strong>Start Date:</strong> {formatDate(request.start_date)}
                    </div>
                    <div>
                      <strong>End Date:</strong> {formatDate(request.end_date)}
                    </div>
                  </div>
                  
                  {request.message && (
                    <div>
                      <strong>Message:</strong>
                      <p className="text-sm text-muted-foreground mt-1">{request.message}</p>
                    </div>
                  )}

                  {request.response_message && (
                    <div>
                      <strong>Your Response:</strong>
                      <p className="text-sm text-muted-foreground mt-1">{request.response_message}</p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="space-y-3 pt-4 border-t">
                      {selectedRequest === request.id && (
                        <div className="space-y-2">
                          <Label htmlFor="response">Response Message (Optional)</Label>
                          <Textarea
                            id="response"
                            value={responseMessage}
                            onChange={(e) => setResponseMessage(e.target.value)}
                            placeholder="Add a message to the advertiser..."
                            rows={2}
                          />
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        {selectedRequest === request.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleRequestAction(request.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirm Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRequestAction(request.id, 'rejected')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Confirm Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(null);
                                setResponseMessage("");
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRequest(request.id)}
                              className="border-green-200 text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRequest(request.id)}
                              className="border-red-200 text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
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