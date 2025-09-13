import React from 'react';
import { useAdminBillboards } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, MapPin, Phone, Mail, User } from 'lucide-react';
import { getBillboardImageUrl } from '@/utils/imageUtils';

const AdminBillboardApprovals = () => {
  const { billboards, loading, updateBillboardApproval } = useAdminBillboards();
  const { toast } = useToast();

  const handleApproval = async (id: string, isApproved: boolean) => {
    const result = await updateBillboardApproval(id, { isApproved });
    
    if (result.success) {
      toast({
        title: "Success",
        description: `Billboard ${isApproved ? 'approved' : 'rejected'} successfully.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update billboard approval",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Billboard Approvals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-full bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (billboards.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Billboard Approvals</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground text-center">
              There are no pending billboard approvals at the moment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Billboard Approvals</h2>
        <Badge variant="outline">
          {billboards.length} Pending
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {billboards.map((billboard) => (
          <Card key={billboard._id} className="overflow-hidden">
            <div className="relative">
              <img
                src={getBillboardImageUrl(billboard)}
                alt={billboard.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <Badge className="absolute top-3 left-3 bg-yellow-500">
                Pending Approval
              </Badge>
            </div>
            
            <CardHeader>
              <CardTitle className="text-lg">{billboard.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {billboard.location}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {billboard.ownerId?.profile?.firstName} {billboard.ownerId?.profile?.lastName}
                  </span>
                </div>
                
                {billboard.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{billboard.phone}</span>
                  </div>
                )}
                
                {billboard.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{billboard.email}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Size:</span> {billboard.size}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Price:</span> GH₵ {billboard.pricePerDay}/day
                </p>
                {billboard.description && (
                  <p className="text-sm text-muted-foreground">
                    {billboard.description}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApproval(billboard._id, true)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleApproval(billboard._id, false)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBillboardApprovals;