
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  User
} from 'lucide-react';

interface Billboard {
  id: string;
  name: string;
  location: string;
  size: string;
  price_per_day: number;
  phone?: string;
  email?: string;
  image_url?: string;
}

interface BookingRequest {
  id: string;
  billboard_id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
  message?: string;
  response_message?: string;
  has_dispute: boolean;
  dispute_reason?: string;
  dispute_status?: string;
  created_at: string;
  billboard: Billboard;
}

const BookingsList = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [disputeReasons, setDisputeReasons] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const { data: bookingsData, error } = await supabase
        .from('booking_requests')
        .select(`
          *,
          billboard:billboards(
            id,
            name,
            location,
            size,
            price_per_day,
            phone,
            email,
            image_url
          )
        `)
        .eq('advertiser_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(bookingsData || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your bookings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseDispute = async (bookingId: string) => {
    const reason = disputeReasons[bookingId];
    
    if (!reason?.trim()) {
      toast({
        title: "Dispute Reason Required",
        description: "Please provide a reason for the dispute.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('booking_requests')
        .update({ 
          has_dispute: true,
          dispute_reason: reason,
          dispute_status: 'pending'
        })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, has_dispute: true, dispute_reason: reason, dispute_status: 'pending' }
            : booking
        )
      );

      setDisputeReasons(prev => {
        const updated = { ...prev };
        delete updated[bookingId];
        return updated;
      });

      toast({
        title: "Dispute Raised",
        description: "Your dispute has been submitted for admin review.",
      });
    } catch (error: any) {
      console.error('Error raising dispute:', error);
      toast({
        title: "Error",
        description: "Failed to raise dispute.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDisputeStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Pending Review</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
          <p className="text-muted-foreground">
            You haven't made any booking requests yet. Start exploring billboards to make your first booking!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Bookings</h2>
        <Badge variant="outline" className="text-sm">
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Billboard Image */}
                {booking.billboard?.image_url && (
                  <div className="lg:w-1/3">
                    <img
                      src={booking.billboard.image_url}
                      alt={booking.billboard.name}
                      className="w-full h-48 lg:h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Booking Details */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {booking.billboard?.name || 'Billboard Details Unavailable'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.billboard?.location || 'Location unavailable'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{calculateDuration(booking.start_date, booking.end_date)} days</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {getStatusBadge(booking.status)}
                      {booking.has_dispute && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          {getDisputeStatusBadge(booking.dispute_status || 'pending')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Start Date:</span> {new Date(booking.start_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">End Date:</span> {new Date(booking.end_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Size:</span> {booking.billboard?.size || 'Not specified'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                        <DollarSign className="w-5 h-5" />
                        <span>GHS {Number(booking.total_amount).toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total amount for {calculateDuration(booking.start_date, booking.end_date)} days
                      </div>
                    </div>
                  </div>

                  {/* Contact Information (only for approved bookings) */}
                  {booking.status === 'accepted' && booking.billboard && (
                    <div className="bg-green-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Billboard Owner Contact
                      </h4>
                      <div className="space-y-1 text-sm text-green-700">
                        {booking.billboard.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            <span>{booking.billboard.phone}</span>
                          </div>
                        )}
                        {booking.billboard.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            <span>{booking.billboard.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  {booking.message && (
                    <div className="bg-blue-50 p-3 rounded mb-3">
                      <h4 className="font-medium text-blue-800 mb-1">Your Message:</h4>
                      <p className="text-sm text-blue-700">{booking.message}</p>
                    </div>
                  )}

                  {booking.response_message && (
                    <div className="bg-purple-50 p-3 rounded mb-3">
                      <h4 className="font-medium text-purple-800 mb-1">Owner's Response:</h4>
                      <p className="text-sm text-purple-700">{booking.response_message}</p>
                    </div>
                  )}

                  {/* Dispute Section */}
                  {booking.has_dispute && booking.dispute_reason && (
                    <div className="bg-orange-50 p-3 rounded mb-3">
                      <h4 className="font-medium text-orange-800 mb-1">Dispute Reason:</h4>
                      <p className="text-sm text-orange-700">{booking.dispute_reason}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {booking.status === 'accepted' && !booking.has_dispute && (
                    <div className="space-y-3 pt-3 border-t">
                      <div>
                        <label className="text-sm font-medium text-red-700">
                          Raise a Dispute (if there's an issue):
                        </label>
                        <Textarea
                          placeholder="Describe the issue with this booking..."
                          value={disputeReasons[booking.id] || ''}
                          onChange={(e) => setDisputeReasons(prev => ({
                            ...prev,
                            [booking.id]: e.target.value
                          }))}
                          className="mt-2"
                        />
                      </div>
                      <Button
                        onClick={() => handleRaiseDispute(booking.id)}
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Raise Dispute
                      </Button>
                    </div>
                  )}

                  <div className="pt-3 border-t text-xs text-muted-foreground">
                    Booking requested on {new Date(booking.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BookingsList;
