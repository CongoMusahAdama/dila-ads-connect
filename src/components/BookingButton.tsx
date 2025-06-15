import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import BookingModal from "./BookingModal";

interface BookingButtonProps {
  billboard: {
    id: string;
    title: string;
    price: number;
  } | null;
}

const BookingButton = ({ billboard }: BookingButtonProps) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsBookingModalOpen(true);
  };

  return (
    <>
      <Button className="flex-1" onClick={handleBookNow}>
        Book Now
      </Button>
      
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        billboard={billboard}
      />
    </>
  );
};

export default BookingButton;