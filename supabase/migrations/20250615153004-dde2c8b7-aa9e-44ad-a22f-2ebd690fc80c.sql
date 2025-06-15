-- Add contact information to billboards table
ALTER TABLE public.billboards 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create booking_requests table if it doesn't exist with proper structure
DO $$ 
BEGIN
    -- Check if we need to add any missing columns to booking_requests
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'booking_requests' AND column_name = 'start_date') THEN
        -- The table structure looks complete based on the schema, but let's ensure RLS is enabled
        ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies for booking requests
        CREATE POLICY "Users can view their own booking requests" 
        ON public.booking_requests 
        FOR SELECT 
        USING (advertiser_id = auth.uid());
        
        CREATE POLICY "Users can create their own booking requests" 
        ON public.booking_requests 
        FOR INSERT 
        WITH CHECK (advertiser_id = auth.uid());
        
        CREATE POLICY "Billboard owners can view requests for their billboards" 
        ON public.booking_requests 
        FOR SELECT 
        USING (EXISTS (
            SELECT 1 FROM public.billboards 
            WHERE billboards.id = booking_requests.billboard_id 
            AND billboards.owner_id = auth.uid()
        ));
        
        CREATE POLICY "Billboard owners can update requests for their billboards" 
        ON public.booking_requests 
        FOR UPDATE 
        USING (EXISTS (
            SELECT 1 FROM public.billboards 
            WHERE billboards.id = booking_requests.billboard_id 
            AND billboards.owner_id = auth.uid()
        ));
    END IF;
END $$;

-- Enable RLS on billboards if not already enabled
ALTER TABLE public.billboards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for billboards
DO $$
BEGIN
    -- Allow everyone to view available billboards
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billboards' AND policyname = 'Anyone can view available billboards') THEN
        CREATE POLICY "Anyone can view available billboards"
        ON public.billboards
        FOR SELECT
        USING (is_available = true);
    END IF;
    
    -- Allow owners to view their own billboards
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billboards' AND policyname = 'Owners can view their own billboards') THEN
        CREATE POLICY "Owners can view their own billboards"
        ON public.billboards
        FOR SELECT
        USING (owner_id = auth.uid());
    END IF;
    
    -- Allow owners to insert their own billboards
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billboards' AND policyname = 'Owners can insert their own billboards') THEN
        CREATE POLICY "Owners can insert their own billboards"
        ON public.billboards
        FOR INSERT
        WITH CHECK (owner_id = auth.uid());
    END IF;
    
    -- Allow owners to update their own billboards
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billboards' AND policyname = 'Owners can update their own billboards') THEN
        CREATE POLICY "Owners can update their own billboards"
        ON public.billboards
        FOR UPDATE
        USING (owner_id = auth.uid());
    END IF;
END $$;