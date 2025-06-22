
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, MapPin, Phone, Mail, User } from 'lucide-react';

interface Billboard {
  id: string;
  name: string;
  location: string;
  size: string;
  price_per_day: number;
  description: string;
  phone: string;
  email: string;
  image_url: string;
  created_at: string;
  owner_id: string;
  owner_profile: {
    first_name: string;
    last_name: string;
    role: string;
  } | null;
}

const AdminBillboardApprovals = () => {
  const [pendingBillboards, setPendingBillboards] = useState<Billboard[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingBillboards();
  }, []);

  const fetchPendingBillboards = async () => {
    try {
      // First get pending billboards
      const { data: billboardsData, error: billboardsError } = await supabase
        .from('billboards')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (billboardsError) throw billboardsError;

      // Then get profile data for each billboard
      const billboardsWithProfiles = await Promise.all(
        (billboardsData || []).map(async (billboard) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, role')
            .eq('user_id', billboard.owner_id)
            .single();

          return {
            ...billboard,
            owner_profile: profileData
          };
        })
      );

      setPendingBillboards(billboardsWithProfiles);
    } catch (error) {
      console.error('Error fetching pending billboards:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending billboards.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (billboardId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('billboards')
        .update({ 
          is_approved: approved,
          admin_approved_at: approved ? new Date().toISOString() : null
        })
        .eq('id', billboardId);

      if (error) throw error;

      setPendingBillboards(prev => 
        prev.filter(billboard => billboard.id !== billboardId)
      );

      toast({
        title: approved ? "Billboard Approved" : "Billboard Rejected",
        description: `Billboard has been ${approved ? 'approved' : 'rejected'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating billboard:', error);
      toast({
        title: "Error",
        description: "Failed to update billboard status.",
        variant: "destructive",
      });
    }
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Billboard Approvals</CardTitle>
          <p className="text-muted-foreground">
            Review and approve billboard listings from owners
          </p>
        </CardHeader>
      </Card>

      {pendingBillboards.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              No pending billboard approvals at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingBillboards.map((billboard) => (
            <Card key={billboard.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {billboard.image_url && (
                    <div className="lg:w-1/3">
                      <img
                        src={billboard.image_url}
                        alt={billboard.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {billboard.name}
                        </h3>
                        <Badge variant="secondary" className="mb-2">
                          Pending Approval
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          <span>{billboard.location}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Size:</span> {billboard.size}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Price:</span> GHS {billboard.price_per_day}/day
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4" />
                          <span className="font-medium">Owner:</span>
                          <span>{billboard.owner_profile?.first_name} {billboard.owner_profile?.last_name}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Role:</span> {billboard.owner_profile?.role || 'owner'}
                        </div>
                        {billboard.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4" />
                            <span>{billboard.phone}</span>
                          </div>
                        )}
                        {billboard.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4" />
                            <span>{billboard.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {billboard.description && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Description:</h4>
                        <p className="text-sm text-muted-foreground">
                          {billboard.description}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApproval(billboard.id, true)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleApproval(billboard.id, false)}
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBillboardApprovals;
