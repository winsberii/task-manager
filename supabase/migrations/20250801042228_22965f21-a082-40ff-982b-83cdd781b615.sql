-- Create a better random quote function that truly randomizes selection
CREATE OR REPLACE FUNCTION public.get_random_quote()
RETURNS TABLE(id UUID, quote_text TEXT, created_at TIMESTAMP WITH TIME ZONE)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT quotes.id, quotes.quote_text, quotes.created_at
  FROM public.quotes
  ORDER BY RANDOM()
  LIMIT 1;
$$;