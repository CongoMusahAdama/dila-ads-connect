
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  MapPin,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  avatar_url?: string;
}

interface AnalyticsData {
  totalAdvertisers: number;
  totalOwners: number;
  totalBillboards: number;
  approvedBillboards: number;
  successfulBookings: number;
  pendingBookings: number;
  rejectedBookings: number;
  totalBookings: number;
  averageBookingDuration: number;
  totalRevenue: number;
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalAdvertisers: 0,
    totalOwners: 0,
    totalBillboards: 0,
    approvedBillboards: 0,
    successfulBookings: 0,
    pendingBookings: 0,
    rejectedBookings: 0,
    totalBookings: 0,
    averageBookingDuration: 0,
    totalRevenue: 0,
  });
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchRecentUsers();
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

      const { data: approvedBillboards } = await supabase
        .from('billboards')
        .select('id')
        .eq('is_approved', true);

      // Fetch booking data
      const { data: bookings } = await supabase
        .from('booking_requests')
        .select('id, status, start_date, end_date, total_amount');

      // Calculate analytics
      const totalAdvertisers = advertisers?.length || 0;
      const totalOwners = owners?.length || 0;
      const totalBillboards = billboards?.length || 0;
      const approvedBillboardsCount = approvedBillboards?.length || 0;
      const totalBookings = bookings?.length || 0;
      const successfulBookings = bookings?.filter(b => b.status === 'accepted').length || 0;
      const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
      const rejectedBookings = bookings?.filter(b => b.status === 'rejected').length || 0;

      // Calculate revenue from accepted bookings
      const totalRevenue = bookings
        ?.filter(b => b.status === 'accepted')
        .reduce((sum, booking) => sum + (parseFloat(booking.total_amount) || 0), 0) || 0;

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
        approvedBillboards: approvedBillboardsCount,
        successfulBookings,
        pendingBookings,
        rejectedBookings,
        totalBookings,
        averageBookingDuration,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role, created_at, avatar_url')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentUsers(data || []);
    } catch (error) {
      console.error('Error fetching recent users:', error);
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
      title: "Approved Billboards",
      value: analytics.approvedBillboards,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      title: "Successful Bookings",
      value: analytics.successfulBookings,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Pending Bookings",
      value: analytics.pendingBookings,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Total Revenue",
      value: `GHS ${analytics.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-700",
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Duration Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold mb-2">
                  {analytics.averageBookingDuration} days
                </div>
                <p className="text-sm text-muted-foreground">
                  Average booking duration
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Success Rate:</span>
                  <Badge variant="secondary">
                    {analytics.totalBookings > 0 
                      ? Math.round((analytics.successfulBookings / analytics.totalBookings) * 100)
                      : 0}%
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pending:</span>
                  <span>{analytics.pendingBookings}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rejected:</span>
                  <span>{analytics.rejectedBookings}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No users registered yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
