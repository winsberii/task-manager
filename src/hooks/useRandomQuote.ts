import { useQuery } from '@tanstack/react-query';
import { quoteService, type Quote } from '@/services/quoteService';

export const useRandomQuote = () => {
  return useQuery({
    queryKey: ['randomQuote'],
    queryFn: quoteService.getRandomQuote,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export type { Quote };