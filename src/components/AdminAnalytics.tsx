import React, { useState } from 'react';
import { useAdminDashboard, useAdminUsers } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Users,
  MapPin,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  User,
  Mail,
  Phone,
  Shield,
  RefreshCw
} from 'lucide-react';

const AdminAnalytics = () => {
  const { stats, loading, refetch } = useAdminDashboard();
  const [showUsersModal, setShowUsersModal] = useState(false);
  const { users, loading: usersLoading, refetch: refetchUsers } = useAdminUsers({ limit: 50 });

  const analyticsCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      accent: "bg-emerald-400",
      description: "Platform members",
      footerAction: () => setShowUsersModal(true),
      footerLabel: "View users",
      pattern: "radial-gradient(circle at top right, rgba(255,255,255,0.45), transparent 55%), radial-gradient(circle at bottom left, rgba(255,255,255,0.25), transparent 55%)"
    },
    {
      title: "Total Billboards",
      value: stats?.totalBillboards || 0,
      icon: MapPin,
      accent: "bg-amber-400",
      description: "Listings in marketplace",
      pattern: "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.45), transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.25), transparent 55%)"
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: Calendar,
      accent: "bg-purple-500",
      description: "Lifetime bookings",
      pattern: "radial-gradient(circle at top left, rgba(255,255,255,0.4), transparent 55%), radial-gradient(circle at bottom right, rgba(255,255,255,0.3), transparent 60%)"
    },
    {
      title: "Pending Approvals",
      value: stats?.pendingBillboards || 0,
      icon: Clock,
      accent: "bg-sky-400",
      description: "Billboards awaiting approval",
      pattern: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.45), transparent 50%), radial-gradient(circle at 75% 80%, rgba(255,255,255,0.3), transparent 60%)"
    },
    {
      title: "Pending Complaints",
      value: stats?.pendingComplaints || 0,
      icon: CheckCircle,
      accent: "bg-rose-400",
      description: "Customer feedback queue",
      pattern: "radial-gradient(circle at top right, rgba(255,255,255,0.5), transparent 55%), radial-gradient(circle at bottom left, rgba(255,255,255,0.25), transparent 60%)"
    },
    {
      title: "Pending Disputes",
      value: stats?.pendingDisputes || 0,
      icon: TrendingUp,
      accent: "bg-blue-500",
      description: "Bookings under review",
      pattern: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.45), transparent 55%), radial-gradient(circle at 80% 75%, rgba(255,255,255,0.25), transparent 60%)"
    },
  ];

  if (loading) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Keep track of platform growth and operational workload.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {analyticsCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <button
              key={index}
              type="button"
              onClick={card.footerAction}
              className={`${card.accent} relative overflow-hidden rounded-2xl text-left text-white p-6 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white/30 ${card.footerAction ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ backgroundImage: card.pattern }}
            >
              <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-soft-light bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.6),transparent_70%)]" />
              <div className="relative z-10">
                <div className="flex items-center justify-between text-sm font-medium opacity-90">
                  <span>{card.title}</span>
                  <IconComponent className="h-5 w-5 opacity-90" />
                </div>
                <div className="mt-6 text-4xl font-extrabold">
                  {card.value}
                </div>
                {card.description && (
                  <p className="mt-3 text-sm text-white/80">
                    {card.description}
                  </p>
                )}
                {card.footerAction && (
                  <span className="mt-6 inline-flex items-center text-sm font-semibold text-white hover:text-white/90">
                    {card.footerLabel}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent Bookings */}
      {stats?.recentBookings && stats.recentBookings.length > 0 && (
      <Card>
        <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              {stats.recentBookings.slice(0, 5).map((booking: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{booking.billboard?.name || 'Unknown Billboard'}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.advertiser?.profile?.firstName} {booking.advertiser?.profile?.lastName}
                      </p>
                    </div>
          </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">GH₵ {booking.totalAmount}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Users Modal */}
      <Dialog open={showUsersModal} onOpenChange={setShowUsersModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Users ({users.length})</DialogTitle>
          </DialogHeader>
          
          {usersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user._id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">
                            {user.profile?.firstName} {user.profile?.lastName}
                          </h3>
                          <Badge 
                            variant={
                              user.profile?.role === 'ADMIN' ? 'destructive' :
                              user.profile?.role === 'OWNER' ? 'default' : 'secondary'
                            }
                            className="flex items-center space-x-1"
                          >
                            <Shield className="h-3 w-3" />
                            <span>{user.profile?.role || 'No Role'}</span>
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                          {user.profile?.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{user.profile.phone}</span>
                            </div>
                          )}
                          <div className="text-xs">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>ID: {user._id.slice(-8)}</div>
                      <div className="text-xs">
                        {user.isVerified ? (
                          <span className="text-green-600">Verified</span>
                        ) : (
                          <span className="text-orange-600">Unverified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAnalytics;