import React, { useState } from 'react';
import { useAdminComplaints } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Calendar, User, Send } from 'lucide-react';

const AdminComplaints = () => {
  const { complaints, loading, updateComplaint } = useAdminComplaints();
  const [responses, setResponses] = useState<{[key: string]: string}>({});
  const [statuses, setStatuses] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  const handleResponse = async (complaintId: string) => {
    const response = responses[complaintId];
    const status = statuses[complaintId] || 'IN_PROGRESS';
    
    if (!response && status === 'IN_PROGRESS') {
      toast({
        title: "Error",
        description: "Please provide a response or select a different status",
        variant: "destructive",
      });
      return;
    }

    const result = await updateComplaint(complaintId, {
      status: status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
      adminResponse: response
    });

    if (result.success) {
      toast({
        title: "Success",
        description: "Complaint updated successfully",
      });
      // Clear the response and status for this complaint
      setResponses(prev => ({ ...prev, [complaintId]: '' }));
      setStatuses(prev => ({ ...prev, [complaintId]: '' }));
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update complaint",
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
        <h2 className="text-2xl font-bold">Complaint Management</h2>
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

  if (complaints.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Complaint Management</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Complaints</h3>
            <p className="text-muted-foreground text-center">
              There are no complaints to review at the moment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Complaint Management</h2>
        <Badge variant="outline">
          {complaints.length} Total
        </Badge>
      </div>
      
      <div className="space-y-4">
        {complaints.map((complaint) => (
          <Card key={complaint._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{complaint.subject}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <User className="h-4 w-4 mr-1" />
                    <span>
                      {complaint.advertiserId?.profile?.firstName} {complaint.advertiserId?.profile?.lastName}
                    </span>
                    <span className="mx-2">•</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge className={getStatusColor(complaint.status)}>
                  {complaint.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description:</h4>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                  {complaint.description}
                </p>
              </div>

              {complaint.adminResponse && (
                <div>
                  <h4 className="font-medium mb-2">Admin Response:</h4>
                  <p className="text-sm bg-blue-50 p-3 rounded">
                    {complaint.adminResponse}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Status:</label>
                  <Select
                    value={statuses[complaint._id] || complaint.status}
                    onValueChange={(value) => setStatuses(prev => ({ ...prev, [complaint._id]: value }))}
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

                <div>
                  <label className="text-sm font-medium">Response:</label>
                  <Textarea
                    placeholder="Enter your response..."
                    value={responses[complaint._id] || ''}
                    onChange={(e) => setResponses(prev => ({ ...prev, [complaint._id]: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={() => handleResponse(complaint._id)}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Update Complaint
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminComplaints;