
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import AdminAnalytics from '@/components/AdminAnalytics';
import AdminBillboardApprovals from '@/components/AdminBillboardApprovals';
import AdminDisputes from '@/components/AdminDisputes';
import AdminComplaints from '@/components/AdminComplaints';
import { apiClient } from '@/lib/api';

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const adminEmail = localStorage.getItem('adminEmail');
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminEmail || adminEmail !== 'dilads@gmail.com' || !adminToken) {
        navigate('/admin-login');
        return;
      }

      // Set the token in the API client
      apiClient.setToken(adminToken);
      
      // Verify the token is valid by making a test request
      try {
        await apiClient.getDashboardStats();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Admin token validation failed:', error);
        // Clear invalid token
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
        navigate('/admin-login');
        return;
      }
    } catch (error) {
      console.error('Admin auth check failed:', error);
      navigate('/admin-login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminToken');
    apiClient.setToken(null);
    navigate('/');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="font-bold text-primary-foreground text-sm">D</span>
            </div>
            <div>
              <span className="font-bold text-lg">DilaAds Admin</span>
              <span className="text-muted-foreground text-sm ml-2">Dashboard</span>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your billboard advertising platform
          </p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="approvals">
            <AdminBillboardApprovals />
          </TabsContent>

          <TabsContent value="disputes">
            <AdminDisputes />
          </TabsContent>

          <TabsContent value="complaints">
            <AdminComplaints />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
