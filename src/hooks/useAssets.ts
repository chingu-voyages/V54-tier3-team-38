import { api } from '@api/client';
import { useQuery } from '@tanstack/react-query';
import { Asset } from '@/types/asset';


export function useAssets() {
  const { data, isLoading, error } = useQuery<Asset[]>({
    queryKey: ['assets'],
    queryFn: async () => {
      const response = await api.get<Asset[]>('/api/assets/');
      return response.data;
    },
  });

  return {
    assets: data ?? [],
    isLoading,
    error,
  };
}

export default useAssets;
