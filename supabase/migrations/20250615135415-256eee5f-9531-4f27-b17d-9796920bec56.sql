-- Create billboards table
CREATE TABLE public.billboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  size TEXT NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create booking_requests table
CREATE TABLE public.booking_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  billboard_id UUID NOT NULL REFERENCES public.billboards(id) ON DELETE CASCADE,
  advertiser_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT,
  response_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.billboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for billboards
CREATE POLICY "Billboard owners can view their own billboards" 
ON public.billboards 
FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Everyone can view available billboards" 
ON public.billboards 
FOR SELECT 
USING (is_available = true);

CREATE POLICY "Billboard owners can insert their own billboards" 
ON public.billboards 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Billboard owners can update their own billboards" 
ON public.billboards 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Billboard owners can delete their own billboards" 
ON public.billboards 
FOR DELETE 
USING (auth.uid() = owner_id);

-- Create policies for booking_requests
CREATE POLICY "Advertisers can view their own booking requests" 
ON public.booking_requests 
FOR SELECT 
USING (auth.uid() = advertiser_id);

CREATE POLICY "Billboard owners can view requests for their billboards" 
ON public.booking_requests 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT owner_id FROM public.billboards WHERE id = billboard_id
  )
);

CREATE POLICY "Advertisers can insert booking requests" 
ON public.booking_requests 
FOR INSERT 
WITH CHECK (auth.uid() = advertiser_id);

CREATE POLICY "Billboard owners can update requests for their billboards" 
ON public.booking_requests 
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT owner_id FROM public.billboards WHERE id = billboard_id
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_billboards_updated_at
BEFORE UPDATE ON public.billboards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_booking_requests_updated_at
BEFORE UPDATE ON public.booking_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();