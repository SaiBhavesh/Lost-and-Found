import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClaims, createClaim, updateClaimStatus } from '@/lib/supabase-data';

export function useClaims(itemId?: string) {
  return useQuery({
    queryKey: ['claims', itemId ?? 'all'],
    queryFn: () => fetchClaims(itemId),
  });
}

export function useCreateClaim() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createClaim,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

export function useUpdateClaimStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, reviewedBy }: { id: string; status: 'approved' | 'rejected'; reviewedBy: string }) =>
      updateClaimStatus(id, status, reviewedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}
