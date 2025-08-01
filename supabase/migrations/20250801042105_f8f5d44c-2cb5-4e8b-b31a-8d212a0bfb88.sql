-- Create quotes table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read quotes (public data)
CREATE POLICY "Anyone can view quotes" 
ON public.quotes 
FOR SELECT 
USING (true);

-- Insert sample quotes
INSERT INTO public.quotes (quote_text) VALUES
('The secret of getting ahead is getting started.'),
('Your limitation—it''s only your imagination.'),
('Great things never come from comfort zones.'),
('Dream it. Wish it. Do it.'),
('Success doesn''t just find you. You have to go out and get it.'),
('The harder you work for something, the greater you''ll feel when you achieve it.'),
('Dream bigger. Do bigger.'),
('Don''t stop when you''re tired. Stop when you''re done.'),
('Wake up with determination. Go to bed with satisfaction.'),
('Do something today that your future self will thank you for.'),
('Little things make big days.'),
('It''s going to be hard, but hard does not mean impossible.'),
('Don''t wait for opportunity. Create it.'),
('Sometimes we''re tested not to show our weaknesses, but to discover our strengths.'),
('The key to success is to focus on goals, not obstacles.');