
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, MapPin, DollarSign, Eye, ArrowLeft } from "lucide-react";
import { usePaystackPayment } from 'react-paystack';

interface Booking {
  id: string;
  billboard_id: string;
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
    size: string;
    image_url: string;
  } | null;
}

const BookingsList = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMyBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Fetching bookings for user:', user.id);
      const { data, error } = await supabase
        .from('booking_requests')
        .select(`
          *,
          billboards (name, location, size, image_url)
        `)
        .eq('advertiser_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }
      
      console.log('Fetched bookings:', data);
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error in fetchMyBookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyBookings();
    }
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Paid</Badge>;
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
      amount: Math.round(booking.total_amount * 100),
      publicKey: 'pk_live_a9e86ee55c4a014e1affce905ad59f11d9fe3bce',
      currency: 'GHS',
    };

    const initializePayment = usePaystackPayment(paystackConfig);
    
    const onPaymentSuccess = async (reference: any) => {
      try {
        await supabase
          .from('booking_requests')
          .update({ 
            status: 'paid',
            response_message: `Payment completed successfully. Reference: ${reference.reference}`
          })
          .eq('id', booking.id);

        toast({
          title: "Payment Successful!",
          description: `Your booking has been confirmed. Reference: ${reference.reference}`,
        });
        
        fetchMyBookings();
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
                {selectedBooking.billboards?.name || 'Billboard (Details Unavailable)'}
              </CardTitle>
              {getStatusBadge(selectedBooking.status)}
            </div>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {selectedBooking.billboards?.location || 'Location not available'} • {selectedBooking.billboards?.size || 'Size not available'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {selectedBooking.billboards?.image_url && (
                  <img
                    src={selectedBooking.billboards.image_url}
                    alt={selectedBooking.billboards.name || 'Billboard'}
                    className="w-full h-48 object-cover rounded border"
                  />
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Duration:</span>
                  <span>
                    {formatDate(selectedBooking.start_date)} - {formatDate(selectedBooking.end_date)}
                    ({calculateDuration(selectedBooking.start_date, selectedBooking.end_date)} days)
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-lg font-bold text-green-600">
                    GHS {selectedBooking.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="font-medium">Booking Date:</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {formatDate(selectedBooking.created_at)}
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
                
                {selectedBooking.response_message && (
                  <div>
                    <span className="font-medium">Owner Response:</span>
                    <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                      {selectedBooking.response_message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedBooking.status === 'approved' && (
              <div className="pt-4 border-t">
                <Button
                  onClick={() => handlePayment(selectedBooking)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Finalize & Pay - GHS {selectedBooking.total_amount.toLocaleString()}
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
            <Card key={booking.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedBooking(booking)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-2">
                    {booking.billboards?.name || 'Billboard (Details Unavailable)'}
                  </CardTitle>
                  {getStatusBadge(booking.status)}
                </div>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  {booking.billboards?.location || 'Location not available'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {booking.billboards?.image_url && (
                  <img
                    src={booking.billboards.image_url}
                    alt={booking.billboards.name || 'Billboard'}
                    className="w-full h-24 object-cover rounded mb-3"
                  />
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">
                      {calculateDuration(booking.start_date, booking.end_date)} days
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-bold text-green-600">
                      GHS {booking.total_amount.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Requested:</span>
                    <span>{formatDate(booking.created_at)}</span>
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
