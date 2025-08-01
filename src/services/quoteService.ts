import { supabase } from "@/integrations/supabase/client";

export interface Quote {
  id: string;
  quote_text: string;
  created_at: string;
}

export const quoteService = {
  async getRandomQuote(): Promise<Quote | null> {
    try {
      // Use the database function to get a truly random quote
      const { data, error } = await supabase.rpc('get_random_quote');

      if (error) {
        console.error('Error fetching random quote:', error);
        return null;
      }

      // The function returns an array, so get the first (and only) result
      if (data && data.length > 0) {
        return data[0];
      }

      return null;
    } catch (error) {
      console.error('Error fetching random quote:', error);
      return null;
    }
  },

  async getAllQuotes(): Promise<Quote[]> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching quotes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
  }
};