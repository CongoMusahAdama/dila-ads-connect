
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  MapPin,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface AnalyticsData {
  totalAdvertisers: number;
  totalOwners: number;
  totalBillboards: number;
  successfulBookings: number;
  pendingApprovals: number;
  totalBookings: number;
  averageBookingDuration: number;
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalAdvertisers: 0,
    totalOwners: 0,
    totalBillboards: 0,
    successfulBookings: 0,
    pendingApprovals: 0,
    totalBookings: 0,
    averageBookingDuration: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch user counts
      const { data: advertisers } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'advertiser');

      const { data: owners } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'owner');

      // Fetch billboard counts
      const { data: billboards } = await supabase
        .from('billboards')
        .select('id, is_approved');

      // Fetch booking data
      const { data: bookings } = await supabase
        .from('booking_requests')
        .select('id, status, start_date, end_date');

      // Calculate analytics
      const totalAdvertisers = advertisers?.length || 0;
      const totalOwners = owners?.length || 0;
      const totalBillboards = billboards?.length || 0;
      const pendingApprovals = billboards?.filter(b => !b.is_approved).length || 0;
      const totalBookings = bookings?.length || 0;
      const successfulBookings = bookings?.filter(b => b.status === 'accepted').length || 0;

      // Calculate average booking duration
      const acceptedBookings = bookings?.filter(b => b.status === 'accepted') || [];
      let averageBookingDuration = 0;
      if (acceptedBookings.length > 0) {
        const totalDuration = acceptedBookings.reduce((sum, booking) => {
          const start = new Date(booking.start_date);
          const end = new Date(booking.end_date);
          const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return sum + duration;
        }, 0);
        averageBookingDuration = Math.round(totalDuration / acceptedBookings.length);
      }

      setAnalytics({
        totalAdvertisers,
        totalOwners,
        totalBillboards,
        successfulBookings,
        pendingApprovals,
        totalBookings,
        averageBookingDuration,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyticsCards = [
    {
      title: "Total Advertisers",
      value: analytics.totalAdvertisers,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Billboard Owners",
      value: analytics.totalOwners,
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Total Billboards",
      value: analytics.totalBillboards,
      icon: MapPin,
      color: "text-purple-600",
    },
    {
      title: "Successful Bookings",
      value: analytics.successfulBookings,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      title: "Pending Approvals",
      value: analytics.pendingApprovals,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Total Bookings",
      value: analytics.totalBookings,
      icon: TrendingUp,
      color: "text-indigo-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  Real-time platform data
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Duration Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">
            {analytics.averageBookingDuration} days
          </div>
          <p className="text-sm text-muted-foreground">
            Average booking duration for accepted bookings
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Success Rate:</span>
              <Badge variant="secondary">
                {analytics.totalBookings > 0 
                  ? Math.round((analytics.successfulBookings / analytics.totalBookings) * 100)
                  : 0}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
