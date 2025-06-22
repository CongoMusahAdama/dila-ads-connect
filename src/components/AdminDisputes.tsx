
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, MessageSquare, Calendar } from 'lucide-react';

interface Dispute {
  id: string;
  billboard_id: string;
  advertiser_id: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  dispute_reason: string;
  dispute_status: string;
  created_at: string;
  billboards: {
    name: string;
    location: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
  };
}

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolutions, setResolutions] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from('booking_requests')
        .select(`
          *,
          billboards:billboard_id (
            name,
            location
          ),
          profiles:advertiser_id (
            first_name,
            last_name
          )
        `)
        .eq('has_dispute', true)
        .eq('dispute_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch disputes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (disputeId: string, resolution: 'resolved' | 'escalated') => {
    const resolutionNote = resolutions[disputeId];
    
    if (!resolutionNote) {
      toast({
        title: "Resolution Required",
        description: "Please provide a resolution note.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('booking_requests')
        .update({ 
          dispute_status: resolution,
          response_message: resolutionNote
        })
        .eq('id', disputeId);

      if (error) throw error;

      setDisputes(prev => prev.filter(dispute => dispute.id !== disputeId));
      setResolutions(prev => {
        const updated = { ...prev };
        delete updated[disputeId];
        return updated;
      });

      toast({
        title: "Dispute Resolved",
        description: `Dispute has been marked as ${resolution}.`,
      });
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast({
        title: "Error",
        description: "Failed to resolve dispute.",
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
          <CardTitle>Dispute Resolution</CardTitle>
          <p className="text-muted-foreground">
            Manage disputes between advertisers and billboard owners
          </p>
        </CardHeader>
      </Card>

      {disputes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Disputes</h3>
            <p className="text-muted-foreground">
              All disputes have been resolved. Great job!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <Card key={dispute.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Dispute: {dispute.billboards?.name}
                    </h3>
                    <Badge variant="destructive" className="mb-2">
                      Active Dispute
                    </Badge>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(dispute.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Billboard:</span> {dispute.billboards?.name}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Location:</span> {dispute.billboards?.location}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Advertiser:</span> {dispute.profiles?.first_name} {dispute.profiles?.last_name}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Booking Period:</span> {new Date(dispute.start_date).toLocaleDateString()} - {new Date(dispute.end_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Amount:</span> GHS {dispute.total_amount}
                    </div>
                  </div>
                </div>

                {dispute.dispute_reason && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Dispute Reason:
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {dispute.dispute_reason}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Resolution Note:</label>
                    <Textarea
                      placeholder="Provide details about how this dispute was resolved..."
                      value={resolutions[dispute.id] || ''}
                      onChange={(e) => setResolutions(prev => ({
                        ...prev,
                        [dispute.id]: e.target.value
                      }))}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleResolveDispute(dispute.id, 'resolved')}
                      className="flex items-center gap-2"
                    >
                      Mark as Resolved
                    </Button>
                    <Button
                      onClick={() => handleResolveDispute(dispute.id, 'escalated')}
                      variant="outline"
                    >
                      Escalate
                    </Button>
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

export default AdminDisputes;
