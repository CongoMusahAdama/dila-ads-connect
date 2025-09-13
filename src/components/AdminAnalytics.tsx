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
      color: "text-blue-600",
      clickable: true,
      onClick: () => setShowUsersModal(true),
    },
    {
      title: "Total Billboards",
      value: stats?.totalBillboards || 0,
      icon: MapPin,
      color: "text-green-600",
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      title: "Pending Approvals",
      value: stats?.pendingBillboards || 0,
      icon: Clock,
      color: "text-secondary",
    },
    {
      title: "Pending Complaints",
      value: stats?.pendingComplaints || 0,
      icon: CheckCircle,
      color: "text-orange-600",
    },
    {
      title: "Pending Disputes",
      value: stats?.pendingDisputes || 0,
      icon: TrendingUp,
      color: "text-red-600",
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Badge variant="outline" className="text-sm">
          Real-time Data
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card 
              key={index} 
              className={`hover:shadow-md transition-shadow ${card.clickable ? 'cursor-pointer hover:bg-muted/50' : ''}`}
              onClick={card.clickable ? card.onClick : undefined}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.clickable && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Click to view details
                  </div>
                )}
              </CardContent>
            </Card>
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