
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import BookingsList from "./BookingsList";

const MyBookingsModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <span>My Bookings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My Bookings</DialogTitle>
          <DialogDescription>
            View and manage all your billboard booking requests.
          </DialogDescription>
        </DialogHeader>
        <BookingsList />
      </DialogContent>
    </Dialog>
  );
};

export default MyBookingsModal;
