import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import { usePaystackPayment } from 'react-paystack';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  billboard: any;
}

const BookingModal = ({ isOpen, onClose, billboard }: BookingModalProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  if (!billboard) return null;

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const pricePerDay = billboard.price_per_day || billboard.price || 0;
    return days * pricePerDay;
  };

  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: user?.email || '',
    amount: Math.round(calculateTotal() * 100), // Convert to kobo (GHS smallest unit)
    publicKey: 'pk_live_a9e86ee55c4a014e1affce905ad59f11d9fe3bce',
    currency: 'GHS',
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handleBookingSubmit = async () => {
    if (!startDate || !endDate || !user) {
      toast({
        title: "Missing Information",
        description: "Please select start and end dates.",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = calculateTotal();
    if (totalAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please check your booking dates and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use backend API instead of Supabase
      const bookingData = {
        billboardId: billboard.id,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        message: message || null
      };

      console.log('Submitting booking request:', bookingData);
      await apiClient.createBookingRequest(bookingData);

      toast({
        title: "Booking Request Submitted!",
        description: "Your booking request has been sent to the billboard owner for approval. You'll be notified once approved.",
      });
      
      onClose();
      
    } catch (error: any) {
      console.error('Booking submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onPaymentSuccess = async (reference: any) => {
    setLoading(false);
    toast({
      title: "Payment Successful!",
      description: `Your booking has been confirmed. Reference: ${reference.reference}`,
    });
    
    // Update booking status to paid using backend API
    try {
      // Note: This would need to be implemented in the backend API
      // For now, we'll just show success message
      console.log('Payment successful, reference:', reference.reference);
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
    
    onClose();
  };

  const onPaymentClose = () => {
    setLoading(false);
    toast({
      title: "Payment Cancelled",
      description: "Your booking request was saved and is pending owner approval.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book Billboard</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">{billboard.name}</h3>
            <p className="text-sm text-muted-foreground">{billboard.location}</p>
            <p className="text-sm font-medium">GH₵{billboard.price_per_day || billboard.price}/day</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date < (startDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Message (Optional)</Label>
              <Textarea
                placeholder="Add a message to the billboard owner..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {startDate && endDate && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-lg font-bold text-primary">
                    GHS {calculateTotal().toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleBookingSubmit} 
              disabled={!startDate || !endDate || loading}
              className="flex-1"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;