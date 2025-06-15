import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    
    console.log("Notification request received:", notificationData);

    let subject = "";
    let message = "";

    switch (notificationData.type) {
      case 'booking_request':
        subject = `New Booking Request for ${notificationData.billboardName}`;
        message = `Hello,\n\nYou have received a new booking request for your billboard "${notificationData.billboardName}" from ${notificationData.advertiserName}.\n\nPlease review and take action in your dashboard.\n\nBest regards,\nBillboard Platform Team`;
        break;
      
      case 'booking_accepted':
        subject = `Booking Request Accepted - ${notificationData.billboardName}`;
        message = `Hello,\n\nGreat news! Your booking request for "${notificationData.billboardName}" has been accepted by the owner.\n\nYou can now proceed to make payment in your dashboard to confirm your booking.\n\nBest regards,\nBillboard Platform Team`;
        break;
      
      case 'booking_rejected':
        subject = `Booking Request Declined - ${notificationData.billboardName}`;
        message = `Hello,\n\nWe regret to inform you that your booking request for "${notificationData.billboardName}" has been declined by the owner.\n\nPlease browse other available billboards that might suit your needs.\n\nBest regards,\nBillboard Platform Team`;
        break;
    }

    // Since we don't have email service configured yet, we'll log and return success
    // In production, you would integrate with Resend, SendGrid, or similar service
    console.log(`📧 Email notification prepared:`);
    console.log(`To: ${notificationData.recipientEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log(`---`);

    // Simulate successful email sending
    const emailResponse = {
      success: true,
      message: "Notification processed successfully",
      emailData: {
        to: notificationData.recipientEmail,
        subject,
        message,
        timestamp: new Date().toISOString()
      }
    };

    return new Response(
      JSON.stringify(emailResponse),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("❌ Error processing notification:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process notification",
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});