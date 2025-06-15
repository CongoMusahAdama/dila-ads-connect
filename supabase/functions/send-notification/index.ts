import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'booking_request' | 'booking_accepted' | 'booking_rejected';
  recipientEmail: string;
  billboardName: string;
  advertiserName?: string;
  ownerName?: string;
  startDate?: string;
  endDate?: string;
  totalAmount?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notificationData: NotificationRequest = await req.json();
    
    // Here you would integrate with your email service (like Resend, SendGrid, etc.)
    // For now, we'll log the notification and return success
    console.log("Notification to send:", notificationData);

    let subject = "";
    let message = "";

    switch (notificationData.type) {
      case 'booking_request':
        subject = `New Booking Request for ${notificationData.billboardName}`;
        message = `You have received a new booking request for your billboard "${notificationData.billboardName}" from ${notificationData.advertiserName}. Please review and take action in your dashboard.`;
        break;
      
      case 'booking_accepted':
        subject = `Booking Request Accepted - ${notificationData.billboardName}`;
        message = `Great news! Your booking request for "${notificationData.billboardName}" has been accepted by the owner. You can now proceed to make payment in your dashboard.`;
        break;
      
      case 'booking_rejected':
        subject = `Booking Request Declined - ${notificationData.billboardName}`;
        message = `Unfortunately, your booking request for "${notificationData.billboardName}" has been declined by the owner. Please browse other available billboards.`;
        break;
    }

    // In a real implementation, you would send an actual email here
    // For now, we'll simulate success
    console.log(`Email would be sent to: ${notificationData.recipientEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification sent successfully",
        emailData: {
          to: notificationData.recipientEmail,
          subject,
          message
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send notification" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});