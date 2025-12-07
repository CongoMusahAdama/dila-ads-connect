import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useBillboardBookingRequests } from "@/hooks/useBookings";
import { Calendar, Mail, Phone, User, MapPin } from "lucide-react";

interface BookingRequest {
  _id: string;
  billboardId: {
    _id: string;
    name: string;
    location: string;
    size: string;
    imageUrl: string;
  };
  advertiserId: {
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
  responseMessage?: string;
  createdAt: string;
}

interface BookingRequestsModalProps {
  trigger?: React.ReactNode;
}

const BookingRequestsModal = ({ trigger }: BookingRequestsModalProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { bookingRequests: requests, loading, updateBookingStatus } = useBillboardBookingRequests();

  const handleApprove = async (requestId: string) => {
    try {
      const result = await updateBookingStatus(requestId, {
        status: 'APPROVED',
        responseMessage: 'Your booking request has been approved. You can now proceed with payment.'
      });

      if (result.success) {
        toast({
          title: "Booking Approved",
          description: "The booking request has been approved successfully.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve booking request",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const result = await updateBookingStatus(requestId, {
        status: 'REJECTED',
        responseMessage: 'Your booking request has been rejected. Please contact the owner for more information.'
      });

      if (result.success) {
        toast({
          title: "Booking Rejected",
          description: "The booking request has been rejected.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject booking request",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'REJECTED':
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
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <span>Booking Requests</span>
            {requests.filter(req => req.status === 'PENDING').length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {requests.filter(req => req.status === 'PENDING').length}
              </Badge>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Booking Requests</DialogTitle>
          <DialogDescription>
            Review and manage booking requests for your billboards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading booking requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No booking requests found.</p>
            </div>
          ) : (
            requests.map((request) => (
              <Card key={request._id} className="w-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{request.billboardId.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {request.billboardId.location}
                      </CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Advertiser:</span>
                        <span>{request.advertiserId.profile.firstName} {request.advertiserId.profile.lastName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Email:</span>
                        <span>{request.advertiserId.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Duration:</span>
                        <span>{calculateDuration(request.startDate, request.endDate)} days</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="font-medium">Start Date:</span>
                        <span className="ml-2">{formatDate(request.startDate)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">End Date:</span>
                        <span className="ml-2">{formatDate(request.endDate)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Total Amount:</span>
                        <span className="ml-2 font-semibold text-primary">GH₵{request.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {request.message && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Message:</span>
                        <span className="ml-2">{request.message}</span>
                      </p>
                    </div>
                  )}

                  {request.responseMessage && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Response:</span>
                        <span className="ml-2">{request.responseMessage}</span>
                      </p>
                    </div>
                  )}

                  {request.status === 'PENDING' && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request._id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(request._id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingRequestsModal;