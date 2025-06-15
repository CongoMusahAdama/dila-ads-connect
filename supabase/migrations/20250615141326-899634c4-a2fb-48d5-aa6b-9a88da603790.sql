-- Create storage bucket for billboard images
INSERT INTO storage.buckets (id, name, public) VALUES ('billboard-images', 'billboard-images', true);

-- Create policies for billboard image uploads
CREATE POLICY "Anyone can view billboard images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'billboard-images');

CREATE POLICY "Authenticated users can upload billboard images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'billboard-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own billboard images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'billboard-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own billboard images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'billboard-images' AND auth.uid() IS NOT NULL);