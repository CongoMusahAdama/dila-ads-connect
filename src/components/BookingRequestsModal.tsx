import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const BookingRequestsModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">View All Requests</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Booking Requests</DialogTitle>
          <DialogDescription>
            Manage incoming booking requests for your billboards.
          </DialogDescription>
        </DialogHeader>
        <div className="text-center py-8 text-muted-foreground">
          No booking requests found.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingRequestsModal;