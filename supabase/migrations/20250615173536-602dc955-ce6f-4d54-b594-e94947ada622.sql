-- Enable Row Level Security on booking_requests if not already enabled
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for billboard owners to view booking requests for their billboards
CREATE POLICY "billboard_owners_can_view_requests" ON public.booking_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.billboards 
    WHERE billboards.id = booking_requests.billboard_id 
    AND billboards.owner_id = auth.uid()
  )
);

-- Create policy for billboard owners to update booking requests for their billboards
CREATE POLICY "billboard_owners_can_update_requests" ON public.booking_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.billboards 
    WHERE billboards.id = booking_requests.billboard_id 
    AND billboards.owner_id = auth.uid()
  )
);

-- Create policy for advertisers to view their own booking requests
CREATE POLICY "advertisers_can_view_own_requests" ON public.booking_requests
FOR SELECT
USING (advertiser_id = auth.uid());

-- Create policy for advertisers to insert their own booking requests
CREATE POLICY "advertisers_can_insert_own_requests" ON public.booking_requests
FOR INSERT
WITH CHECK (advertiser_id = auth.uid());

-- Create policy for advertisers to update their own booking requests (for payment status)
CREATE POLICY "advertisers_can_update_own_requests" ON public.booking_requests
FOR UPDATE
USING (advertiser_id = auth.uid());