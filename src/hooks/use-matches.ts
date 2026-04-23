import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMatches, updateMatchStatus } from '@/lib/supabase-data';

export function useMatches(itemId?: string) {
  return useQuery({
    queryKey: ['matches', itemId ?? 'all'],
    queryFn: () => fetchMatches(itemId),
  });
}

export function useUpdateMatchStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'accepted' | 'dismissed' }) =>
      updateMatchStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}
