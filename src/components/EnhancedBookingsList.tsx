
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, MapPin, DollarSign, Eye, ArrowLeft, Phone, Mail } from "lucide-react";
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
    phone: string | null;
    email: string | null;
  } | null;
}

interface EnhancedBookingsListProps {
  isModal?: boolean;
}

const EnhancedBookingsList = ({ isModal = false }: EnhancedBookingsListProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMyBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('booking_requests')
        .select(`
          *,
          billboards (name, location, size, image_url, phone, email)
        `)
        .eq('advertiser_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setBookings(data || []);
    } catch (error: any) {
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
    const statusConfig = {
      pending: { variant: "outline" as const, className: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Pending" },
      approved: { variant: "outline" as const, className: "bg-green-50 text-green-700 border-green-200", label: "Approved" },
      rejected: { variant: "outline" as const, className: "bg-red-50 text-red-700 border-red-200", label: "Rejected" },
      paid: { variant: "outline" as const, className: "bg-blue-50 text-blue-700 border-blue-200", label: "Paid" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "outline" as const, className: "", label: status };
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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
        setSelectedBooking(null);
      } catch (error) {
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
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
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {selectedBooking.billboards?.image_url && (
                  <img
                    src={selectedBooking.billboards.image_url}
                    alt={selectedBooking.billboards.name || 'Billboard'}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Duration:</span>
                  </div>
                  <div className="pl-6 text-sm">
                    <div>{formatDate(selectedBooking.start_date)} - {formatDate(selectedBooking.end_date)}</div>
                    <div className="text-muted-foreground">({calculateDuration(selectedBooking.start_date, selectedBooking.end_date)} days)</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-lg font-bold text-green-600">
                      GHS {selectedBooking.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="font-medium">Booking Date:</span>
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatDate(selectedBooking.created_at)}
                  </div>
                </div>

                {(selectedBooking.status === 'approved' || selectedBooking.status === 'paid') && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Contact Information:</h4>
                    <div className="space-y-1 text-sm">
                      {selectedBooking.billboards?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{selectedBooking.billboards.phone}</span>
                        </div>
                      )}
                      {selectedBooking.billboards?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span>{selectedBooking.billboards.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedBooking.message && (
                  <div>
                    <span className="font-medium">Your Message:</span>
                    <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-lg">
                      {selectedBooking.message}
                    </p>
                  </div>
                )}
                
                {selectedBooking.response_message && (
                  <div>
                    <span className="font-medium">Owner Response:</span>
                    <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-lg">
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
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  Proceed to Payment - GHS {selectedBooking.total_amount.toLocaleString()}
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
                <div className="h-32 bg-muted rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
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
        <div className="space-y-4">
          {/* Summary Table View */}
          <div className="hidden md:block">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 font-medium">Billboard Name</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Request Date</th>
                        <th className="pb-2 font-medium">Total Amount</th>
                        <th className="pb-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b hover:bg-muted/50">
                          <td className="py-3">
                            <div className="font-medium">
                              {booking.billboards?.name || 'Billboard (Details Unavailable)'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.billboards?.location}
                            </div>
                          </td>
                          <td className="py-3">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="py-3 text-sm">
                            {formatDate(booking.created_at)}
                          </td>
                          <td className="py-3 font-medium text-green-600">
                            GHS {booking.total_amount.toLocaleString()}
                          </td>
                          <td className="py-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card View for Mobile */}
          <div className="md:hidden grid gap-4">
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
                  <div className="space-y-2 text-sm">
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
        </div>
      )}
    </div>
  );
};

export default EnhancedBookingsList;
