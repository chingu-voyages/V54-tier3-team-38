import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux"; // or your custom store
import { api } from "@/api/client";
import { Asset } from "@/types/asset";

export function useAssets() {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: async () => {
      const response = await api.get<Asset[]>("/api/assets/");
      return response.data;
    },
  });

  useEffect(() => {
    if (data) {
      dispatch({ type: "VIEW_ASSET", payload: data });
    }
  }, [data, dispatch]);

  return {
    assets: data ?? [],
    isLoading,
    error,
  };
}
