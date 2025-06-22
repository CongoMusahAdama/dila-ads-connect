
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Calendar, User, Mail } from 'lucide-react';

interface Complaint {
  id: string;
  advertiser_id: string;
  subject: string;
  description: string;
  status: string;
  admin_response: string;
  created_at: string;
  updated_at: string;
  advertiser_profile: {
    first_name: string;
    last_name: string;
    user_id: string;
  } | null;
  advertiser_email?: string;
}

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      // Get complaints with profile data
      const { data: complaintsData, error: complaintsError } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (complaintsError) throw complaintsError;

      // Get profile and auth data for each complaint
      const complaintsWithProfiles = await Promise.all(
        (complaintsData || []).map(async (complaint) => {
          // Get profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, user_id')
            .eq('user_id', complaint.advertiser_id)
            .single();

          // Get email from auth.users if available (this might not work due to RLS)
          let advertiserEmail = '';
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.id === complaint.advertiser_id) {
              advertiserEmail = user.email || '';
            }
          } catch (error) {
            console.log('Could not fetch user email:', error);
          }

          return {
            ...complaint,
            advertiser_profile: profileData,
            advertiser_email: advertiserEmail
          };
        })
      );

      setComplaints(complaintsWithProfiles);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast({
        title: "Error",
        description: "Failed to fetch complaints.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToComplaint = async (complaintId: string) => {
    const response = responses[complaintId];
    
    if (!response) {
      toast({
        title: "Response Required",
        description: "Please provide a response to the complaint.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('complaints')
        .update({ 
          admin_response: response,
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId);

      if (error) throw error;

      setComplaints(prev => 
        prev.map(complaint => 
          complaint.id === complaintId 
            ? { ...complaint, admin_response: response, status: 'resolved' }
            : complaint
        )
      );

      setResponses(prev => {
        const updated = { ...prev };
        delete updated[complaintId];
        return updated;
      });

      toast({
        title: "Response Sent",
        description: "Your response has been sent to the advertiser.",
      });
    } catch (error) {
      console.error('Error responding to complaint:', error);
      toast({
        title: "Error",
        description: "Failed to send response.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
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
          <CardTitle>Advertiser Complaints</CardTitle>
          <p className="text-muted-foreground">
            Review and respond to complaints from advertisers ({complaints.length} total)
          </p>
        </CardHeader>
      </Card>

      {complaints.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Complaints</h3>
            <p className="text-muted-foreground">
              No complaints have been submitted yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <Card key={complaint.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {complaint.subject}
                    </h3>
                    <Badge 
                      variant={complaint.status === 'resolved' ? 'default' : 'secondary'}
                      className="mb-2"
                    >
                      {complaint.status === 'resolved' ? 'Resolved' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <User className="h-4 w-4" />
                      {complaint.advertiser_profile?.first_name || 'Unknown'} {complaint.advertiser_profile?.last_name || ''}
                    </div>
                    {complaint.advertiser_email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {complaint.advertiser_email}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Complaint Description:</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {complaint.description}
                  </p>
                </div>

                {complaint.admin_response && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Admin Response:</h4>
                    <p className="text-sm bg-blue-50 text-blue-900 p-3 rounded">
                      {complaint.admin_response}
                    </p>
                  </div>
                )}

                {complaint.status === 'pending' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Your Response:</label>
                      <Textarea
                        placeholder="Provide a response to this complaint..."
                        value={responses[complaint.id] || ''}
                        onChange={(e) => setResponses(prev => ({
                          ...prev,
                          [complaint.id]: e.target.value
                        }))}
                        className="mt-2"
                      />
                    </div>
                    <Button
                      onClick={() => handleRespondToComplaint(complaint.id)}
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Send Response
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
