
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, MapPin, DollarSign, Eye, ArrowLeft } from "lucide-react";
import { usePaystackPayment } from 'react-paystack';
import { useMyBookingRequests } from '@/hooks/useBookings';
import { getBillboardImageUrl } from '@/utils/imageUtils';
import { apiClient } from '@/lib/api';

interface Booking {
  _id: string;
  billboardId: {
    _id: string;
    name: string;
    location: string;
    imageUrl?: string;
    size?: string;
    pricePerDay?: number;
    ownerId: {
      _id: string;
      email: string;
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  };
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  message?: string;
  responseMessage?: string;
  createdAt: string;
}

const BookingsList = () => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { bookingRequests: bookings, loading, refetch } = useMyBookingRequests();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
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

  const handlePayment = (booking: Booking) => {
    const paystackConfig = {
      reference: new Date().getTime().toString(),
      email: user?.email || '',
      amount: Math.round(booking.totalAmount * 100),
      publicKey: 'pk_live_a9e86ee55c4a014e1affce905ad59f11d9fe3bce',
      currency: 'GHS',
    };

    const initializePayment = usePaystackPayment(paystackConfig);
    
    const onPaymentSuccess = async (reference: any) => {
      try {
        // Update booking with payment confirmation
        await apiClient.updateBookingStatus(booking._id, { 
          status: 'APPROVED', // Keep as APPROVED but update response message
          responseMessage: `Payment completed successfully. Reference: ${reference.reference}. Your booking is now confirmed.`
        });

        toast({
          title: "Payment Successful!",
          description: `Your booking has been confirmed. Reference: ${reference.reference}`,
        });
        
        refetch();
      } catch (error) {
        console.error('Error updating booking status:', error);
        toast({
          title: "Payment Successful",
          description: "Your payment was processed but there was an issue updating the status. Please contact support.",
          variant: "destructive",
        });
      }
    };

    const onPaymentClose = () => {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again anytime.",
      });
    };

    initializePayment({
      onSuccess: onPaymentSuccess,
      onClose: onPaymentClose
    });
  };

  if (selectedBooking) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setSelectedBooking(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bookings
          </Button>
          <h2 className="text-xl font-semibold">Booking Details</h2>
        </div>

        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {selectedBooking.billboardId?.name || 'Billboard (Details Unavailable)'}
              </CardTitle>
              {getStatusBadge(selectedBooking.status)}
            </div>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {selectedBooking.billboardId?.location || 'Location not available'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <img
                  src={selectedBooking.billboardId.imageUrl ? getBillboardImageUrl({ imageUrl: selectedBooking.billboardId.imageUrl }) : "/placeholder.svg"}
                  alt={selectedBooking.billboardId.name || 'Billboard'}
                  className="w-full h-48 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Duration:</span>
                  <span>
                    {formatDate(selectedBooking.startDate)} - {formatDate(selectedBooking.endDate)}
                    ({calculateDuration(selectedBooking.startDate, selectedBooking.endDate)} days)
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-lg font-bold text-green-600">
                    GHS {selectedBooking.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="font-medium">Booking Date:</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {formatDate(selectedBooking.createdAt)}
                  </span>
                </div>
                
                {selectedBooking.message && (
                  <div>
                    <span className="font-medium">Your Message:</span>
                    <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                      {selectedBooking.message}
                    </p>
                  </div>
                )}
                
                {selectedBooking.responseMessage && (
                  <div>
                    <span className="font-medium">Owner Response:</span>
                    <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                      {selectedBooking.responseMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedBooking.status === 'APPROVED' && (
              <div className="pt-4 border-t">
                <Button
                  onClick={() => handlePayment(selectedBooking)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Finalize & Pay - GHS {selectedBooking.totalAmount.toLocaleString()}
                </Button>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Your booking request has been approved. Complete payment to confirm your booking.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Bookings</h2>
        <Badge variant="secondary" className="text-sm">
          {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
        </Badge>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-1"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground text-lg mb-2">No bookings found</p>
            <p className="text-sm text-muted-foreground">Start booking billboards to see them here!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <Card key={booking._id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedBooking(booking)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-2">
                    {booking.billboardId?.name || 'Billboard (Details Unavailable)'}
                  </CardTitle>
                  {getStatusBadge(booking.status)}
                </div>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  {booking.billboardId?.location || 'Location not available'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <img
                  src={booking.billboardId.imageUrl ? getBillboardImageUrl({ imageUrl: booking.billboardId.imageUrl }) : "/placeholder.svg"}
                  alt={booking.billboardId.name || 'Billboard'}
                  className="w-full h-24 object-cover rounded mb-3"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">
                      {calculateDuration(booking.startDate, booking.endDate)} days
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-bold text-green-600">
                      GHS {booking.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Requested:</span>
                    <span>{formatDate(booking.createdAt)}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full mt-3 flex items-center gap-2">
                  <Eye className="h-3 w-3" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsList;
