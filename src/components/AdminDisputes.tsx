import React, { useState } from 'react';
import { useAdminDisputes } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, MessageSquare, Calendar, User, MapPin } from 'lucide-react';

const AdminDisputes = () => {
  const { disputes, loading, updateDispute } = useAdminDisputes();
  const [statuses, setStatuses] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  const handleStatusUpdate = async (disputeId: string) => {
    const status = statuses[disputeId];
    
    if (!status) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    const result = await updateDispute(disputeId, {
      disputeStatus: status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
    });

    if (result.success) {
      toast({
        title: "Success",
        description: "Dispute status updated successfully",
      });
      // Clear the status for this dispute
      setStatuses(prev => ({ ...prev, [disputeId]: '' }));
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update dispute",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Dispute Management</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 w-full bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Dispute Management</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Disputes</h3>
            <p className="text-muted-foreground text-center">
              There are no disputes to review at the moment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dispute Management</h2>
        <Badge variant="outline">
          {disputes.length} Total
        </Badge>
      </div>
      
      <div className="space-y-4">
        {disputes.map((dispute) => (
          <Card key={dispute._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">Booking Dispute</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{dispute.billboardId?.name} - {dispute.billboardId?.location}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {new Date(dispute.startDate).toLocaleDateString()} - {new Date(dispute.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Badge className={getStatusColor(dispute.disputeStatus || 'OPEN')}>
                  {dispute.disputeStatus?.replace('_', ' ') || 'OPEN'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Billboard Owner:
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {dispute.billboardId?.ownerId?.profile?.firstName} {dispute.billboardId?.ownerId?.profile?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{dispute.billboardId?.ownerId?.email}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Advertiser:
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {dispute.advertiserId?.profile?.firstName} {dispute.advertiserId?.profile?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{dispute.advertiserId?.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Dispute Details:</h4>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                  <strong>Reason:</strong> {dispute.disputeReason || 'No reason provided'}
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span><strong>Amount:</strong> GH₵ {dispute.totalAmount}</span>
                  <span><strong>Created:</strong> {new Date(dispute.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Update Status:</label>
                  <Select
                    value={statuses[dispute._id] || dispute.disputeStatus || 'OPEN'}
                    onValueChange={(value) => setStatuses(prev => ({ ...prev, [dispute._id]: value }))}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => handleStatusUpdate(dispute._id)}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Update Dispute Status
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDisputes;