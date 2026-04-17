import { useQuery } from "@tanstack/react-query";
import { apiFetch, getSelectedProgram } from "@/lib/api";

export function usePrograms() {
  return useQuery({
    queryKey: ["programs"],
    queryFn: () => apiFetch<{ programs: any[] }>("/api/v1/programs/"),
    staleTime: 60000,
  });
}

export function usePollingQuery<T>(key: string[], path: string, params?: Record<string, string | number | boolean | undefined>, enabled = true) {
  const programId = getSelectedProgram();
  return useQuery<T>({
    queryKey: [...key, programId, params],
    queryFn: () => apiFetch<T>(path, { query: { program_id: programId, ...params } }),
    enabled: !!programId && enabled,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => apiFetch<{ status: string; db: string; version?: string }>("/api/v1/health"),
    retry: 1,
    staleTime: 30000,
  });
}
