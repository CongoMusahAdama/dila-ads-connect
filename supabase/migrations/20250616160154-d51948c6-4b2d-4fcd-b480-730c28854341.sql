

-- Create admin table for admin users
CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advertiser_id UUID REFERENCES auth.users NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add approval status to billboards table
ALTER TABLE public.billboards 
ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT false;

-- Add dispute tracking to booking_requests
ALTER TABLE public.booking_requests 
ADD COLUMN has_dispute BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN dispute_reason TEXT,
ADD COLUMN dispute_status TEXT DEFAULT NULL;

-- Enable RLS on new tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admins table
CREATE POLICY "Admins can view admin records" 
  ON public.admins 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Create RLS policies for complaints table
CREATE POLICY "Advertisers can view their own complaints" 
  ON public.complaints 
  FOR SELECT 
  USING (advertiser_id = auth.uid());

CREATE POLICY "Advertisers can create complaints" 
  ON public.complaints 
  FOR INSERT 
  WITH CHECK (advertiser_id = auth.uid());

CREATE POLICY "Admins can view all complaints" 
  ON public.complaints 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE user_id = auth.uid()
    )
  );

-- Insert admin user (this will be done after the user is created)
-- We'll handle this in the application code

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.user_id = $1
  );
$$;

-- Update trigger for complaints
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

