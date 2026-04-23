import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchItems,
  fetchItemById,
  createItem,
  updateItemStatus,
  deleteItem,
  uploadItemPhoto,
  type ItemFilters,
} from '@/lib/supabase-data';
import type { Item, ItemStatus } from '@/lib/constants';

export function useItems(filters: ItemFilters = {}) {
  return useQuery({
    queryKey: ['items', filters],
    queryFn: () => fetchItems(filters),
  });
}

export function useItem(id: string | undefined) {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => (id ? fetchItemById(id) : null),
    enabled: !!id,
  });
}

export function useCreateItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      item,
      photoFiles,
    }: {
      item: Omit<Item, 'id' | 'createdAt' | 'status' | 'photos'>;
      photoFiles: File[];
    }) => {
      // Upload photos first
      const photoUrls = await Promise.all(photoFiles.map(uploadItemPhoto));
      return createItem({ ...item, photos: photoUrls });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

export function useUpdateItemStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ItemStatus }) =>
      updateItemStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
