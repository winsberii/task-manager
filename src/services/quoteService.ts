import { supabase } from "@/integrations/supabase/client";

export interface Quote {
  id: string;
  quote_text: string;
  created_at: string;
}

export const quoteService = {
  async getRandomQuote(): Promise<Quote | null> {
    try {
      // Get a random quote by ordering randomly and taking the first one
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false }) // This will be randomized by the SQL function
        .limit(1);

      if (error) {
        console.error('Error fetching random quote:', error);
        return null;
      }

      // If we have quotes, pick a random one from the result
      if (data && data.length > 0) {
        // Use Math.random() to pick a random quote from the available quotes
        const randomIndex = Math.floor(Math.random() * data.length);
        return data[randomIndex];
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